/* =========================================================================
   Minimal, dependency-free .docx (Word) generator.
   A .docx is a ZIP archive of XML parts. We build a valid ZIP with the
   "store" (no-compression) method and hand-assemble the minimal Word parts.
   No build step, no libraries — works from a plain <script> tag.
   ========================================================================= */

/* ---------- CRC-32 (needed for valid ZIP entries) ---------- */

const DOCX_CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function docxCrc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ DOCX_CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/* ---------- tiny store-only ZIP writer ---------- */

function docxZip(files) {
  const enc = new TextEncoder();
  const parts = [];              // Uint8Array chunks in output order
  const central = [];            // central-directory records
  let offset = 0;

  const pushBytes = arr => { parts.push(arr); offset += arr.length; };
  const u16 = n => new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
  const u32 = n => new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
  const concat = list => {
    let len = 0; list.forEach(a => (len += a.length));
    const out = new Uint8Array(len); let p = 0;
    list.forEach(a => { out.set(a, p); p += a.length; });
    return out;
  };

  const DOS_TIME = u16(0);
  const DOS_DATE = u16(0x21); // 1980-01-01

  files.forEach(f => {
    const nameBytes = enc.encode(f.name);
    const data = typeof f.data === "string" ? enc.encode(f.data) : f.data;
    const crc = docxCrc32(data);
    const localOffset = offset;

    // local file header
    pushBytes(concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), DOS_TIME, DOS_DATE,
      u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0), nameBytes
    ]));
    pushBytes(data);

    // central directory record (emitted after all locals)
    central.push(concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), DOS_TIME, DOS_DATE,
      u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(localOffset), nameBytes
    ]));
  });

  const cdStart = offset;
  central.forEach(pushBytes);
  const cdSize = offset - cdStart;

  pushBytes(concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(cdSize), u32(cdStart), u16(0)
  ]));

  return concat(parts);
}

/* ---------- Word XML helpers ---------- */

function docxXmlEsc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
}

/* Turn a possibly-multiline string into the inner content of a <w:r> run,
   preserving spaces and converting newlines to line breaks. */
function docxRunContent(text) {
  return String(text).split(/\r?\n/).map((line, i) =>
    (i ? "<w:br/>" : "") + '<w:t xml:space="preserve">' + docxXmlEsc(line) + "</w:t>"
  ).join("");
}

function docxHeading(text, style) {
  return '<w:p><w:pPr><w:pStyle w:val="' + style + '"/></w:pPr>' +
    "<w:r><w:t xml:space=\"preserve\">" + docxXmlEsc(text) + "</w:t></w:r></w:p>";
}

function docxLabelValue(label, value) {
  return "<w:p>" +
    '<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">' + docxXmlEsc(label) + ": </w:t></w:r>" +
    "<w:r>" + docxRunContent(value) + "</w:r>" +
    "</w:p>";
}

function docxSubtle(text) {
  return "<w:p><w:pPr><w:spacing w:after=\"240\"/></w:pPr>" +
    '<w:r><w:rPr><w:i/><w:color w:val="5B6577"/></w:rPr><w:t xml:space="preserve">' +
    docxXmlEsc(text) + "</w:t></w:r></w:p>";
}

/* ---------- assemble the document ---------- */

const DOCX_CONTENT_TYPES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
  '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
  "</Types>";

const DOCX_ROOT_RELS =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
  "</Relationships>";

const DOCX_DOC_RELS =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
  "</Relationships>";

const DOCX_STYLES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
  '<w:docDefaults><w:rPrDefault><w:rPr>' +
  '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/>' +
  "</w:rPr></w:rPrDefault></w:docDefaults>" +
  '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/>' +
  '<w:pPr><w:spacing w:after="60" w:line="276" w:lineRule="auto"/></w:pPr></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/>' +
  '<w:pPr><w:spacing w:after="60"/></w:pPr>' +
  '<w:rPr><w:b/><w:color w:val="16213C"/><w:sz w:val="44"/><w:szCs w:val="44"/></w:rPr></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/>' +
  '<w:pPr><w:spacing w:before="280" w:after="80"/></w:pPr>' +
  '<w:rPr><w:b/><w:color w:val="2456D6"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>' +
  "</w:styles>";

/* sections: [{ title, lines: [{ label, value }] }] */
function buildJobOrderDocx(title, dateStr, sections) {
  let body = docxHeading("Job Order: " + title, "Title");
  body += docxSubtle("Intake completed " + dateStr);

  if (!sections.length) {
    body += docxLabelValue("Status", "No details captured yet");
  }
  sections.forEach(sec => {
    body += docxHeading(sec.title, "Heading1");
    if (sec.text) {
      /* free-text section (notes / pasted JD): blank lines split paragraphs */
      String(sec.text).split(/\n{2,}/).forEach(para => {
        body += "<w:p><w:r>" + docxRunContent(para) + "</w:r></w:p>";
      });
      return;
    }
    (sec.lines || []).forEach(l => { body += docxLabelValue(l.label, l.value); });
  });

  const documentXml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    "<w:body>" + body +
    '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/>' +
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>' +
    "</w:sectPr></w:body></w:document>";

  return docxZip([
    { name: "[Content_Types].xml", data: DOCX_CONTENT_TYPES },
    { name: "_rels/.rels", data: DOCX_ROOT_RELS },
    { name: "word/document.xml", data: documentXml },
    { name: "word/_rels/document.xml.rels", data: DOCX_DOC_RELS },
    { name: "word/styles.xml", data: DOCX_STYLES }
  ]);
}
