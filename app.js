/* =========================================================================
   Digital & Marketing Job Order Intake — render engine + role-aware state
   ---------------------------------------------------------------------------
   Step 1 picks a role. The role drives focus areas, deep dives, tech-stack
   categories, success metrics, candidate backgrounds, and the targeting
   profile. Config lives in roles.js; this engine is generic.
   ========================================================================= */

const STORAGE_KEY = "digital-jo-intake-v1";

/* ---------- state ----------
   common: role-agnostic step answers (shared across roles)
   roles[roleId]: { stack, success, areas, deepDives } — namespaced per role
   so switching roles never clobbers another role's answers. */

function defaultState() {
  return {
    roleId: null,
    common: { basics: {}, logistics: {}, team: {}, closing: {} },
    roles: {},
    notes: { pretext: "", live: "", pretextH: null, liveH: null }
  };
}

let state = loadState();
let currentStep = 0;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.common) {
      const base = defaultState();
      base.roleId = saved.roleId || null;
      base.common = Object.assign(base.common, saved.common || {});
      base.roles = saved.roles || {};
      base.notes = Object.assign(base.notes, saved.notes || {});
      return base;
    }
  } catch (e) { /* corrupted — start fresh */ }
  return defaultState();
}

let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 200);
}
function flushSave() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}
/* Flush any pending debounced save before the page goes away, so a quick
   reload or tab close never drops the last edit. */
window.addEventListener("pagehide", flushSave);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushSave();
});

/* ---------- role helpers ---------- */

function activeRole() { return state.roleId ? ROLES[state.roleId] : null; }

function ensureRole(id) {
  if (!id) return null;
  if (!state.roles[id]) state.roles[id] = { stack: {}, success: {}, areas: {}, deepDives: {} };
  const r = state.roles[id];
  (ROLES[id].focusAreas || []).forEach(a => {
    if (!r.areas[a.id]) r.areas[a.id] = { priority: "skip", pct: 0 };
    if (!r.deepDives[a.id]) r.deepDives[a.id] = {};
  });
  return r;
}

function roleState() { return ensureRole(state.roleId); }

/* Used by tip functions in roles.js */
function areaPriority(s, areaId) {
  if (!s.roleId || !s.roles[s.roleId]) return "skip";
  return (s.roles[s.roleId].areas[areaId] || {}).priority || "skip";
}

/* ---------- wizard structure ---------- */

function wizardSteps() {
  return [
    { kind: "basics" },
    { kind: "config", key: "logistics" },
    { kind: "config", key: "team" },
    { kind: "allocator" },
    { kind: "deepdives" },
    { kind: "config", key: "stack" },
    { kind: "config", key: "success" },
    { kind: "config", key: "closing" },
    { kind: "review" }
  ];
}

function stepTitle(w) {
  if (w.kind === "basics") return "Role & Basics";
  if (w.kind === "allocator") return "Focus Areas & % of Time";
  if (w.kind === "deepdives") return "Deep Dives";
  if (w.kind === "review") return "Review & Export";
  return { logistics: "Logistics & Budget", team: "Team Structure",
           stack: "Tech Stack & AI", success: "Success & Candidate", closing: "Closing" }[w.key];
}

/* Build the {title, subtitle, coach, questions, tips, answers} definition for
   a config-style step. Role-dependent option lists are injected here so both
   rendering and summary collection use identical question sets. */
