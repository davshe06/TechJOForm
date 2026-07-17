# Tech & Engineering Job Order Intake Builder

A role-driven intake app for staffing sales reps working tech and engineering requisitions.
On the first step the rep picks the **role**, and the rest of the wizard — focus areas,
deep-dive questions, tech-stack categories, success metrics, candidate backgrounds, and the
recruiter-targeting profile — reconfigures itself for that role via a behind-the-scenes decision tree.

It shares its engine with the Digital & Marketing intake builder; only `roles.js` differs.

## Roles supported

Every role also carries a cross-cutting **AI / GenAI** focus area (see below).

| Role | Focus areas the decision tree drills into |
|------|-------------------------------------------|
| 🖥️ Software Engineer (Backend) | Languages & Frameworks, APIs & Services, Databases, Cloud & Infra, System Design, Messaging, Testing |
| 🧩 Full-Stack Developer | Front-End, Back-End, Front/Back Balance, Databases, Cloud & DevOps |
| 📱 Mobile Developer | Native Platform, Cross-Platform, UI/UX Implementation, API & Data, Performance & Release |
| 🧱 Data Engineer | Pipelines/ETL, Warehouse/Lakehouse, Streaming, Orchestration, SQL & Modeling, Cloud Data |
| 🤖 Data Scientist / ML Engineer | Modeling, Programming, ML Frameworks, MLOps, Data Wrangling, Experimentation, Cloud ML |
| 🧠 AI Engineer (GenAI / LLM) | LLM Apps, Prompt & Eval, Vector DBs/Retrieval, Fine-tuning, LLMOps, AI Infra |
| ♾️ DevOps / SRE | CI/CD, IaC, Cloud, Containers/K8s, Observability, Reliability & On-call |
| ☁️ Cloud Architect | Platform Architecture, Solution Architecture, Migration & Modernization, Security & Governance, Cost & FinOps |
| 🔒 Security Engineer | AppSec, Cloud Security, SecOps/IR, IAM & Zero Trust, Compliance & GRC, Offensive/Pen Testing |
| ✅ QA / Test Engineer | Test Automation, Manual/Exploratory, API Testing, Performance/Load, CI/CD & Test Ops |
| 🗓️ Technical Project / Program Manager | Delivery/SDLC, Program/Portfolio Mgmt, Agile/Methodology, Technical Fluency, Stakeholders, Budget/Vendor, Risk |
| 🏢 ERP Consultant / Analyst | Platform, Modules, Implementation, Integrations, Technical Dev, Business Analysis |
| 🔷 CRM Developer / Consultant | Platform, Clouds/Modules, Configuration & Admin, Development, Integrations, Data & Reporting |

> **Interpretation notes:** "PM" is a **Technical Project / Program Manager** — covering both single-team project delivery and multi-team Technical Program Management (TPM). "AI" is a **GenAI/LLM AI Engineer**, kept as its own standalone category.

### AI as a cross-cutting competency

AI is both **its own role** (AI Engineer) **and** a weightable focus area inside every other role. Each of the six non-AI roles has an **AI / GenAI** focus area (a **GenAI / LLMs** area on the Data Scientist role) with questions tailored to how AI shows up in that discipline — AI-assisted coding and AI features for Backend, vector/embedding pipelines for Data Engineering, AIOps and GPU/ML-serving for DevOps, platform AI copilots (SAP Joule / Dynamics Copilot) for ERP, and AI-program delivery for the PM. Reps can mark it must/nice, allocate % of time, and drill into the specifics — so AI skills surface wherever they're relevant, not just in the AI role.

Adding another role is a data-only change — see **Customizing** below.

## How it works

1. **Role & Basics** — pick the role (drives everything downstream), then capture the basics.
2. **Logistics & Budget** — remote/hybrid, time-zone overlap, work authorization/clearance, budget, etc.
3. **Team Structure** — reporting line, team/squad size, and which roles already exist (tailored per role).
4. **Focus Areas & % of Time** — mark each role-specific function as *must have* / *nice to have* and allocate % of the week. A live bar targets 100%, and the app derives a **recruiter targeting profile** from the must-have combination (e.g., Backend Languages + System Design → "Senior/staff backend engineer"; DevOps Containers + Observability → "Kubernetes / SRE"; 5+ must-haves → unicorn warning).
5. **Deep Dives** — the decision tree expands only the question sets matching the selected must-have areas, with conditional follow-ups (e.g., a DevOps role that picks Kubernetes gets a cluster-ops depth question and a scarce-skill warning; an ERP role on S/4HANA gets a premium-rate flag; an AI role that picks agents or full training gets targeted warnings).
6. **Tech Stack & AI** — stack categories and AI use-case options are role-specific.
7. **Success & Ideal Candidate** — success metrics and candidate backgrounds are role-specific.
8. **Closing Questions** — start date, interview loop, technical-assessment format, feedback turnaround.
9. **Review & Export** — a completeness checklist and a formatted summary you can copy, download as a **Word (.docx)** document, or save as PDF.

### Decision-tree features

- Step 1's role selection reshapes every later step.
- Conditional follow-up questions appear/disappear as answers change (`showIf` rules).
- Context-aware coaching tips fire from answers (role open 3+ months, clearance requirements, too many must-haves, must-haves under 70% of the week, niche-platform/skill warnings, on-call dealbreakers, and more).
- Cross-checks between steps: if the team already has a role that overlaps a must-have area, the app flags it.
- Each role's answers are stored separately, so switching roles never clobbers another role's work. Everything autosaves to `localStorage`.

## Running it

No build step, no dependencies. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

Works on GitHub Pages or any static host.

## Customizing

- **`roles.js`** — all role configs plus the shared `COMMON` steps and the `APP_BRAND` shown in the sidebar. Add a role by adding an entry to `ROLES` and listing its id in `ROLE_ORDER`.
- **`app.js`** — the generic, role-aware render engine. Reused verbatim from the sibling project; reads `APP_BRAND` for the sidebar title. No changes needed to add roles or questions.
- **`docx.js`** — a small, self-contained Word (`.docx`) generator, so export needs no libraries.
