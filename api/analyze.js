/* =========================================================================
   AI job-order analysis — Vercel serverless function.

   Keeps the Anthropic API key server-side (set ANTHROPIC_API_KEY in the
   Vercel project's environment variables). Optionally set ACCESS_CODE to
   require a shared team code on every request (sent as the x-access-code
   header by the app).

   POST /api/analyze
   Body: { "summary": "<markdown job order summary>", "role": "<role label>" }
   Response: { "analysis": "<markdown>" }
   ========================================================================= */

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an expert staffing-industry analyst reviewing a technical job order that a sales rep captured during a client intake call. Your audience is the sales rep and the recruiters who will work this requisition.

Analyze the job order and respond in markdown with exactly these sections:

## Fillability
A score out of 10 with a two-sentence rationale: how realistic is this search given the requirements, budget signals, and market for this role?

## Gaps & Red Flags
The missing or problematic items a recruiter will trip over — missing budget or timeline, too many must-haves, vague success criteria, contradictions (e.g., hands-on IC role but architect-level ownership, remote but clearance required), and anything that suggests the client hasn't fully decided what they want. Be specific; quote the job order where useful.

## Sourcing Kit
- **Target titles:** the 3–5 titles recruiters should search for.
- **Boolean search:** one ready-to-paste LinkedIn/Boolean string built from the must-have skills.
- **Screening questions:** 4–6 questions derived from the must-have deep dives that separate real experience from keyword matches.

## Candidate Pitch
A short paragraph the recruiter can use to pitch this role to a candidate — lead with what makes it attractive, be honest about the environment.

Keep the whole analysis tight and practical — no filler, no generic advice that would apply to any job order. If the intake is too sparse to analyze meaningfully, say so plainly in Fillability and focus Gaps & Red Flags on what to go back and ask the client.`;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-access-code");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed — POST a job order summary." });
  }

  const accessCode = process.env.ACCESS_CODE;
  if (accessCode && req.headers["x-access-code"] !== accessCode) {
    return res.status(401).json({ error: "Invalid or missing team access code." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is missing the ANTHROPIC_API_KEY environment variable." });
  }

  const { summary, role } = req.body || {};
  if (typeof summary !== "string" || !summary.trim()) {
    return res.status(400).json({ error: "Request must include a non-empty 'summary' string." });
  }
  if (summary.length > 200_000) {
    return res.status(413).json({ error: "Job order summary is too large." });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      // medium keeps analysis quality high while fitting comfortably inside
      // the 60s function limit; raise to "high" if you extend maxDuration
      output_config: { effort: "medium" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            "Role type: " + (typeof role === "string" && role ? role : "not specified") +
            "\n\nJob order intake summary:\n\n" + summary,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return res.status(502).json({ error: "The model declined to analyze this content." });
    }

    const analysis = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    if (!analysis.trim()) {
      return res.status(502).json({ error: "The model returned an empty analysis. Try again." });
    }

    return res.status(200).json({ analysis });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Rate limited by the AI service — try again in a minute." });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: "The server's Anthropic API key was rejected — check ANTHROPIC_API_KEY in Vercel." });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: "AI service error (" + err.status + "): " + err.message });
    }
    return res.status(502).json({ error: "Could not reach the AI service. Try again." });
  }
}