function configStepDef(key) {
  const role = activeRole();
  if (key === "logistics") return Object.assign({}, COMMON.logistics, { answers: state.common.logistics });
  if (key === "closing")   return Object.assign({}, COMMON.closing,   { answers: state.common.closing });
  if (key === "team") {
    const qs = COMMON.team.questions.map(q =>
      q.id === "specialists" ? Object.assign({}, q, { options: role ? role.specialists.map(s => s.label) : [] }) : q);
    return { title: COMMON.team.title, subtitle: COMMON.team.subtitle, questions: qs,
             tips: COMMON.team.tips, answers: state.common.team };
  }
  if (key === "stack") {
    if (!role) return null;
    const questions = role.stackCategories.map(c => ({ id: c.id, type: "text", label: c.label, placeholder: c.placeholder }))
      .concat([
        { id: "ai_usage", type: "chips", label: "How are you currently using AI in this function?", options: role.aiUseCases },
        { id: "ai_requirement", type: "radio", label: "Is AI experience preferred or required?",
          options: ["Required", "Preferred", "Not important"] }
      ]);
    return {
      title: "Tech Stack & AI", subtitle: "Ask them to list every tool they use.",
      questions,
      tips: [{ when: a => a.ai_requirement === "Required" && (a.ai_usage || []).length === 0,
        text: "AI experience is 'required' but they couldn't name current AI use cases — clarify what AI skill they'd actually test for." }],
      answers: roleState().stack
    };
  }
  if (key === "success") {
    if (!role) return null;
    return {
      title: "Success & Ideal Candidate", subtitle: "How will this person be measured, and who fits?",
      questions: [
        { id: "metrics", type: "chips", label: "How will this person be measured?", options: role.metrics },
        { id: "success_6_12", type: "textarea", label: "What does success look like after 6–12 months?",
          placeholder: "Concrete outcomes the client will judge this hire on" },
        { id: "background", type: "chips", label: "Would the ideal candidate come from…", options: role.backgrounds },
        { id: "years_experience", type: "select", label: "Years of experience?", options: ["1–3", "3–5", "5–8", "8–12", "12+"] },
        { id: "industry_required", type: "radio", label: "Is industry experience required?",
          options: ["Required", "Preferred", "Not important"] },
        { id: "industry_which", type: "text", label: "Which industry?", placeholder: "e.g., healthcare SaaS",
          showIf: a => a.industry_required === "Required" || a.industry_required === "Preferred" },
        { id: "soft_skills", type: "textarea", label: "Soft skills?",
          placeholder: "Communication with execs, cross-functional collaboration, autonomy…" },
        { id: "non_negotiables", type: "textarea", label: "Non-negotiables",
          placeholder: "Hard dealbreakers — location, tools, work authorization, portfolio…" }
      ],
      tips: [{ when: a => (a.metrics || []).length > 6,
        text: "More than six success metrics usually means the client hasn't decided what this role is for. Ask which ONE metric gets this person a great review." }],
      answers: roleState().success
    };
  }
  return null;
}

/* ---------- DOM + rendering utilities ---------- */

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderQuestions(container, questions, answers, scopeId, onChange) {
  const wrappers = {};

  questions.forEach(q => {
    const wrap = el("div", "question");
    wrappers[q.id] = wrap;
    wrap.appendChild(el("label", "q-label", esc(q.label)));
    if (q.help) wrap.appendChild(el("p", "q-help", esc(q.help)));

    const name = scopeId + "__" + q.id;
    const val = answers[q.id];

    if (q.type === "text" || q.type === "number") {
      const input = el("input");
      input.type = q.type;
      input.placeholder = q.placeholder || "";
      input.value = val != null ? val : "";
      input.addEventListener("input", () => { answers[q.id] = input.value; changed(); });
      wrap.appendChild(input);
    } else if (q.type === "textarea") {
      const ta = el("textarea");
      ta.placeholder = q.placeholder || "";
      ta.rows = 3;
      ta.value = val || "";
      ta.addEventListener("input", () => { answers[q.id] = ta.value; changed(); });
      wrap.appendChild(ta);
    } else if (q.type === "select") {
      const sel = el("select");
      sel.appendChild(el("option", null, "— select —"));
      q.options.forEach(o => {
        const opt = el("option", null, esc(o));
        opt.value = o;
        if (val === o) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", () => {
        answers[q.id] = sel.selectedIndex === 0 ? undefined : sel.value;
        changed();
      });
      wrap.appendChild(sel);
    } else if (q.type === "radio") {
      const group = el("div", "seg-group");
      q.options.forEach(o => {
        const lab = el("label", "seg");
        const input = el("input");
        input.type = "radio"; input.name = name; input.value = o;
        if (val === o) input.checked = true;
        input.addEventListener("change", () => { answers[q.id] = o; changed(); });
        lab.appendChild(input);
        lab.appendChild(el("span", null, esc(o)));
        group.appendChild(lab);
      });
      wrap.appendChild(group);
    } else if (q.type === "chips") {
      const group = el("div", "chip-group");
      if (!Array.isArray(answers[q.id])) answers[q.id] = [];
      q.options.forEach(o => {
        const lab = el("label", "chip");
        const input = el("input");
        input.type = "checkbox";
        input.checked = answers[q.id].includes(o);
        input.addEventListener("change", () => {
          const cur = answers[q.id] || (answers[q.id] = []);
          if (input.checked) { if (!cur.includes(o)) cur.push(o); }
          else answers[q.id] = cur.filter(x => x !== o);
          changed();
        });
        lab.appendChild(input);
        lab.appendChild(el("span", null, esc(o)));
        group.appendChild(lab);
      });
      wrap.appendChild(group);
    }

    container.appendChild(wrap);
  });

  function updateVisibility() {
    questions.forEach(q => {
      if (!q.showIf) return;
      wrappers[q.id].classList.toggle("hidden", !q.showIf(answers, state));
    });
  }
  function changed() { updateVisibility(); saveState(); if (onChange) onChange(); }
  updateVisibility();
}

function renderTips(container, rules, answers) {
  container.innerHTML = "";
  (rules || []).forEach(rule => {
    let show = false;
    try { show = !!rule.when(answers, state); } catch (e) {}
    if (show) container.appendChild(el("div", "tip", "💡 " + esc(rule.text)));
  });
}

function renderConfigLike(main, def) {
  main.appendChild(el("h2", null, esc(def.title)));
  if (def.subtitle) main.appendChild(el("p", "subtitle", esc(def.subtitle)));
  if (def.coach) main.appendChild(el("div", "coach", "🎯 " + esc(def.coach)));

  const qContainer = el("div", "questions");
  const tipsContainer = el("div", "tips");
  main.appendChild(qContainer);
  main.appendChild(tipsContainer);

  const refresh = () => renderTips(tipsContainer, def.tips, def.answers);
  renderQuestions(qContainer, def.questions, def.answers, def.title, refresh);
  refresh();
}

/* ---------- step 1: role picker + basics ---------- */

function renderBasics(main) {
  main.appendChild(el("h2", null, "Role & Basic Information"));
  main.appendChild(el("p", "subtitle", "Pick the role — it tailors the rest of the intake — then capture the basics."));

  const pickerWrap = el("div", "picker-wrap");
  pickerWrap.appendChild(el("div", "q-label", "Which role is this job order for?"));
  const grid = el("div", "role-grid");
  ROLE_ORDER.forEach(id => {
    const r = ROLES[id];
    const card = el("button", "role-card" + (state.roleId === id ? " selected" : ""));
    card.innerHTML =
      "<span class='role-icon'>" + r.icon + "</span>" +
      "<span class='role-label'>" + esc(r.label) + "</span>" +
      "<span class='role-tag'>" + esc(r.tagline) + "</span>";
    card.addEventListener("click", () => { state.roleId = id; ensureRole(id); saveState(); render(); });
    grid.appendChild(card);
  });
  pickerWrap.appendChild(grid);
  main.appendChild(pickerWrap);

  if (state.roleId) {
    main.appendChild(el("div", "role-note",
      ROLES[state.roleId].icon + " <strong>" + esc(ROLES[state.roleId].label) + "</strong> selected — the Focus Areas, Deep Dives, Tech Stack, and Success steps are now tailored to it."));
  }

  main.appendChild(el("hr", "divider"));

  if (COMMON.basics.coach) main.appendChild(el("div", "coach", "🎯 " + esc(COMMON.basics.coach)));
  const qContainer = el("div", "questions");
  const tipsContainer = el("div", "tips");
  main.appendChild(qContainer);
  main.appendChild(tipsContainer);
  const refresh = () => renderTips(tipsContainer, COMMON.basics.tips, state.common.basics);
  renderQuestions(qContainer, COMMON.basics.questions, state.common.basics, "basics", refresh);
  refresh();
}

/* ---------- role-required guard ---------- */

function needsRoleNotice(main, what) {
  main.appendChild(el("h2", null, what));
  const notice = el("div", "tip warn",
    "⚠️ Pick a role on the first step to load the tailored " + what.toLowerCase() + ".");
  main.appendChild(notice);
  const btn = el("button", "btn primary", "← Go to Role & Basics");
  btn.addEventListener("click", () => { currentStep = 0; render(); });
  main.appendChild(el("div", "actions")).appendChild(btn);
}

/* ---------- focus-area allocator ---------- */

function renderAllocatorStep(main) {
  const role = activeRole();
  if (!role) return needsRoleNotice(main, "Focus Areas & % of Time");

  main.appendChild(el("h2", null, "Focus Areas & % of Time"));
  main.appendChild(el("p", "subtitle", role.timePrompt));
  main.appendChild(el("div", "coach", "🎯 " + esc(role.blurb)));

  const areas = role.focusAreas;
  const table = el("div", "allocator");
  const head = el("div", "alloc-row alloc-head");
  head.appendChild(el("div", "alloc-name", "Function"));
  head.appendChild(el("div", "alloc-priority", "Priority"));
  head.appendChild(el("div", "alloc-pct", "% of time"));
  table.appendChild(head);

  const rs = roleState();
  areas.forEach(area => {
    const a = rs.areas[area.id];
    const row = el("div", "alloc-row");
    row.appendChild(el("div", "alloc-name", area.icon + " " + esc(area.label)));

    const prio = el("div", "alloc-priority seg-group compact");
    [["must", "Must have"], ["nice", "Nice to have"], ["skip", "—"]].forEach(([valKey, labelTxt]) => {
      const lab = el("label", "seg");
      const input = el("input");
      input.type = "radio"; input.name = "prio__" + area.id;
      input.checked = a.priority === valKey;
      input.addEventListener("change", () => {
        a.priority = valKey;
        if (valKey === "skip") a.pct = 0;
        pctInput.value = a.pct || "";
        pctInput.disabled = valKey === "skip";
        changed();
      });
      lab.appendChild(input);
      lab.appendChild(el("span", null, labelTxt));
      prio.appendChild(lab);
    });
    row.appendChild(prio);

    const pctWrap = el("div", "alloc-pct");
    const pctInput = el("input");
    pctInput.type = "number"; pctInput.min = 0; pctInput.max = 100; pctInput.step = 5;
    pctInput.placeholder = "%"; pctInput.value = a.pct || "";
    pctInput.disabled = a.priority === "skip";
    pctInput.addEventListener("input", () => {
      a.pct = Math.max(0, Math.min(100, parseInt(pctInput.value, 10) || 0));
      changed();
    });
    pctWrap.appendChild(pctInput);
    row.appendChild(pctWrap);
    table.appendChild(row);
  });
  main.appendChild(table);

  const totalBar = el("div", "total-bar");
  const totalFill = el("div", "total-fill");
  totalBar.appendChild(totalFill);
  const totalLabel = el("p", "total-label");
  main.appendChild(totalBar);
  main.appendChild(totalLabel);

  const guidance = el("div", "tips");
  main.appendChild(guidance);
  const profileCard = el("div");
  main.appendChild(profileCard);

  function changed() { saveState(); refresh(); }
  function refresh() {
    const active = areas.filter(a => rs.areas[a.id].priority !== "skip");
    const musts = areas.filter(a => rs.areas[a.id].priority === "must");
    const total = active.reduce((sum, a) => sum + (rs.areas[a.id].pct || 0), 0);

    totalFill.style.width = Math.min(total, 100) + "%";
    totalFill.classList.toggle("over", total > 100);
    totalFill.classList.toggle("good", total === 100);
    totalLabel.textContent = "Total allocated: " + total + "% " +
      (total === 100 ? "✓" : total > 100 ? "(over 100 — trim it back)" : "(aim for 100%)");

    guidance.innerHTML = "";
    if (musts.length > 3) {
      guidance.appendChild(el("div", "tip warn",
        "⚠️ " + musts.length + " must-haves selected. Push the client to pick their top 3 — every additional must-have shrinks the candidate pool. Ask: “If a candidate had everything except one of these, which would you drop?”"));
    } else if (musts.length > 0 && musts.length < 3 && active.length >= 3) {
      guidance.appendChild(el("div", "tip",
        "💡 Aim for about 3 must-haves and up to 3 nice-to-haves — that gives recruiters a clear target."));
    }
    const mustPct = musts.reduce((sum, a) => sum + (rs.areas[a.id].pct || 0), 0);
    if (musts.length >= 2 && total > 0 && mustPct < 60) {
      guidance.appendChild(el("div", "tip warn",
        "⚠️ Must-haves only account for " + mustPct + "% of the week. Best practice: must-haves should cover 70–80% of their time. Revisit priorities or percentages."));
    }
    renderProfileCard(profileCard);
  }
  refresh();
}

function computeProfile() {
  const role = activeRole();
  if (!role) return null;
  const rs = roleState();
  const musts = role.focusAreas.filter(a => rs.areas[a.id].priority === "must").map(a => a.id);
  if (musts.length === 0) return null;
  if (musts.length >= 5) {
    return { profile: "Unicorn alert 🦄",
      detail: musts.length + " must-have areas means you're hunting a generalist who is elite at everything. These candidates are extremely rare. Recommend prioritizing before the search starts — or resetting the budget expectation upward." };
  }
  for (const rule of role.profileRules) {
    if (rule.must.every(id => musts.includes(id))) return rule;
  }
  const labels = musts.map(id => role.focusAreas.find(a => a.id === id).label);
  return { profile: "Custom profile: " + labels.join(" + "),
    detail: "Recruit around demonstrated results in " + labels.join(", ") + ". Ask candidates how their week actually breaks down and match it to the client's percentages." };
}

function renderProfileCard(container) {
  container.innerHTML = "";
  const p = computeProfile();
  if (!p) return;
  const card = el("div", "profile-card");
  card.appendChild(el("div", "profile-kicker", "Recruiter targeting profile"));
  card.appendChild(el("div", "profile-name", esc(p.profile)));
  card.appendChild(el("p", "profile-detail", esc(p.detail)));
  container.appendChild(card);
}

/* ---------- deep dives ---------- */

function renderDeepDivesStep(main) {
  const role = activeRole();
  if (!role) return needsRoleNotice(main, "Deep Dives");

  main.appendChild(el("h2", null, "Deep Dives"));
  const rs = roleState();
  const musts = role.focusAreas.filter(a => rs.areas[a.id].priority === "must");
  const nices = role.focusAreas.filter(a => rs.areas[a.id].priority === "nice");

  if (!musts.length && !nices.length) {
    main.appendChild(el("p", "subtitle", "No focus areas selected yet — go back one step and mark the must-haves. The relevant deep-dive questions will appear here automatically."));
    return;
  }
  main.appendChild(el("p", "subtitle",
    "These question sets were selected by your focus-area choices. Must-haves get the full drill-down; nice-to-haves are collapsed — expand them if time allows."));

  [...musts, ...nices].forEach(area => {
    const isMust = rs.areas[area.id].priority === "must";
    const pct = rs.areas[area.id].pct || 0;
    const details = el("details", "dive" + (isMust ? " must" : ""));
    if (isMust) details.open = true;

    const summary = el("summary");
    summary.appendChild(el("span", "dive-title", area.icon + " " + esc(area.label)));
    summary.appendChild(el("span", "dive-badge" + (isMust ? " badge-must" : " badge-nice"),
      (isMust ? "Must have" : "Nice to have") + (pct ? " · " + pct + "%" : "")));
    details.appendChild(summary);

    const body = el("div", "dive-body");
    if (area.deepDive.intro) body.appendChild(el("p", "q-help", esc(area.deepDive.intro)));
    const answers = rs.deepDives[area.id];
    const qContainer = el("div", "questions");
    const tipsContainer = el("div", "tips");
    body.appendChild(qContainer);
    body.appendChild(tipsContainer);
    const refresh = () => renderTips(tipsContainer, area.deepDive.tips, answers);
    renderQuestions(qContainer, area.deepDive.questions, answers, "dive_" + area.id, refresh);
    refresh();
    details.appendChild(body);
    main.appendChild(details);
  });

  /* cross-check: existing specialists overlapping must-have areas */
  const specialists = state.common.team.specialists || [];
  const crossTips = el("div", "tips");
  musts.forEach(area => {
    const spec = role.specialists.find(s => s.overlapsArea === area.id);
    if (spec && specialists.includes(spec.label)) {
      crossTips.appendChild(el("div", "tip warn",
        "⚠️ A " + esc(spec.label) + " already exists on the team, but " + esc(area.label) +
        " is a must-have for this role. Clarify how the two roles divide the work — overlap kills placements at the offer stage."));
    }
  });
  main.appendChild(crossTips);
}

/* ---------- review + export ---------- */

function answerLine(label, value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value.length ? { label, value: value.join(", ") } : null;
  const v = String(value).trim();
  return v ? { label, value: v } : null;
}

function collectConfigSection(def) {
  const lines = [];
  def.questions.forEach(q => {
    if (q.showIf && !q.showIf(def.answers, state)) return;
    const line = answerLine(q.label, def.answers[q.id]);
    if (line) lines.push(line);
  });
  return lines.length ? { title: def.title, lines } : null;
}

function collectSummary() {
  const sections = [];
  const role = activeRole();

  /* Basics (prepend role) */
  const basicsLines = [];
  if (role) basicsLines.push({ label: "Role type", value: role.label });
  COMMON.basics.questions.forEach(q => {
    if (q.showIf && !q.showIf(state.common.basics, state)) return;
    const line = answerLine(q.label, state.common.basics[q.id]);
    if (line) basicsLines.push(line);
  });
  if (basicsLines.length) sections.push({ title: "Role & Basic Information", lines: basicsLines });

  const logistics = collectConfigSection(configStepDef("logistics")); if (logistics) sections.push(logistics);
  const team = collectConfigSection(configStepDef("team")); if (team) sections.push(team);

  /* Focus areas */
  if (role) {
    const rs = roleState();
    const active = role.focusAreas.filter(a => rs.areas[a.id].priority !== "skip")
      .sort((a, b) => (rs.areas[b.id].pct || 0) - (rs.areas[a.id].pct || 0));
    if (active.length) {
      const lines = active.map(a => ({
        label: a.label,
        value: (rs.areas[a.id].pct || 0) + "% (" + (rs.areas[a.id].priority === "must" ? "must have" : "nice to have") + ")"
      }));
      const profile = computeProfile();
      if (profile) lines.push({ label: "Recruiter targeting profile", value: profile.profile + " — " + profile.detail });
      sections.push({ title: "Focus Areas & % of Time", lines });
    }
    /* Deep dives */
    role.focusAreas.forEach(area => {
      const prio = rs.areas[area.id].priority;
      if (prio === "skip") return;
      const answers = rs.deepDives[area.id];
      const lines = [];
      area.deepDive.questions.forEach(q => {
        if (q.showIf && !q.showIf(answers, state)) return;
        const line = answerLine(q.label, answers[q.id]);
        if (line) lines.push(line);
      });
      if (lines.length) sections.push({
        title: "Deep Dive: " + area.label + (prio === "must" ? " (must have)" : " (nice to have)"), lines });
    });
    const stack = collectConfigSection(configStepDef("stack")); if (stack) sections.push(stack);
    const success = collectConfigSection(configStepDef("success")); if (success) sections.push(success);
  }

  const closing = collectConfigSection(configStepDef("closing")); if (closing) sections.push(closing);

  /* Persistent notes → free-text sections at the end of the output */
  if ((state.notes.live || "").trim())
    sections.push({ title: "Live Notes", text: state.notes.live.trim() });
  if ((state.notes.pretext || "").trim())
    sections.push({ title: "Job Description / Pre-Meeting Info", text: state.notes.pretext.trim() });

  return sections;
}

function jobTitleLine() {
  const b = state.common.basics;
  const base = b.job_title || (activeRole() ? activeRole().label : "Job Order");
  return base + (b.client_company ? " — " + b.client_company : "");
}

/* Reliable download — anchor MUST be attached to the DOM for click() to fire
   in Firefox and others. */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function printSummary() {
  const title = jobTitleLine();
  const sections = collectSummary();
  let rows = "";
  sections.forEach(sec => {
    rows += "<h2>" + esc(sec.title) + "</h2>";
    if (sec.text) { rows += "<p class='note'>" + esc(sec.text).replace(/\n/g, "<br>") + "</p>"; return; }
    rows += "<dl>";
    sec.lines.forEach(l => { rows += "<dt>" + esc(l.label) + "</dt><dd>" + esc(l.value).replace(/\n/g, "<br>") + "</dd>"; });
    rows += "</dl>";
  });
  if (!sections.length) rows = "<p>No details captured yet.</p>";

  const doc =
    "<!DOCTYPE html><html><head><meta charset='utf-8'><title>" + esc(title) + "</title><style>" +
    "*{box-sizing:border-box}body{font-family:Calibri,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a2233;margin:40px;line-height:1.5}" +
    "h1{font-size:26px;margin:0 0 4px}.date{color:#5b6577;font-size:13px;margin:0 0 20px}" +
    "h2{font-size:13px;text-transform:uppercase;letter-spacing:.8px;color:#2456d6;border-bottom:1px solid #e2e7f0;padding-bottom:5px;margin:22px 0 8px}" +
    "dl{margin:0;display:grid;grid-template-columns:240px 1fr;gap:5px 16px}" +
    "dt{font-weight:600;color:#5b6577;font-size:13.5px}dd{margin:0;font-size:13.5px}" +
    "p.note{white-space:pre-wrap;font-size:13.5px;margin:0}" +
    "@page{margin:18mm}</style></head><body>" +
    "<h1>" + esc(title) + "</h1><p class='date'>Intake completed " + esc(new Date().toLocaleDateString()) + "</p>" +
    rows + "</body></html>";

  const w = window.open("", "_blank");
  if (!w) { window.print(); return; }
  w.document.open(); w.document.write(doc); w.document.close(); w.focus();
  const go = () => w.print();
  if (w.document.readyState === "complete") setTimeout(go, 150);
  else w.onload = () => setTimeout(go, 150);
}

function fileBase() {
  const b = state.common.basics;
  const base = b.job_title || (activeRole() ? activeRole().label : "job-order");
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "job-order";
}

function renderReviewStep(main) {
  main.appendChild(el("h2", null, "Review & Export"));

  const role = activeRole();
  const b = state.common.basics, lg = state.common.logistics;
  const rs = role ? roleState() : null;
  const musts = role ? role.focusAreas.filter(a => rs.areas[a.id].priority === "must") : [];
  const total = role ? role.focusAreas.reduce((s, a) => s + (rs.areas[a.id].pct || 0), 0) : 0;

  const checks = [
    { ok: !!role, text: "Role selected" },
    { ok: !!(b.client_company || "").trim(), text: "Client company captured" },
    { ok: !!(b.why_hiring || "").trim(), text: "Business problem / reason for hiring captured" },
    { ok: !!(lg.budget || "").trim(), text: "Budget captured" },
    { ok: !!(lg.start_date || "").trim(), text: "Clear start date captured" },
    { ok: musts.length >= 1 && musts.length <= 3, text: "1–3 must-have focus areas selected" },
    { ok: total === 100, text: "Time allocation totals 100%" },
    { ok: !!(rs && (rs.success.success_6_12 || "").trim()), text: "6–12 month success definition captured" },
    { ok: !!(state.common.closing.interview_process || "").trim(), text: "Interview process captured" }
  ];
  const list = el("div", "checklist");
  checks.forEach(c => list.appendChild(el("div", "check " + (c.ok ? "ok" : "miss"), (c.ok ? "✅ " : "⬜ ") + esc(c.text))));
  main.appendChild(list);
  const missing = checks.filter(c => !c.ok).length;
  if (missing > 0) {
    main.appendChild(el("div", "tip warn",
      "⚠️ " + missing + " item(s) still open. A job order without budget, timeline, and 3 clear must-haves is a wish, not an order."));
  }

  const actions = el("div", "actions");
  const copyBtn = el("button", "btn primary", "📋 Copy summary");
  copyBtn.addEventListener("click", async () => {
    const md = summaryMarkdown();
    try { await navigator.clipboard.writeText(md); }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = md; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    copyBtn.textContent = "✓ Copied";
    setTimeout(() => (copyBtn.textContent = "📋 Copy summary"), 1500);
  });
  const wordBtn = el("button", "btn", "📄 Download Word doc");
  wordBtn.addEventListener("click", () => {
    const bytes = buildJobOrderDocx(jobTitleLine(), new Date().toLocaleDateString(), collectSummary());
    const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    downloadBlob(blob, fileBase() + "-job-order.docx");
    wordBtn.textContent = "✓ Downloaded";
    setTimeout(() => (wordBtn.textContent = "📄 Download Word doc"), 1500);
  });
  const printBtn = el("button", "btn", "🖨️ Save as PDF");
  printBtn.addEventListener("click", printSummary);
  actions.appendChild(copyBtn); actions.appendChild(wordBtn); actions.appendChild(printBtn);
  main.appendChild(actions);

  const summary = el("div", "summary");
  summary.appendChild(el("h3", null, esc(jobTitleLine())));
  const sections = collectSummary();
  if (!sections.length) summary.appendChild(el("p", "q-help", "Nothing captured yet — work through the steps and the summary will build itself here."));
  sections.forEach(sec => {
    summary.appendChild(el("h4", null, esc(sec.title)));
    if (sec.text) { summary.appendChild(el("div", "summary-note", esc(sec.text))); return; }
    const dl = el("dl");
    sec.lines.forEach(l => { dl.appendChild(el("dt", null, esc(l.label))); dl.appendChild(el("dd", null, esc(l.value))); });
    summary.appendChild(dl);
  });
  main.appendChild(summary);
}

function summaryMarkdown() {
  let md = "# Job Order: " + jobTitleLine() + "\n\n_Intake completed " + new Date().toLocaleDateString() + "_\n";
  collectSummary().forEach(sec => {
    md += "\n## " + sec.title + "\n\n";
    if (sec.text) { md += sec.text + "\n"; return; }
    sec.lines.forEach(l => { md += "- **" + l.label + ":** " + l.value + "\n"; });
  });
  return md;
}

/* ---------- shell ---------- */

function stepDone(w) {
  if (w.kind === "basics") return !!state.roleId || Object.keys(state.common.basics).some(k => truthy(state.common.basics[k]));
  if (w.kind === "config") {
    const def = configStepDef(w.key);
    if (!def) return false;
    return def.questions.some(q => truthy(def.answers[q.id]));
  }
  if (w.kind === "allocator") return !!activeRole() && activeRole().focusAreas.some(a => roleState().areas[a.id].priority !== "skip");
  if (w.kind === "deepdives") return !!activeRole() && activeRole().focusAreas.some(a =>
    roleState().areas[a.id].priority !== "skip" &&
    Object.keys(roleState().deepDives[a.id]).some(k => truthy(roleState().deepDives[a.id][k])));
  return false;
}
function truthy(v) { return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim()); }

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const steps = wizardSteps();

  const side = el("nav", "sidebar");
  const brand = (typeof APP_BRAND !== "undefined" && APP_BRAND) ? APP_BRAND
    : { title: "Digital &amp; Marketing", subtitle: "Job Order Intake" };
  side.appendChild(el("div", "brand", brand.title + "<br><span>" + brand.subtitle + "</span>"));
  if (state.roleId) side.appendChild(el("div", "role-chip", ROLES[state.roleId].icon + " " + esc(ROLES[state.roleId].label)));
  steps.forEach((w, i) => {
    const btn = el("button", "nav-step" + (i === currentStep ? " active" : "") + (stepDone(w) ? " done" : ""));
    btn.innerHTML = "<span class='nav-num'>" + (i + 1) + "</span> " + esc(stepTitle(w));
    btn.addEventListener("click", () => { currentStep = i; render(); });
    side.appendChild(btn);
  });
  const reset = el("button", "nav-reset", "🗑 Start new job order");
  reset.addEventListener("click", () => {
    if (confirm("Clear all answers and start a new job order?")) {
      state = defaultState();
      localStorage.removeItem(STORAGE_KEY);
      currentStep = 0;
      render();
    }
  });
  side.appendChild(reset);
  app.appendChild(side);

  const main = el("main", "panel");
  const w = steps[currentStep];
  if (w.kind === "basics") renderBasics(main);
  else if (w.kind === "config") renderConfigLike(main, configStepDef(w.key));
  else if (w.kind === "allocator") renderAllocatorStep(main);
  else if (w.kind === "deepdives") renderDeepDivesStep(main);
  else renderReviewStep(main);

  const nav = el("div", "step-nav");
  if (currentStep > 0) {
    const prev = el("button", "btn", "← Back");
    prev.addEventListener("click", () => { currentStep--; render(); });
    nav.appendChild(prev);
  }
  if (currentStep < steps.length - 1) {
    const next = el("button", "btn primary", "Next →");
    next.addEventListener("click", () => { currentStep++; render(); });
    nav.appendChild(next);
  }
  main.appendChild(nav);
  app.appendChild(main);

  renderNotesPanel(app);
}

/* Persistent notes rail — visible on every step, saved to state, and rolled
   into the final output. Editing it does NOT re-render (so typing never loses
   focus); it just updates state and autosaves. */
function renderNotesPanel(app) {
  const panel = el("aside", "notes-panel");
  panel.appendChild(el("div", "notes-head", "🗒️ Notes"));
  panel.appendChild(el("p", "notes-sub", "Kept across every step and added to the exported job order."));
  panel.appendChild(notesField("Job description / pre-meeting info", "pretext",
    "Paste the job description or anything the client shared before the call…"));
  panel.appendChild(notesField("Live notes", "live",
    "Jot anything they mention that isn't a field on this screen…"));
  app.appendChild(panel);
}

/* One notes field. Text autosaves; a manual resize is captured via
   ResizeObserver and stored (…H), then reapplied so the chosen height
   survives step changes. Width-only changes don't trigger a save. */
function notesField(labelText, key, placeholder) {
  const hKey = key + "H";
  const block = el("div", "notes-block");
  block.appendChild(el("label", "notes-label", labelText));
  const ta = el("textarea");
  ta.placeholder = placeholder;
  ta.value = state.notes[key] || "";
  if (state.notes[hKey]) ta.style.height = state.notes[hKey] + "px";
  ta.addEventListener("input", () => { state.notes[key] = ta.value; saveState(); });

  if (typeof ResizeObserver !== "undefined") {
    let lastH = null;
    const ro = new ResizeObserver(() => {
      const h = ta.offsetHeight;
      if (!h) return;
      if (lastH === null) { lastH = h; return; }   // first measurement = baseline
      if (h !== lastH) { lastH = h; state.notes[hKey] = h; saveState(); }
    });
    ro.observe(ta);
  }

  block.appendChild(ta);
  return block;
}

document.addEventListener("DOMContentLoaded", render);
