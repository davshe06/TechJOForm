/* =========================================================================
   Tech & Engineering Job Order Intake — Role Configurations
   ---------------------------------------------------------------------------
   Step 1 selects a ROLE. Everything downstream (focus areas, deep-dive
   question sets, team specialists, tech-stack categories, success metrics,
   candidate backgrounds, AI use cases, and the recruiter-targeting profile)
   is driven by the selected role's config below.

   To add a role: add an entry to ROLES and list its id in ROLE_ORDER.
   app.js is a generic engine and needs no changes.

   Question types: text, textarea, number, select, radio, chips (multi-select)
   Conditional questions use showIf(answers, state).
   Tips use when(answers, state); areaPriority(state, id) reads the active
   role's focus-area priority ("must" | "nice" | "skip").
   ========================================================================= */

/* Sidebar brand (read by app.js) */
const APP_BRAND = { title: "Tech &amp; Engineering", subtitle: "Job Order Intake" };

/* -------------------------------------------------------------------------
   Shared/common steps (role-agnostic parts). Options that depend on the role
   (team specialists, stack categories, metrics, backgrounds, AI use cases)
   are injected by app.js from the active role's config.
   ------------------------------------------------------------------------- */

const COMMON = {
  basics: {
    title: "Basic Information",
    subtitle: "Tell us about this role.",
    coach: "Best practice: schedule a job order intake session and include your perm team and TDC partner. Introduce Perm as an option on every JO, as well as FTEP.",
    questions: [
      { id: "client_company", type: "text", label: "Client company", placeholder: "Acme Corp" },
      { id: "client_contact", type: "text", label: "Client contact(s) on the call", placeholder: "Name, title (hiring manager? HR? engineering lead?)" },
      { id: "job_title", type: "text", label: "Exact job title on the req", placeholder: "e.g., Senior Backend Engineer" },
      { id: "why_hiring", type: "textarea", label: "Why are you hiring? What business/technical problem are you trying to solve?",
        placeholder: "A new product, scaling load, a migration, backfilling a departure, a skills gap…" },
      { id: "replacement_or_new", type: "radio", label: "Replacement or new position?",
        options: ["Replacement", "New position"] },
      { id: "replacement_why", type: "textarea", label: "What happened with the previous person?",
        placeholder: "Why did they leave? What would the client change about the profile?",
        showIf: a => a.replacement_or_new === "Replacement" },
      { id: "open_how_long", type: "select", label: "How long has the position been open?",
        options: ["Brand new", "Under 2 weeks", "2–4 weeks", "1–3 months", "3+ months"] },
      { id: "how_else_filling", type: "textarea", label: "How else are you filling it? Other recruiting firms?",
        placeholder: "Internal recruiters, job boards, competing agencies, referrals…" },
      { id: "strategic_vs_hands_on", type: "radio", label: "How hands-on vs. architectural/leadership is this role?",
        options: ["Mostly hands-on / IC", "Balanced", "Mostly architecture / leadership"] },
      { id: "engagement_type", type: "chips", label: "Engagement type discussed",
        options: ["Contract", "Contract-to-hire", "Direct hire (Perm)", "FTEP"] }
    ],
    tips: [
      { when: a => a.open_how_long === "3+ months",
        text: "Open 3+ months — dig into why. Unrealistic requirements, below-market comp, or a slow interview loop usually explains it. This is your chance to reset expectations." },
      { when: a => (a.how_else_filling || "").toLowerCase().includes("firm") || (a.how_else_filling || "").toLowerCase().includes("agenc"),
        text: "Competing firms in play — ask about exclusivity, how many resumes they've seen, and why nobody has been hired yet." },
      { when: a => !((a.engagement_type || []).includes("Direct hire (Perm)")),
        text: "Reminder: introduce Perm as an option on every job order, as well as FTEP." }
    ]
  },
  logistics: {
    title: "Logistics & Budget",
    subtitle: "The deal parameters.",
    questions: [
      { id: "work_model", type: "radio", label: "Remote / hybrid / onsite?",
        options: ["Remote", "Hybrid", "Onsite"] },
      { id: "location", type: "text", label: "Location / office", placeholder: "City, state",
        showIf: a => a.work_model === "Hybrid" || a.work_model === "Onsite" },
      { id: "days_in_office", type: "select", label: "Days in office per week",
        options: ["1", "2", "3", "4", "5"], showIf: a => a.work_model === "Hybrid" },
      { id: "timezone", type: "text", label: "Time-zone / overlap requirements", placeholder: "e.g., 4 hrs overlap with US ET; US-only" },
      { id: "work_auth", type: "text", label: "Work authorization / clearance requirements", placeholder: "e.g., USC/GC only, no sponsorship, must be able to obtain clearance" },
      { id: "start_date", type: "text", label: "Clear start date", placeholder: "e.g., ASAP, first week of August" },
      { id: "assignment_length", type: "text", label: "Length of assignment", placeholder: "e.g., 6 months, 12 months, ongoing" },
      { id: "budget", type: "text", label: "Budget (bill rate / salary range)", placeholder: "e.g., $80–110/hr, $150–180k" },
      { id: "conversion_fees", type: "text", label: "Conversion fees discussed?", placeholder: "Terms, timing, fee schedule" },
      { id: "bill_to", type: "text", label: "Bill to", placeholder: "Billing contact / entity / PO requirements" }
    ],
    tips: [
      { when: a => a.work_model === "Remote",
        text: "Fully remote widens the pool but also the competition — confirm any time-zone or state/country restrictions now." },
      { when: a => !(a.budget || "").trim() && !!a.work_model,
        text: "No budget yet — don't leave the call without a number or range. In this market, tech comp expectations move fast." },
      { when: a => (a.work_auth || "").toLowerCase().includes("clearance"),
        text: "Clearance requirements dramatically narrow the pool — confirm the exact level and whether it must be active." }
    ]
  },
  team: {
    title: "Team Structure",
    subtitle: "How is the team organized?",
    questions: [
      { id: "reports_to", type: "text", label: "Who does this person report to?", placeholder: "Title and name (Eng Manager? CTO? Tech Lead?)" },
      { id: "team_size", type: "text", label: "How big is the team / squad?", placeholder: "e.g., 8 engineers across 2 squads" },
      { id: "direct_reports", type: "radio", label: "Will this person manage anyone?",
        options: ["Yes", "No", "Not sure"] },
      { id: "direct_reports_who", type: "text", label: "Who will they manage?", placeholder: "Roles / count",
        showIf: a => a.direct_reports === "Yes" },
      /* specialists chip options injected from role.specialists */
      { id: "specialists", type: "chips", label: "What roles already exist on the team?", options: [] },
      { id: "generalist_or_specialist", type: "radio", label: "Is this role a specialist or a generalist?",
        options: ["Specialist", "Generalist / full-stack", "Somewhere in between"] }
    ],
    tips: [
      { when: a => a.generalist_or_specialist === "Generalist / full-stack",
        text: "Generalist roles are the hardest to fill and score. Push extra hard on the 'top 3 things' question in the Focus Areas step." }
    ]
  },
  closing: {
    title: "Closing Questions",
    subtitle: "Lock in the process before you hang up.",
    questions: [
      { id: "candidate_start", type: "text", label: "When can the candidate start?", placeholder: "Target onboarding date" },
      { id: "interview_process", type: "textarea", label: "What does the interview process look like?",
        placeholder: "Rounds, interviewers, timeline to decision" },
      { id: "tech_assessment", type: "text", label: "Technical assessment involved?",
        placeholder: "e.g., take-home, live coding, system design, pair programming, none" },
      { id: "feedback_turnaround", type: "text", label: "Resume / interview feedback turnaround?", placeholder: "e.g., within 48 hours" },
      { id: "next_steps", type: "textarea", label: "Agreed next steps",
        placeholder: "When you'll send candidates, follow-up call scheduled…" }
    ],
    tips: [
      { when: a => (a.interview_process || "").split(/round|step|stage|interview|loop/i).length > 5,
        text: "Long interview loop — set expectations now: strong engineers in this market are gone in 1–2 weeks and often hold multiple offers." },
      { when: a => /take-?home/i.test(a.tech_assessment || ""),
        text: "Take-home assessments cause drop-off among senior candidates — confirm the time expectation and whether it's skippable for strong profiles." }
    ]
  }
};

const BG_COMMON = ["Product company", "B2B SaaS", "Enterprise", "Startup", "Consulting / SI", "Fintech"];

/* =========================================================================
   ROLE CONFIGS
   ========================================================================= */

const ROLES = {

  /* -------------------------------------------------- BACKEND ENGINEER */
  backend_engineer: {
    label: "Software Engineer (Backend)",
    icon: "🖥️",
    tagline: "Services, APIs, data, and system design",
    blurb: "“Backend Engineer” spans CRUD-service work to distributed-systems architecture. The language and the system-design bar are the two biggest filters — pin where they'll spend 70–80% of their time and recruit for it.",
    timePrompt: "“If this engineer only had time to be exceptional at three things, what would they be — and roughly what percentage of the week does each take?”",
    focusAreas: [
      { id: "languages", label: "Languages & Frameworks", icon: "🧬", deepDive: {
        intro: "The primary language is the single hardest filter — get specific, not 'any OO language'.",
        questions: [
          { id: "language", type: "chips", label: "Primary language(s)?",
            options: ["Java", "C# / .NET", "Python", "Go", "Node / TypeScript", "Ruby", "Rust", "C++", "Other"] },
          { id: "framework", type: "text", label: "Frameworks?", placeholder: "Spring Boot, .NET Core, Django, Express, Gin…" },
          { id: "years", type: "select", label: "Years in the primary language expected?",
            options: ["1–2", "3–5", "6–8", "9+"] }
        ],
        tips: [
          { when: a => (a.language || []).length > 2,
            text: "More than two 'primary' languages usually means the client hasn't decided — ask which one the day-one work is actually in." }
        ] } },
      { id: "apis", label: "APIs & Services", icon: "🔌", deepDive: {
        intro: "API style and architecture shape the seniority and mindset needed.",
        questions: [
          { id: "style", type: "chips", label: "API / service style?",
            options: ["REST", "GraphQL", "gRPC", "Event-driven", "SOAP / legacy"] },
          { id: "architecture", type: "radio", label: "Architecture?",
            options: ["Microservices", "Monolith", "Modular monolith", "Mixed / migrating"] }
        ],
        tips: [
          { when: a => a.architecture === "Mixed / migrating",
            text: "A monolith→microservices migration wants someone who's done exactly that — ask the client to prioritize decomposition experience." }
        ] } },
      { id: "databases", label: "Databases & Data", icon: "🗄️", deepDive: {
        intro: "SQL depth vs. NoSQL vs. scale problems are different skill sets.",
        questions: [
          { id: "sql", type: "text", label: "Relational databases?", placeholder: "PostgreSQL, MySQL, SQL Server, Oracle" },
          { id: "nosql", type: "text", label: "NoSQL / other stores?", placeholder: "MongoDB, DynamoDB, Cassandra, Redis, Elasticsearch" },
          { id: "scale", type: "radio", label: "Scale / performance challenges?",
            options: ["High-scale / performance-critical", "Standard", "Not sure"] }
        ], tips: [] } },
      { id: "cloud", label: "Cloud & Infrastructure", icon: "☁️", deepDive: {
        intro: "Which cloud, and how much infra ownership, meaningfully filters candidates.",
        questions: [
          { id: "cloud", type: "chips", label: "Which cloud?", options: ["AWS", "Azure", "GCP", "On-prem", "Multi-cloud"] },
          { id: "responsibilities", type: "chips", label: "Infra responsibilities?",
            options: ["Deploy their own services", "Containers (Docker/K8s)", "Serverless", "IaC (Terraform)", "Owns infra end-to-end"] }
        ],
        tips: [
          { when: (a, s) => (a.responsibilities || []).includes("Owns infra end-to-end") && areaPriority(s, "cloud") === "must",
            text: "'Owns infra end-to-end' pushes this toward a DevOps-leaning engineer — confirm whether a platform team exists or this person is it." }
        ] } },
      { id: "system_design", label: "System Design & Architecture", icon: "🏗️", deepDive: {
        intro: "Architecture ownership is the biggest seniority signal.",
        questions: [
          { id: "scope", type: "chips", label: "Design responsibilities?",
            options: ["Service-level design", "Cross-system architecture", "Scalability / distributed systems", "Tech selection / standards"] },
          { id: "ownership", type: "radio", label: "Will they own architecture decisions?",
            options: ["Yes — architect-level", "Contributes", "Follows existing patterns"] }
        ],
        tips: [
          { when: a => a.ownership === "Yes — architect-level",
            text: "Architect-level ownership means a senior/staff profile — screen for scaling stories and trade-off reasoning, not just coding." }
        ] } },
      { id: "messaging", label: "Messaging & Streaming", icon: "📨", deepDive: {
        intro: "Async/event-driven experience is a real differentiator.",
        questions: [
          { id: "tech", type: "chips", label: "Which technologies?",
            options: ["Kafka", "RabbitMQ", "AWS SQS/SNS", "Azure Service Bus", "Pub/Sub", "Kinesis"] }
        ], tips: [] } },
      { id: "testing", label: "Testing & Quality", icon: "🧪", deepDive: {
        intro: "Testing expectations separate product engineers from prototypers.",
        questions: [
          { id: "types", type: "chips", label: "Testing expected?",
            options: ["Unit", "Integration", "Contract", "Load / performance", "TDD"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "AI is reshaping backend work — from AI-assisted coding to shipping AI-powered features. Clarify which.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["AI-assisted coding (Copilot/Cursor)", "Building AI/LLM-powered features", "Integrating AI/ML APIs", "Serving ML models", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "Copilot, LangChain, OpenAI/Anthropic APIs, vector DBs…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Building AI/LLM-powered features"),
            text: "Building AI features is a narrower, pricier pool than 'uses AI tools' — if it's core, weigh whether the dedicated AI Engineer profile fits better." }
        ] } }
    ],
    specialists: [
      { label: "Front-End Developer", overlapsArea: null },
      { label: "DevOps / SRE", overlapsArea: "cloud" },
      { label: "Data Engineer", overlapsArea: "databases" },
      { label: "QA Engineer", overlapsArea: "testing" },
      { label: "Software Architect", overlapsArea: "system_design" },
      { label: "DBA", overlapsArea: "databases" }
    ],
    profileRules: [
      { must: ["languages", "system_design"], profile: "Senior / staff backend engineer",
        detail: "Target senior+ engineers in the named language. Architecture ownership and scaling stories are the filters." },
      { must: ["apis", "databases"], profile: "Core services / API engineer",
        detail: "Target product engineers who build and own services. API design and data modeling are the filters." },
      { must: ["cloud", "system_design"], profile: "Cloud / distributed-systems engineer",
        detail: "Target engineers comfortable owning cloud infra and scale. Distributed-systems depth is the filter." }
    ],
    stackCategories: [
      { id: "lang", label: "Languages / frameworks", placeholder: "Java/Spring, .NET, Python/Django…" },
      { id: "db", label: "Databases", placeholder: "PostgreSQL, MongoDB, Redis…" },
      { id: "cloud", label: "Cloud", placeholder: "AWS, Azure, GCP…" },
      { id: "messaging", label: "Messaging / streaming", placeholder: "Kafka, RabbitMQ, SQS…" },
      { id: "cicd", label: "CI/CD & containers", placeholder: "Jenkins, GitHub Actions, Docker, K8s…" },
      { id: "observability", label: "Observability", placeholder: "Datadog, Prometheus, Grafana…" }
    ],
    aiUseCases: ["Code generation / completion", "Code review", "Test generation", "Debugging",
                 "Documentation", "Refactoring"],
    metrics: ["Uptime / SLA", "Latency / throughput", "Defect / escape rate", "Deployment frequency",
              "Code coverage", "Incident count", "Sprint velocity", "Cost efficiency"],
    backgrounds: BG_COMMON.concat(["Healthcare", "E-commerce", "Gaming"])
  },

  /* ------------------------------------------------------ DATA ENGINEER */
  data_engineer: {
    label: "Data Engineer",
    icon: "🧱",
    tagline: "Pipelines, warehouses, streaming, and modeling",
    blurb: "Data engineering ranges from SQL-and-dbt analytics plumbing to real-time streaming at scale. The warehouse and the batch-vs-streaming split are the biggest filters — pin the 70–80%.",
    timePrompt: "“Between pipelines, warehousing, streaming, and modeling — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "pipelines", label: "Pipelines & ETL/ELT", icon: "🔀", deepDive: {
        intro: "Ingestion tooling and batch complexity define the level.",
        questions: [
          { id: "tools", type: "chips", label: "Pipeline tooling?",
            options: ["dbt", "Airflow", "Fivetran / Airbyte", "Custom / code", "Spark", "Informatica / legacy ETL"] },
          { id: "pattern", type: "radio", label: "ELT or ETL primarily?",
            options: ["ELT (transform in warehouse)", "ETL (transform in flight)", "Both"] }
        ], tips: [] } },
      { id: "warehouse", label: "Data Warehouse / Lakehouse", icon: "🏛️", deepDive: {
        intro: "The warehouse is the single hardest filter.",
        questions: [
          { id: "platform", type: "chips", label: "Which platform?",
            options: ["Snowflake", "BigQuery", "Redshift", "Databricks", "Synapse", "On-prem / other"] },
          { id: "scale", type: "text", label: "Data scale?", placeholder: "e.g., TBs, billions of rows/day" }
        ],
        tips: [
          { when: a => (a.platform || []).length >= 3,
            text: "Three+ warehouse platforms listed usually means 'nice to have' creep — ask which one production runs on today." }
        ] } },
      { id: "streaming", label: "Streaming & Real-time", icon: "🌊", deepDive: {
        intro: "Real-time is a distinct, scarcer skill set than batch.",
        questions: [
          { id: "tech", type: "chips", label: "Streaming tech?",
            options: ["Kafka", "Kinesis", "Flink", "Spark Streaming", "Pub/Sub", "Debezium / CDC"] },
          { id: "latency", type: "radio", label: "Latency requirement?",
            options: ["Sub-second real-time", "Near-real-time (minutes)", "Micro-batch"] }
        ],
        tips: [
          { when: a => a.latency === "Sub-second real-time",
            text: "True sub-second streaming narrows the pool sharply — confirm it's a real requirement and screen for production streaming systems." }
        ] } },
      { id: "orchestration", label: "Orchestration", icon: "🎛️", deepDive: {
        intro: "Orchestration ownership signals platform maturity.",
        questions: [
          { id: "tools", type: "chips", label: "Orchestrators?",
            options: ["Airflow", "Dagster", "Prefect", "dbt Cloud", "Step Functions", "Cloud-native"] }
        ], tips: [] } },
      { id: "modeling", label: "SQL & Data Modeling", icon: "📐", deepDive: {
        intro: "Modeling rigor separates analytics engineers from pipeline movers.",
        questions: [
          { id: "approach", type: "chips", label: "Modeling approach?",
            options: ["Dimensional / star schema", "Data Vault", "One Big Table", "Medallion (bronze/silver/gold)"] },
          { id: "sql_depth", type: "radio", label: "SQL depth expected?",
            options: ["Expert (window fns, optimization)", "Strong", "Moderate"] }
        ], tips: [] } },
      { id: "cloud_data", label: "Cloud Data Platform", icon: "☁️", deepDive: {
        intro: "Cloud ecosystem matters for portability of skills.",
        questions: [
          { id: "cloud", type: "chips", label: "Which cloud?", options: ["AWS", "Azure", "GCP", "Multi-cloud"] },
          { id: "iac", type: "radio", label: "Infra / IaC ownership?",
            options: ["Owns infra (Terraform)", "Some", "None"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "AI intersects data engineering through ML/AI data prep and emerging vector/embedding pipelines.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["AI-assisted pipeline/SQL dev", "Data pipelines for ML/AI", "Vector / embedding stores", "AI-driven data quality", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "Feature stores, embeddings, pgvector, LangChain…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Vector / embedding stores"),
            text: "Vector/embedding pipelines are an emerging skill overlapping AI engineering — screen for it specifically; few data engineers have it yet." }
        ] } }
    ],
    specialists: [
      { label: "Data Scientist", overlapsArea: null },
      { label: "Analytics Engineer", overlapsArea: "modeling" },
      { label: "ML Engineer", overlapsArea: null },
      { label: "Data Analyst", overlapsArea: null },
      { label: "Platform / DevOps Engineer", overlapsArea: "cloud_data" },
      { label: "DBA", overlapsArea: "warehouse" }
    ],
    profileRules: [
      { must: ["warehouse", "modeling"], profile: "Analytics / warehouse engineer",
        detail: "Target analytics-engineering titles (dbt + warehouse). Modeling and SQL depth are the filters." },
      { must: ["streaming", "cloud_data"], profile: "Streaming / real-time data engineer",
        detail: "Target engineers with production streaming systems. Kafka/Flink and low-latency design are the filters." },
      { must: ["pipelines", "cloud_data"], profile: "Cloud data engineer",
        detail: "Target cloud-native data engineers. Pipeline reliability and the cloud data stack are the filters." }
    ],
    stackCategories: [
      { id: "warehouse", label: "Warehouse / lakehouse", placeholder: "Snowflake, BigQuery, Databricks…" },
      { id: "orchestration", label: "Orchestration", placeholder: "Airflow, dbt, Dagster…" },
      { id: "processing", label: "Processing / compute", placeholder: "Spark, Flink…" },
      { id: "streaming", label: "Streaming", placeholder: "Kafka, Kinesis…" },
      { id: "lang", label: "Languages", placeholder: "Python, SQL, Scala…" },
      { id: "cloud", label: "Cloud", placeholder: "AWS, Azure, GCP…" }
    ],
    aiUseCases: ["Pipeline / SQL generation", "Data documentation", "Anomaly detection",
                 "Code review", "Data-quality checks", "Schema mapping"],
    metrics: ["Pipeline reliability / SLA", "Data freshness", "Data quality", "Cost efficiency",
              "Throughput / volume", "Incident count", "Time-to-data"],
    backgrounds: BG_COMMON.concat(["Healthcare", "E-commerce", "AdTech", "Gaming"])
  },

  /* --------------------------------------------------------- DEVOPS/SRE */
  devops_sre: {
    label: "DevOps / SRE",
    icon: "♾️",
    tagline: "CI/CD, cloud, Kubernetes, and reliability",
    blurb: "DevOps and SRE overlap but aren't identical — one leans build/deploy automation, the other production reliability. Pin the cloud, the orchestration stack, and which side of that line the role sits on.",
    timePrompt: "“Where will this person spend most of the week — pipelines, infrastructure, reliability, observability? Roughly what percentage each?”",
    focusAreas: [
      { id: "cicd", label: "CI/CD", icon: "🚚", deepDive: {
        intro: "Pipeline tooling and how much they build vs. maintain matters.",
        questions: [
          { id: "tools", type: "chips", label: "CI/CD tooling?",
            options: ["GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "ArgoCD / GitOps", "Azure DevOps"] },
          { id: "scope", type: "radio", label: "Build pipelines from scratch or maintain?",
            options: ["Build / architect pipelines", "Maintain & improve", "Mix"] }
        ], tips: [] } },
      { id: "iac", label: "Infrastructure as Code", icon: "📜", deepDive: {
        intro: "IaC tool and depth is a core filter.",
        questions: [
          { id: "tools", type: "chips", label: "IaC tools?",
            options: ["Terraform", "CloudFormation", "Pulumi", "Ansible", "Bicep"] },
          { id: "depth", type: "radio", label: "Depth?",
            options: ["Owns / architects IaC", "Writes modules", "Modifies existing"] }
        ],
        tips: [
          { when: a => (a.tools || []).includes("Terraform") && a.depth === "Owns / architects IaC",
            text: "Terraform ownership at scale is a strong differentiator — screen for module design, state management, and multi-env patterns." }
        ] } },
      { id: "cloud", label: "Cloud Platform", icon: "☁️", deepDive: {
        intro: "Cloud depth (not breadth) is what the client is really buying.",
        questions: [
          { id: "cloud", type: "chips", label: "Primary cloud?", options: ["AWS", "Azure", "GCP", "On-prem / hybrid", "Multi-cloud"] },
          { id: "certs", type: "radio", label: "Certifications?",
            options: ["Required", "Preferred", "Not important"] }
        ],
        tips: [
          { when: a => (a.cloud || []).length >= 3,
            text: "Deep expertise in three clouds at once is rare — clarify which cloud production actually runs on." }
        ] } },
      { id: "containers", label: "Containers & Orchestration", icon: "📦", deepDive: {
        intro: "Kubernetes depth is often the make-or-break requirement.",
        questions: [
          { id: "tech", type: "chips", label: "Which tech?",
            options: ["Docker", "Kubernetes", "Helm", "EKS/AKS/GKE", "Service mesh (Istio)", "OpenShift"] },
          { id: "k8s_depth", type: "radio", label: "Kubernetes depth?",
            options: ["Operates / tunes clusters", "Deploys to K8s", "Limited / learning"],
            showIf: a => (a.tech || []).includes("Kubernetes") }
        ],
        tips: [
          { when: a => a.k8s_depth === "Operates / tunes clusters",
            text: "Cluster operations (not just deploying to K8s) is a scarce, premium skill — set rate expectations accordingly." }
        ] } },
      { id: "observability", label: "Observability & Monitoring", icon: "📈", deepDive: {
        intro: "Observability maturity signals a true SRE.",
        questions: [
          { id: "tools", type: "chips", label: "Tooling?",
            options: ["Prometheus / Grafana", "Datadog", "New Relic", "ELK / OpenSearch", "Splunk", "OpenTelemetry"] }
        ], tips: [] } },
      { id: "reliability", label: "Reliability & On-call", icon: "🛡️", deepDive: {
        intro: "SLOs, incident management, and on-call define the SRE half.",
        questions: [
          { id: "scope", type: "chips", label: "Reliability scope?",
            options: ["SLOs / error budgets", "Incident management", "On-call rotation", "Chaos / resilience", "Capacity planning"] },
          { id: "oncall", type: "radio", label: "Is on-call part of the role?",
            options: ["Yes", "No", "Occasional"] }
        ],
        tips: [
          { when: a => a.oncall === "Yes",
            text: "On-call is a dealbreaker for some candidates — confirm rotation frequency and comp so you can screen for fit early." }
        ] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "AI touches DevOps via AIOps and the fast-growing job of running AI/ML workloads in production.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["AI-assisted IaC/scripting", "AIOps (anomaly detection/alerting)", "Serving AI/ML workloads (GPU/inference)", "MLOps / LLMOps infra", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "GPU on K8s, Kubeflow, inference servers, MLflow…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Serving AI/ML workloads (GPU/inference)") || (a.usage || []).includes("MLOps / LLMOps infra"),
            text: "Running GPU/AI workloads is a growing, premium DevOps specialty — confirm it's truly in scope and screen for production ML/LLM infra experience." }
        ] } }
    ],
    specialists: [
      { label: "Cloud Architect", overlapsArea: "cloud" },
      { label: "Platform Engineer", overlapsArea: "iac" },
      { label: "Security Engineer", overlapsArea: null },
      { label: "Backend Developer", overlapsArea: null },
      { label: "Data / Infra Engineer", overlapsArea: null },
      { label: "IT / Sysadmin", overlapsArea: null }
    ],
    profileRules: [
      { must: ["iac", "cloud"], profile: "Cloud / platform engineer",
        detail: "Target platform-engineering titles. IaC ownership and deep cloud expertise are the filters." },
      { must: ["containers", "observability"], profile: "Kubernetes / SRE",
        detail: "Target SRE titles with K8s ops depth. Cluster operations and observability are the filters." },
      { must: ["reliability", "observability"], profile: "Site Reliability Engineer",
        detail: "Target SRE titles. SLOs, incident response, and production reliability are the filters." }
    ],
    stackCategories: [
      { id: "cloud", label: "Cloud", placeholder: "AWS, Azure, GCP…" },
      { id: "iac", label: "IaC", placeholder: "Terraform, Pulumi, Ansible…" },
      { id: "containers", label: "Containers / orchestration", placeholder: "Docker, Kubernetes, Helm…" },
      { id: "cicd", label: "CI/CD", placeholder: "GitHub Actions, ArgoCD, Jenkins…" },
      { id: "observability", label: "Observability", placeholder: "Datadog, Prometheus, Grafana…" },
      { id: "scripting", label: "Scripting / languages", placeholder: "Bash, Python, Go…" }
    ],
    aiUseCases: ["Pipeline / IaC generation", "Incident summarization", "Runbook generation",
                 "Log / anomaly analysis", "Config review", "Documentation"],
    metrics: ["Uptime / SLA", "MTTR", "Deployment frequency", "Change failure rate",
              "Lead time for changes", "Incident count", "Cloud cost / efficiency"],
    backgrounds: BG_COMMON.concat(["Cloud-native", "Healthcare", "E-commerce", "MSP / managed services"])
  },

  /* -------------------------------------------- DATA SCIENTIST / ML ENG */
  data_scientist: {
    label: "Data Scientist / ML Engineer",
    icon: "🤖",
    tagline: "Modeling, experimentation, and ML in production",
    blurb: "This title spans research-leaning data science to production ML engineering. The split between building models and shipping/serving them is the biggest filter — pin the 70–80%.",
    timePrompt: "“Between modeling, experimentation, data wrangling, and productionizing — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "modeling", label: "ML Modeling", icon: "📊", deepDive: {
        intro: "Problem type dictates the specialist you're targeting.",
        questions: [
          { id: "types", type: "chips", label: "Modeling areas?",
            options: ["Classical ML (regression/trees)", "Deep learning", "NLP", "Computer vision", "Recommenders", "Time series", "GenAI / LLMs"] },
          { id: "depth", type: "radio", label: "Research or applied?",
            options: ["Research / novel models", "Applied / proven techniques", "Mix"] }
        ],
        tips: [
          { when: a => a.depth === "Research / novel models",
            text: "Research-level modeling implies advanced degrees and publications — a smaller, pricier pool. Confirm it's truly needed vs. applied ML." }
        ] } },
      { id: "programming", label: "Programming & Tools", icon: "🐍", deepDive: {
        intro: "Engineering rigor separates DS from ML engineers.",
        questions: [
          { id: "langs", type: "chips", label: "Languages / tools?",
            options: ["Python", "R", "SQL", "Scala", "Notebooks (Jupyter)", "pandas / numpy"] },
          { id: "eng_rigor", type: "radio", label: "Software-engineering rigor expected?",
            options: ["Production-grade code", "Solid scripting", "Notebook-level"] }
        ], tips: [] } },
      { id: "frameworks", label: "ML Frameworks", icon: "🧠", deepDive: {
        intro: "Framework depth matters most for deep-learning roles.",
        questions: [
          { id: "fw", type: "chips", label: "Frameworks?",
            options: ["scikit-learn", "PyTorch", "TensorFlow / Keras", "XGBoost / LightGBM", "Hugging Face", "Spark MLlib"] }
        ], tips: [] } },
      { id: "mlops", label: "MLOps & Deployment", icon: "🚀", deepDive: {
        intro: "Productionizing models is the ML-engineer half of the role.",
        questions: [
          { id: "scope", type: "chips", label: "MLOps scope?",
            options: ["Model serving / APIs", "Training pipelines", "Model monitoring / drift", "Feature stores", "CI/CD for ML"] },
          { id: "tools", type: "text", label: "MLOps tools?", placeholder: "MLflow, Kubeflow, SageMaker, Vertex, Weights & Biases" }
        ],
        tips: [
          { when: (a, s) => (a.scope || []).length >= 3 && areaPriority(s, "mlops") === "must",
            text: "Heavy MLOps ownership means you're recruiting an ML Engineer, not a data scientist — target production-ML backgrounds." }
        ] } },
      { id: "wrangling", label: "Data Wrangling & Features", icon: "🧹", deepDive: {
        intro: "Feature engineering and data access realities shape the day-to-day.",
        questions: [
          { id: "sources", type: "chips", label: "Data sources / scale?",
            options: ["Warehouse (SQL)", "Big data (Spark)", "Streaming", "Unstructured (text/images)"] }
        ], tips: [] } },
      { id: "experimentation", label: "Experimentation & Stats", icon: "🔬", deepDive: {
        intro: "Statistical rigor and A/B testing are the science half.",
        questions: [
          { id: "scope", type: "chips", label: "What's expected?",
            options: ["A/B testing", "Causal inference", "Bayesian methods", "Experiment design", "Statistical analysis"] }
        ], tips: [] } },
      { id: "cloud_ml", label: "Cloud ML Platform", icon: "☁️", deepDive: {
        intro: "The ML platform is a portability and readiness signal.",
        questions: [
          { id: "platform", type: "chips", label: "Which platform?",
            options: ["AWS SageMaker", "GCP Vertex AI", "Azure ML", "Databricks", "None / custom"] }
        ], tips: [] } },
      { id: "genai", label: "GenAI / LLMs", icon: "✨", deepDive: {
        intro: "Beyond classical ML, many DS/ML roles now expect GenAI/LLM work — clarify how much.",
        questions: [
          { id: "usage", type: "chips", label: "GenAI / LLM scope?",
            options: ["Using LLMs in solutions", "Prompt engineering", "RAG / embeddings", "Fine-tuning", "AI-assisted analysis/coding", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of GenAI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific GenAI tools / skills?", placeholder: "OpenAI/Anthropic, LangChain, Hugging Face, vector DBs…" }
        ],
        tips: [
          { when: a => a.depth === "Core part of the role",
            text: "If GenAI/LLM work is core, confirm whether this is really the dedicated AI Engineer role — or a data scientist who also builds with LLMs." }
        ] } }
    ],
    specialists: [
      { label: "Data Engineer", overlapsArea: "wrangling" },
      { label: "ML Engineer", overlapsArea: "mlops" },
      { label: "Data Analyst", overlapsArea: null },
      { label: "Research Scientist", overlapsArea: "modeling" },
      { label: "Backend Engineer", overlapsArea: null },
      { label: "Product Manager", overlapsArea: null }
    ],
    profileRules: [
      { must: ["modeling", "experimentation"], profile: "Data Scientist (research-leaning)",
        detail: "Target data-science titles with stats depth. Modeling and experimentation rigor are the filters." },
      { must: ["mlops", "frameworks"], profile: "ML Engineer (production)",
        detail: "Target ML-engineering titles. Serving, pipelines, and production deployment are the filters." },
      { must: ["wrangling", "cloud_ml"], profile: "Applied ML engineer",
        detail: "Target applied-ML titles. End-to-end delivery on a cloud ML platform is the filter." }
    ],
    stackCategories: [
      { id: "lang", label: "Languages", placeholder: "Python, R, SQL…" },
      { id: "frameworks", label: "ML frameworks", placeholder: "PyTorch, scikit-learn, XGBoost…" },
      { id: "mlops", label: "MLOps", placeholder: "MLflow, Kubeflow, SageMaker…" },
      { id: "cloud", label: "Cloud ML platform", placeholder: "SageMaker, Vertex, Azure ML, Databricks…" },
      { id: "data", label: "Data / warehouse", placeholder: "Snowflake, Spark, BigQuery…" },
      { id: "viz", label: "Notebooks / BI", placeholder: "Jupyter, Tableau, Streamlit…" }
    ],
    aiUseCases: ["Model prototyping", "Code generation", "Data labeling / synthetic data",
                 "Literature / research assist", "Documentation", "Feature ideation"],
    metrics: ["Model accuracy / AUC", "Precision / recall", "Model latency", "Business impact / lift",
              "Experiment velocity", "Models in production", "Data quality"],
    backgrounds: BG_COMMON.concat(["Healthcare", "AdTech", "E-commerce", "Research lab"])
  },

  /* -------------------------------------------------- ERP CONSULTANT */
  erp_consultant: {
    label: "ERP Consultant / Analyst",
    icon: "🏢",
    tagline: "Platform, modules, implementation, and integrations",
    blurb: "ERP roles are gated hard by platform and module — an SAP FICO consultant and a Workday HCM analyst don't cross-apply. Nail the exact platform and modules first; that's 80% of the search.",
    timePrompt: "“Across configuration, implementation, integrations, and support — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "platform", label: "ERP Platform", icon: "🧭", deepDive: {
        intro: "The platform is the single hardest, non-negotiable filter.",
        questions: [
          { id: "platform", type: "radio", label: "Which platform?",
            options: ["SAP", "Oracle (EBS/Fusion)", "Workday", "NetSuite", "Microsoft Dynamics 365", "Infor / other"] },
          { id: "version", type: "text", label: "Version / edition?", placeholder: "e.g., S/4HANA, ECC, Dynamics F&O" },
          { id: "certification", type: "radio", label: "Certification expectation?",
            options: ["Required", "Preferred", "Not important"] }
        ],
        tips: [
          { when: a => a.platform === "SAP" && /s\/?4|hana/i.test(a.version || ""),
            text: "S/4HANA experience is in high demand and scarce — expect premium rates and a smaller pool than ECC." }
        ] } },
      { id: "modules", label: "Functional Modules", icon: "🧩", deepDive: {
        intro: "Module expertise is as important as the platform itself.",
        questions: [
          { id: "modules", type: "chips", label: "Which modules / functional areas?",
            options: ["Finance (FICO/GL)", "Supply Chain / SCM", "HCM / HR / Payroll", "Procurement", "Manufacturing / PP", "Sales / OTC", "Projects / PS"] },
          { id: "functional_technical", type: "radio", label: "Functional or technical role?",
            options: ["Functional", "Technical", "Techno-functional"] }
        ],
        tips: [
          { when: a => (a.modules || []).length > 3,
            text: "More than three modules usually means the client wants a unicorn — ask which modules the day-one work actually touches." }
        ] } },
      { id: "implementation", label: "Implementation & Config", icon: "🔧", deepDive: {
        intro: "Greenfield vs. support vs. migration are different profiles.",
        questions: [
          { id: "phase", type: "chips", label: "Project phase / type?",
            options: ["Greenfield implementation", "Rollout / template", "Migration (e.g., ECC→S/4)", "Support / AMS", "Optimization / enhancement"] }
        ],
        tips: [
          { when: a => (a.phase || []).includes("Migration (e.g., ECC→S/4)"),
            text: "A migration wants someone who's completed that exact migration before — make it a screening filter, not a nice-to-have." }
        ] } },
      { id: "integrations", label: "Integrations", icon: "🔗", deepDive: {
        intro: "Integration scope pulls the role toward technical.",
        questions: [
          { id: "tech", type: "chips", label: "Integration tech?",
            options: ["Middleware (PI/PO, MuleSoft, Boomi)", "APIs / web services", "EDI", "iPaaS", "Custom interfaces"] }
        ], tips: [] } },
      { id: "technical_dev", label: "Technical / Development", icon: "💻", deepDive: {
        intro: "Development skills (ABAP, extensions) define techno-functional roles.",
        questions: [
          { id: "skills", type: "chips", label: "Development skills?",
            options: ["ABAP", "Custom reports (SQR/BI Publisher)", "Workflow", "Extensions / customization", "Scripting"] }
        ], tips: [] } },
      { id: "business_analysis", label: "Business Analysis & Requirements", icon: "📋", deepDive: {
        intro: "BA-heavy roles need process and stakeholder skills over config.",
        questions: [
          { id: "scope", type: "chips", label: "BA scope?",
            options: ["Requirements gathering", "Process mapping / redesign", "UAT / testing", "Training / change management", "Documentation"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "ERP vendors are shipping AI copilots (SAP Joule, Dynamics Copilot) and intelligent automation fast.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["Platform AI features (Joule/Copilot)", "AI-assisted config/reporting", "Intelligent automation / RPA", "AI-driven analytics", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "SAP Joule, Copilot, Power Automate, UiPath…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Platform AI features (Joule/Copilot)"),
            text: "Experience with the platform's specific AI copilot is brand-new and scarce — treat it as a strong differentiator, not a baseline expectation." }
        ] } }
    ],
    specialists: [
      { label: "Functional Consultant", overlapsArea: "modules" },
      { label: "Technical / ABAP Developer", overlapsArea: "technical_dev" },
      { label: "Business Analyst", overlapsArea: "business_analysis" },
      { label: "Project Manager", overlapsArea: null },
      { label: "Integration Specialist", overlapsArea: "integrations" },
      { label: "Basis / Admin", overlapsArea: null }
    ],
    profileRules: [
      { must: ["platform", "modules"], profile: "Functional ERP consultant",
        detail: "Target consultants named by platform+module (e.g., 'SAP FICO consultant'). That exact combo is the filter." },
      { must: ["technical_dev", "integrations"], profile: "Technical / techno-functional consultant",
        detail: "Target technical consultants / developers on the platform. Dev + integration skills are the filters." },
      { must: ["implementation", "business_analysis"], profile: "Implementation lead / BA",
        detail: "Target implementation consultants and BAs. Full-lifecycle implementation experience is the filter." }
    ],
    stackCategories: [
      { id: "platform", label: "ERP platform / version", placeholder: "SAP S/4HANA, Workday, Dynamics 365…" },
      { id: "modules", label: "Modules", placeholder: "FICO, MM, HCM…" },
      { id: "integration", label: "Integration / middleware", placeholder: "MuleSoft, Boomi, PI/PO…" },
      { id: "reporting", label: "Reporting / BI", placeholder: "SAP BW, Power BI, BI Publisher…" },
      { id: "dev", label: "Development tools", placeholder: "ABAP, workflow, extensions…" },
      { id: "pm", label: "Project / ALM tools", placeholder: "Solution Manager, Jira, ServiceNow…" }
    ],
    aiUseCases: ["Report / query generation", "Configuration assistance", "Documentation",
                 "Test-case generation", "Data migration assist", "Requirements drafting"],
    metrics: ["On-time implementation", "On-budget delivery", "User adoption", "Defect / rework rate",
              "Process efficiency gains", "Ticket resolution time", "Go-live success"],
    backgrounds: ["Manufacturing", "Retail / CPG", "Financial Services", "Healthcare", "Public sector",
                  "Consulting / SI", "Enterprise", "Pharma"]
  },

  /* -------------------------------------------- TECHNICAL PROJECT MANAGER */
  technical_pm: {
    label: "Technical Project / Program Manager",
    icon: "🗓️",
    tagline: "Delivery, agile, programs, and stakeholders",
    blurb: "This role ranges from a scrum-focused delivery lead running one team, to a Technical Program Manager (TPM) coordinating many teams toward a shared outcome. The methodology, the technical-depth bar, and the project-vs-program scope are the key filters — pin the 70–80%.",
    timePrompt: "“What three things will consume most of this PM's week — and roughly what percentage each?”",
    focusAreas: [
      { id: "delivery", label: "Delivery & SDLC", icon: "📋", deepDive: {
        intro: "What they deliver and how big defines the level.",
        questions: [
          { id: "types", type: "chips", label: "What do they deliver?",
            options: ["Software product / features", "Platform / infrastructure", "Integrations / migrations", "Data / analytics", "Client / professional-services projects"] },
          { id: "concurrent", type: "select", label: "Concurrent projects / teams?",
            options: ["1", "2–3", "4–6", "7+"] }
        ],
        tips: [
          { when: a => ["4–6", "7+"].includes(a.concurrent),
            text: "Coordinating many teams/projects is program-management, not single-project PM — screen for portfolio/program experience, and consider making Program / Portfolio a must-have." }
        ] } },
      { id: "program", label: "Program / Portfolio Mgmt", icon: "🗂️", deepDive: {
        intro: "Coordinating multiple projects/teams toward a shared outcome is a distinct discipline from single-project PM — this is the TPM half of the role.",
        questions: [
          { id: "scope", type: "chips", label: "Program scope?",
            options: ["Multiple related projects", "Cross-team coordination", "Portfolio governance", "Program-level roadmap", "Outcome / OKR ownership"] },
          { id: "teams", type: "select", label: "Teams / workstreams coordinated?",
            options: ["2–3", "4–6", "7–10", "10+"] },
          { id: "framework", type: "radio", label: "Scaled framework?",
            options: ["SAFe", "Scrum-of-Scrums / LeSS", "Custom / none", "Not sure"] }
        ],
        tips: [
          { when: a => ["7–10", "10+"].includes(a.teams),
            text: "Coordinating 7+ teams is senior TPM territory — screen for program-level track record and executive stakeholder management, not just project delivery." }
        ] } },
      { id: "methodology", label: "Agile / Methodology", icon: "🔄", deepDive: {
        intro: "Formal agile role vs. general agile fluency are different asks.",
        questions: [
          { id: "method", type: "radio", label: "Methodology?",
            options: ["Scrum", "Kanban", "SAFe / scaled agile", "Waterfall", "Hybrid"] },
          { id: "role", type: "radio", label: "Formal role?",
            options: ["Scrum Master", "Project/Program Manager", "Both", "Delivery Lead"] },
          { id: "cert", type: "radio", label: "Certification expectation?",
            options: ["Required (PMP/CSM/SAFe)", "Preferred", "Not important"] }
        ],
        tips: [
          { when: a => a.method === "SAFe / scaled agile",
            text: "SAFe experience is a specific, screenable requirement — confirm it's truly required; it narrows the pool." }
        ] } },
      { id: "technical", label: "Technical Fluency", icon: "🧠", deepDive: {
        intro: "How technical the PM must be shapes the whole search.",
        questions: [
          { id: "level", type: "radio", label: "Technical depth needed?",
            options: ["Former engineer / deeply technical", "Conversant with architecture & tradeoffs", "Coordination-focused"] },
          { id: "domains", type: "chips", label: "Domains they must understand?",
            options: ["Cloud / infra", "APIs / integrations", "Data / ML", "Mobile / web", "Security"] }
        ],
        tips: [
          { when: a => a.level === "Former engineer / deeply technical",
            text: "A former-engineer PM is a narrower, pricier pool — confirm whether deep technical debate is truly part of the day-to-day." }
        ] } },
      { id: "stakeholders", label: "Stakeholder & Exec Mgmt", icon: "🤝", deepDive: {
        intro: "Audience seniority and internal/external mix define the personality fit.",
        questions: [
          { id: "audience", type: "chips", label: "Who do they manage?",
            options: ["Engineering teams", "Executive stakeholders", "External clients", "Cross-functional partners"] },
          { id: "seniority", type: "radio", label: "Most senior audience?",
            options: ["Working teams", "Director level", "VP / C-suite"] }
        ], tips: [] } },
      { id: "budget_vendor", label: "Budget & Vendor Mgmt", icon: "💰", deepDive: {
        intro: "Budget and vendor ownership is a real accountability jump.",
        questions: [
          { id: "budget", type: "select", label: "Budget owned?",
            options: ["None", "Under $500k", "$500k–$2M", "$2M–$10M", "$10M+"] },
          { id: "vendors", type: "radio", label: "Manage vendors / offshore teams?",
            options: ["Yes", "No", "Occasionally"] }
        ], tips: [] } },
      { id: "risk", label: "Risk & Dependency Mgmt", icon: "⚠️", deepDive: {
        intro: "Risk and dependency management is where technical PMs earn their keep.",
        questions: [
          { id: "scope", type: "chips", label: "What's in scope?",
            options: ["Risk management", "Cross-team dependencies", "Release / launch management", "Roadmap / planning"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "AI shows up for PMs as productivity tooling and as programs that deliver AI/ML products.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["AI-assisted PM (status/summaries/planning)", "Managing AI/ML projects", "Driving AI tooling adoption", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "Copilot, ChatGPT/Claude, AI-enabled PM tools…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Managing AI/ML projects"),
            text: "Managing AI/ML programs needs enough AI literacy to gauge feasibility, data readiness, and risk — screen for prior AI/ML delivery, not just general PM." }
        ] } }
    ],
    specialists: [
      { label: "Scrum Master", overlapsArea: "methodology" },
      { label: "Product Owner / Manager", overlapsArea: null },
      { label: "Business Analyst", overlapsArea: null },
      { label: "Engineering Manager", overlapsArea: null },
      { label: "Developers", overlapsArea: null },
      { label: "QA Engineer", overlapsArea: null }
    ],
    profileRules: [
      { must: ["program", "stakeholders"], profile: "Technical Program Manager (TPM)",
        detail: "Target TPM titles who coordinate multiple teams toward outcomes. Program-level delivery and exec stakeholder management are the filters." },
      { must: ["program", "budget_vendor"], profile: "Senior program / portfolio manager",
        detail: "Target program/portfolio-manager titles. Multi-workstream ownership plus budget and vendor governance are the filters." },
      { must: ["delivery", "technical"], profile: "Technical delivery / project manager",
        detail: "Target technical PM titles who came up through engineering. Single-team delivery track record + technical fluency are the filters." },
      { must: ["methodology", "delivery"], profile: "Agile delivery lead / Scrum Master",
        detail: "Target Scrum Master / agile delivery titles. Certifications and team-health outcomes are the filters." }
    ],
    stackCategories: [
      { id: "pm", label: "PM / ticketing", placeholder: "Jira, Azure DevOps, Asana…" },
      { id: "roadmap", label: "Roadmapping", placeholder: "Aha!, Productboard, Jira Advanced Roadmaps…" },
      { id: "docs", label: "Docs / collaboration", placeholder: "Confluence, Notion, SharePoint…" },
      { id: "cicd", label: "Delivery / CI visibility", placeholder: "GitHub, GitLab, Jenkins dashboards…" },
      { id: "reporting", label: "Reporting / analytics", placeholder: "Power BI, Jira dashboards…" },
      { id: "resourcing", label: "Resourcing / time", placeholder: "Smartsheet, Float, Tempo…" }
    ],
    aiUseCases: ["Status reporting", "Meeting summaries", "Risk analysis", "Resource planning",
                 "Documentation", "Estimate assistance"],
    metrics: ["On-time delivery", "On-budget delivery", "Scope adherence", "Team velocity",
              "Program / roadmap milestones", "Cross-team dependency health", "Stakeholder satisfaction",
              "Defect / escape rate", "Release cadence", "Cycle time"],
    backgrounds: BG_COMMON.concat(["Healthcare", "E-commerce", "Agency"])
  },

  /* --------------------------------------------------- AI ENGINEER (LLM) */
  ai_engineer: {
    label: "AI Engineer (GenAI / LLM)",
    icon: "🧠",
    tagline: "LLM apps, RAG, agents, and evaluation",
    blurb: "The newest and fastest-moving role — building with LLMs rather than training classical models. Pin whether it's application-building (RAG/agents), model work (fine-tuning), or platform/LLMOps. It overlaps with ML Engineering but the day-to-day is distinct.",
    timePrompt: "“Between LLM app development, retrieval, evaluation, and productionizing — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "llm_apps", label: "LLM Application Development", icon: "💬", deepDive: {
        intro: "The core of most GenAI roles today — building on top of models.",
        questions: [
          { id: "apps", type: "chips", label: "What are they building?",
            options: ["RAG / knowledge assistants", "Chatbots / copilots", "Agents / tool-use", "Summarization / extraction", "Content generation"] },
          { id: "providers", type: "chips", label: "Which model providers?",
            options: ["OpenAI", "Anthropic", "Google (Gemini)", "Open models (Llama/Mistral)", "Azure OpenAI", "AWS Bedrock"] }
        ],
        tips: [
          { when: a => (a.apps || []).includes("Agents / tool-use"),
            text: "Agentic systems are cutting-edge and few engineers have shipped them to production — treat real agent experience as a strong differentiator." }
        ] } },
      { id: "prompt_eval", label: "Prompt Engineering & Evaluation", icon: "🎯", deepDive: {
        intro: "Evaluation maturity separates serious AI engineers from demo-builders.",
        questions: [
          { id: "scope", type: "chips", label: "What's expected?",
            options: ["Prompt design / optimization", "Eval frameworks / benchmarks", "Guardrails / safety", "Human-in-the-loop / feedback"] },
          { id: "eval_rigor", type: "radio", label: "How rigorous is evaluation?",
            options: ["Formal eval pipelines", "Some structured testing", "Ad hoc / vibes"] }
        ],
        tips: [
          { when: a => a.eval_rigor === "Formal eval pipelines",
            text: "Formal LLM evaluation is a rare, high-signal skill — screen for candidates who can describe their eval methodology, not just prompts." }
        ] } },
      { id: "retrieval", label: "Vector DBs & Retrieval", icon: "🧲", deepDive: {
        intro: "Retrieval quality is where most RAG systems live or die.",
        questions: [
          { id: "vectordb", type: "chips", label: "Vector store?",
            options: ["Pinecone", "Weaviate", "pgvector", "Chroma", "Elasticsearch / OpenSearch", "Milvus"] },
          { id: "techniques", type: "chips", label: "Retrieval techniques?",
            options: ["Embeddings / semantic search", "Hybrid search", "Re-ranking", "Chunking strategy", "Knowledge graphs"] }
        ], tips: [] } },
      { id: "finetuning", label: "Fine-tuning & Training", icon: "🎓", deepDive: {
        intro: "Fine-tuning is a distinct, deeper skill than prompting.",
        questions: [
          { id: "scope", type: "chips", label: "Model customization?",
            options: ["Fine-tuning (LoRA/PEFT)", "RLHF / preference tuning", "Full training", "Distillation", "None — API-only"] }
        ],
        tips: [
          { when: a => (a.scope || []).includes("Full training") || (a.scope || []).includes("RLHF / preference tuning"),
            text: "Full training or RLHF pushes this toward an ML-research profile — confirm it's needed; most 'AI Engineer' roles are API/fine-tune only." }
        ] } },
      { id: "llmops", label: "LLMOps / Production", icon: "🚀", deepDive: {
        intro: "Shipping and monitoring LLM systems in production is the engineering half.",
        questions: [
          { id: "scope", type: "chips", label: "Production scope?",
            options: ["Deployment / serving", "Monitoring / observability", "Cost / latency optimization", "Caching", "Guardrails in prod"] },
          { id: "scale", type: "text", label: "Scale / volume?", placeholder: "e.g., requests/day, users, latency SLA" }
        ], tips: [] } },
      { id: "ai_infra", label: "Backend / Infra for AI", icon: "⚙️", deepDive: {
        intro: "AI engineers still need to build real backend systems.",
        questions: [
          { id: "langs", type: "chips", label: "Languages / frameworks?",
            options: ["Python", "TypeScript / Node", "LangChain", "LlamaIndex", "FastAPI", "Vercel AI SDK"] },
          { id: "compute", type: "radio", label: "GPU / compute ownership?",
            options: ["Manages GPU infra", "Uses managed inference", "N/A"] }
        ], tips: [] } }
    ],
    specialists: [
      { label: "ML Engineer", overlapsArea: "finetuning" },
      { label: "Data Scientist", overlapsArea: null },
      { label: "Backend Engineer", overlapsArea: "ai_infra" },
      { label: "Data Engineer", overlapsArea: "retrieval" },
      { label: "MLOps Engineer", overlapsArea: "llmops" },
      { label: "Product Manager", overlapsArea: null }
    ],
    profileRules: [
      { must: ["llm_apps", "retrieval"], profile: "GenAI application engineer",
        detail: "Target engineers who've shipped RAG/LLM apps. Retrieval quality and app architecture are the filters." },
      { must: ["finetuning", "llmops"], profile: "ML / LLM platform engineer",
        detail: "Target ML engineers with model-customization depth. Fine-tuning and production LLMOps are the filters." },
      { must: ["prompt_eval", "llm_apps"], profile: "Applied AI engineer",
        detail: "Target applied-AI engineers who pair strong prompting/eval with app-building. Shipped GenAI features are the filter." }
    ],
    stackCategories: [
      { id: "providers", label: "LLM providers / frameworks", placeholder: "OpenAI, Anthropic, LangChain, LlamaIndex…" },
      { id: "vectordb", label: "Vector DB / retrieval", placeholder: "Pinecone, pgvector, Weaviate…" },
      { id: "lang", label: "Languages", placeholder: "Python, TypeScript…" },
      { id: "mlops", label: "LLMOps / serving", placeholder: "LangSmith, Weights & Biases, Bedrock…" },
      { id: "cloud", label: "Cloud / GPU", placeholder: "AWS, Azure, GCP, Modal, Replicate…" },
      { id: "data", label: "Data / backend", placeholder: "Postgres, FastAPI, Redis…" }
    ],
    aiUseCases: ["Code generation", "Eval automation", "Synthetic data generation",
                 "Prompt testing", "Documentation", "Research / literature review"],
    metrics: ["Response quality / eval score", "Latency", "Cost per query", "Hallucination / accuracy rate",
              "Adoption / usage", "Deployment velocity", "Retrieval precision"],
    backgrounds: ["AI / ML startup", "Product company", "B2B SaaS", "Enterprise", "Research lab",
                  "Fintech", "Consulting / SI"]
  },

  /* ------------------------------------------------ FULL-STACK DEVELOPER */
  fullstack_developer: {
    label: "Full-Stack Developer",
    icon: "🧩",
    tagline: "Front-end, back-end, and everything between",
    blurb: "'Full-stack' always has a center of gravity — few are equally deep on both ends. Find where they actually spend their time and which end matters most for this team.",
    timePrompt: "“What three things carry most of this developer's week across front-end, back-end, data, and infra — and roughly what percentage each?”",
    focusAreas: [
      { id: "frontend", label: "Front-End", icon: "🖌️", deepDive: {
        intro: "Front-end framework is a hard filter even for full-stack.",
        questions: [
          { id: "framework", type: "chips", label: "Front-end framework?",
            options: ["React", "Vue", "Angular", "Next.js", "Svelte"] },
          { id: "ts", type: "radio", label: "TypeScript?", options: ["Required", "Preferred", "Not used"] }
        ], tips: [] } },
      { id: "backend", label: "Back-End", icon: "🖥️", deepDive: {
        intro: "Back-end language/framework is the other hard filter.",
        questions: [
          { id: "language", type: "chips", label: "Back-end language?",
            options: ["Node / TypeScript", "Python", "Java", "C# / .NET", "Go", "Ruby", "PHP"] },
          { id: "framework", type: "text", label: "Framework?", placeholder: "Express, Django, Spring, .NET, Rails" }
        ], tips: [] } },
      { id: "balance", label: "Front/Back Balance", icon: "⚖️", deepDive: {
        intro: "The center of gravity determines who you target.",
        questions: [
          { id: "split", type: "radio", label: "Where's the center of gravity?",
            options: ["Front-end-leaning", "Balanced", "Back-end-leaning"] }
        ],
        tips: [
          { when: a => a.split === "Balanced",
            text: "Truly balanced full-stack is the rarest and priciest — most 'full-stack' engineers lean one way. Confirm the client will accept a lean." }
        ] } },
      { id: "databases", label: "Databases & Data", icon: "🗄️", deepDive: {
        intro: "Data-layer depth varies widely in full-stack roles.",
        questions: [
          { id: "db", type: "text", label: "Databases?", placeholder: "PostgreSQL, MySQL, MongoDB, Redis" }
        ], tips: [] } },
      { id: "cloud_devops", label: "Cloud & DevOps", icon: "☁️", deepDive: {
        intro: "How much infra ownership the role carries.",
        questions: [
          { id: "scope", type: "chips", label: "Cloud / DevOps scope?",
            options: ["Deploys own apps", "Cloud (AWS/Azure/GCP)", "Docker / K8s", "CI/CD", "IaC"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "Full-stack engineers are often the ones wiring LLM features end-to-end.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["Building AI/LLM app features", "Integrating AI APIs", "RAG / vector search", "AI-assisted coding", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "OpenAI/Anthropic APIs, LangChain, Vercel AI SDK, pgvector…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Building AI/LLM app features"),
            text: "If shipping AI features is core, that edges toward the AI Engineer profile — confirm the depth of AI vs. general full-stack work." }
        ] } }
    ],
    specialists: [
      { label: "Front-End Developer", overlapsArea: "frontend" },
      { label: "Back-End Developer", overlapsArea: "backend" },
      { label: "DevOps / SRE", overlapsArea: "cloud_devops" },
      { label: "UI / UX Designer", overlapsArea: null },
      { label: "QA Engineer", overlapsArea: null },
      { label: "Product Manager", overlapsArea: null }
    ],
    profileRules: [
      { must: ["frontend", "backend"], profile: "True full-stack engineer",
        detail: "Target full-stack titles comfortable on both ends. Shipped end-to-end features are the filter." },
      { must: ["backend", "databases"], profile: "Back-end-leaning full-stack",
        detail: "Target back-end engineers who also do front-end. Services and data depth are the filters." },
      { must: ["frontend", "cloud_devops"], profile: "Front-end / product engineer",
        detail: "Target product engineers who own UI plus deployment. Front-end depth and shipping autonomy are the filters." }
    ],
    stackCategories: [
      { id: "frontend", label: "Front-end", placeholder: "React, TypeScript, Tailwind…" },
      { id: "backend", label: "Back-end languages", placeholder: "Node, Python, Java, .NET…" },
      { id: "db", label: "Databases", placeholder: "PostgreSQL, MongoDB, Redis…" },
      { id: "cloud", label: "Cloud / DevOps", placeholder: "AWS, Docker, GitHub Actions…" },
      { id: "testing", label: "Testing", placeholder: "Jest, Playwright, Cypress…" },
      { id: "build", label: "Build tools", placeholder: "Vite, Webpack, Turborepo…" }
    ],
    aiUseCases: ["Code generation", "Code review", "Test generation", "Documentation", "Debugging"],
    metrics: ["Feature velocity", "Uptime", "Defect rate", "Core Web Vitals", "Test coverage", "Deployment frequency"],
    backgrounds: BG_COMMON.concat(["E-commerce", "Healthcare", "Agency"])
  },

  /* --------------------------------------------------- MOBILE DEVELOPER */
  mobile_developer: {
    label: "Mobile Developer",
    icon: "📱",
    tagline: "Native, cross-platform, and app delivery",
    blurb: "Mobile splits sharply by platform — iOS, Android, or cross-platform — and those pools barely overlap. Pin the platform and whether it's native or cross-platform first.",
    timePrompt: "“Where will this developer spend most of the week — platform code, UI, integration, performance? Roughly what percentage each?”",
    focusAreas: [
      { id: "native", label: "Native Platform", icon: "📲", deepDive: {
        intro: "Native platform + language is the single hardest filter.",
        questions: [
          { id: "platform", type: "chips", label: "Which platform(s)?",
            options: ["iOS (Swift)", "iOS (Objective-C)", "Android (Kotlin)", "Android (Java)"] },
          { id: "years", type: "select", label: "Years on that platform?", options: ["1–2", "3–5", "6–8", "9+"] }
        ],
        tips: [
          { when: a => (a.platform || []).some(p => p.indexOf("iOS") === 0) && (a.platform || []).some(p => p.indexOf("Android") === 0),
            text: "Wanting deep native iOS AND Android in one person is rare — most engineers specialize. Consider cross-platform or two hires." }
        ] } },
      { id: "cross", label: "Cross-Platform", icon: "🔀", deepDive: {
        intro: "Cross-platform is a different toolchain and mindset than native.",
        questions: [
          { id: "framework", type: "radio", label: "Framework?",
            options: ["React Native", "Flutter", "Kotlin Multiplatform", "MAUI / Xamarin", "None (native only)"] }
        ],
        tips: [
          { when: a => a.framework === "Flutter",
            text: "Flutter (Dart) is a distinct pool from React Native — don't assume they cross-apply." }
        ] } },
      { id: "ui", label: "UI / UX Implementation", icon: "🎨", deepDive: {
        intro: "Fidelity to design and modern UI toolkits matter.",
        questions: [
          { id: "toolkits", type: "chips", label: "UI toolkits?",
            options: ["SwiftUI", "UIKit", "Jetpack Compose", "XML layouts"] }
        ], tips: [] } },
      { id: "api", label: "API & Data", icon: "🔌", deepDive: {
        intro: "Integration and local data handling shape the day-to-day.",
        questions: [
          { id: "scope", type: "chips", label: "Integration scope?",
            options: ["REST", "GraphQL", "Offline / local storage", "Push notifications", "Real-time / sockets"] }
        ], tips: [] } },
      { id: "quality", label: "Performance & Release", icon: "🚀", deepDive: {
        intro: "Store release management and performance separate seniors.",
        questions: [
          { id: "scope", type: "chips", label: "What's expected?",
            options: ["App performance / profiling", "CI/CD (Fastlane etc.)", "App Store / Play submission", "Crash monitoring", "Automated testing"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "AI reaches mobile via on-device ML, AI-assisted coding, and in-app AI features.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["On-device ML (Core ML / ML Kit)", "Building AI/LLM app features", "AI-assisted coding", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "Core ML, ML Kit, on-device LLMs, OpenAI APIs…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("On-device ML (Core ML / ML Kit)"),
            text: "On-device ML is a specialized mobile skill — screen for shipped Core ML / ML Kit work if it's core." }
        ] } }
    ],
    specialists: [
      { label: "iOS Developer", overlapsArea: "native" },
      { label: "Android Developer", overlapsArea: "native" },
      { label: "Back-End Developer", overlapsArea: "api" },
      { label: "UI / UX Designer", overlapsArea: "ui" },
      { label: "QA Engineer", overlapsArea: "quality" },
      { label: "DevOps Engineer", overlapsArea: null }
    ],
    profileRules: [
      { must: ["native", "ui"], profile: "Native mobile engineer",
        detail: "Target native iOS/Android engineers. Platform depth and shipped apps are the filters." },
      { must: ["cross", "api"], profile: "Cross-platform mobile engineer",
        detail: "Target React Native / Flutter engineers. Cross-platform apps in production are the filter." },
      { must: ["native", "quality"], profile: "Senior mobile engineer",
        detail: "Target senior mobile engineers who own performance and release. Store track record is the filter." }
    ],
    stackCategories: [
      { id: "lang", label: "Languages / frameworks", placeholder: "Swift, Kotlin, React Native, Flutter…" },
      { id: "cross", label: "Cross-platform", placeholder: "React Native, Flutter…" },
      { id: "backend", label: "Backend / API", placeholder: "REST, GraphQL, Firebase…" },
      { id: "cicd", label: "CI/CD (mobile)", placeholder: "Fastlane, Bitrise, App Center…" },
      { id: "testing", label: "Testing", placeholder: "XCTest, Espresso, Appium…" },
      { id: "analytics", label: "Analytics / crash", placeholder: "Firebase, Crashlytics, Sentry…" }
    ],
    aiUseCases: ["Code generation", "Test generation", "Documentation", "Crash analysis"],
    metrics: ["App store rating", "Crash-free rate", "App performance / load time", "Release cadence", "Adoption / retention"],
    backgrounds: BG_COMMON.concat(["Consumer apps", "E-commerce", "Fintech", "Healthcare", "Gaming"])
  },

  /* ---------------------------------------------------- CLOUD ARCHITECT */
  cloud_architect: {
    label: "Cloud Architect",
    icon: "☁️",
    tagline: "Cloud platform, solutions, migration, and cost",
    blurb: "A Cloud Architect designs the target state and the path to it. Cloud-platform depth and whether the role is design-only vs. hands-on are the key filters — plus certifications, which the market takes seriously here.",
    timePrompt: "“Between platform architecture, solutioning, migration, security, and cost — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "platform_arch", label: "Cloud Platform Architecture", icon: "🏛️", deepDive: {
        intro: "Cloud depth and certifications are the hardest filters.",
        questions: [
          { id: "cloud", type: "chips", label: "Primary cloud?", options: ["AWS", "Azure", "GCP", "Multi-cloud", "Hybrid / on-prem"] },
          { id: "certs", type: "radio", label: "Certification expectation?",
            options: ["Required (Pro / Architect-level)", "Preferred", "Not important"] },
          { id: "handson", type: "radio", label: "Hands-on or design-only?",
            options: ["Hands-on architect", "Design + oversight", "Design-only / advisory"] }
        ],
        tips: [
          { when: a => (a.cloud || []).length >= 3,
            text: "True architect-level depth across 3+ clouds is very rare — confirm which cloud is primary; the rest are usually 'nice to have'." }
        ] } },
      { id: "solution_arch", label: "Solution / App Architecture", icon: "🏗️", deepDive: {
        intro: "Application-architecture depth tells you how close to engineering the role sits.",
        questions: [
          { id: "scope", type: "chips", label: "Architecture scope?",
            options: ["Microservices / distributed", "Serverless", "Event-driven", "Data / analytics platforms", "Well-Architected reviews"] }
        ], tips: [] } },
      { id: "migration", label: "Migration & Modernization", icon: "🚚", deepDive: {
        intro: "Migration vs. greenfield vs. modernization are different profiles.",
        questions: [
          { id: "type", type: "chips", label: "What kind of work?",
            options: ["Data-center → cloud migration", "Re-platform / re-factor", "Greenfield cloud-native", "Cloud-to-cloud"] }
        ],
        tips: [
          { when: a => (a.type || []).includes("Data-center → cloud migration"),
            text: "Large migration programs want someone who's led that exact journey — make prior migration leadership a screening filter." }
        ] } },
      { id: "security_gov", label: "Security & Governance", icon: "🛡️", deepDive: {
        intro: "Cloud security/governance ownership adds compliance weight.",
        questions: [
          { id: "scope", type: "chips", label: "Scope?",
            options: ["IAM / landing zones", "Compliance (SOC2/HIPAA/etc.)", "Network security", "Policy / guardrails"] }
        ], tips: [] } },
      { id: "finops", label: "Cost & FinOps", icon: "💰", deepDive: {
        intro: "Cost optimization is increasingly a core architect mandate.",
        questions: [
          { id: "scope", type: "chips", label: "FinOps scope?",
            options: ["Cost optimization", "Budgeting / forecasting", "Tagging / allocation", "FinOps practice"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "Architects are increasingly asked to design AI/ML and GenAI platforms on cloud.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["Architecting AI/ML platforms", "GenAI / LLM infrastructure", "AI landing zones / governance", "AI-assisted architecture", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI platforms / skills?", placeholder: "SageMaker, Vertex, Bedrock, Azure OpenAI…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("GenAI / LLM infrastructure"),
            text: "Designing GenAI/LLM infrastructure is a new, in-demand architecture skill — screen for real deployments, not slideware." }
        ] } }
    ],
    specialists: [
      { label: "DevOps / SRE", overlapsArea: null },
      { label: "Cloud Engineer", overlapsArea: "platform_arch" },
      { label: "Security Engineer", overlapsArea: "security_gov" },
      { label: "Solutions Architect", overlapsArea: "solution_arch" },
      { label: "Network Engineer", overlapsArea: null },
      { label: "Back-End Developer", overlapsArea: null }
    ],
    profileRules: [
      { must: ["platform_arch", "solution_arch"], profile: "Cloud solutions architect",
        detail: "Target solutions-architect titles with the named cloud. Certs and reference architectures are the filters." },
      { must: ["platform_arch", "migration"], profile: "Cloud migration architect",
        detail: "Target architects who've led migrations. Prior data-center-to-cloud programs are the filter." },
      { must: ["security_gov", "finops"], profile: "Cloud governance / FinOps architect",
        detail: "Target architects who own security and cost. Landing zones and FinOps practice are the filters." }
    ],
    stackCategories: [
      { id: "cloud", label: "Cloud platform", placeholder: "AWS, Azure, GCP…" },
      { id: "iac", label: "IaC", placeholder: "Terraform, CloudFormation…" },
      { id: "arch", label: "Architecture / diagramming", placeholder: "Lucidchart, draw.io, C4…" },
      { id: "containers", label: "Containers / serverless", placeholder: "Kubernetes, Lambda…" },
      { id: "security", label: "Security tools", placeholder: "IAM, CSPM, Wiz…" },
      { id: "cost", label: "Cost / FinOps", placeholder: "Cost Explorer, CloudHealth…" }
    ],
    aiUseCases: ["Architecture assistance", "Documentation", "Cost analysis", "IaC generation"],
    metrics: ["Cost savings", "Availability / uptime", "Migration success", "Well-Architected score", "Time-to-provision", "Security posture"],
    backgrounds: BG_COMMON.concat(["Healthcare", "Financial Services", "Government", "MSP / consulting"])
  },

  /* -------------------------------------------------- SECURITY ENGINEER */
  security_engineer: {
    label: "Security Engineer",
    icon: "🔒",
    tagline: "AppSec, cloud, SecOps, IAM, and compliance",
    blurb: "Security spans offensive, defensive, cloud, and governance — a pentester and a GRC analyst share a title but not a skill set. Pin the security domain first; it's most of the search.",
    timePrompt: "“Across app security, cloud security, operations, and compliance — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "appsec", label: "Application Security", icon: "🛡️", deepDive: {
        intro: "AppSec ties security to the SDLC and code.",
        questions: [
          { id: "scope", type: "chips", label: "AppSec scope?",
            options: ["SAST / DAST", "Secure code review", "Threat modeling", "Secure SDLC / DevSecOps", "SCA / dependencies"] },
          { id: "coding", type: "radio", label: "Coding ability expected?",
            options: ["Strong (can code / review)", "Some", "Minimal"] }
        ],
        tips: [
          { when: a => a.coding === "Strong (can code / review)",
            text: "Code-capable AppSec engineers are scarce and pricey — confirm the depth and target software-security backgrounds." }
        ] } },
      { id: "cloud_sec", label: "Cloud Security", icon: "☁️", deepDive: {
        intro: "Cloud security is the fastest-growing security specialty.",
        questions: [
          { id: "cloud", type: "chips", label: "Which cloud?", options: ["AWS", "Azure", "GCP", "Multi-cloud"] },
          { id: "scope", type: "chips", label: "Scope?",
            options: ["CSPM / posture", "IAM / least privilege", "Container / K8s security", "Cloud IR"] }
        ], tips: [] } },
      { id: "secops", label: "Security Operations / IR", icon: "🚨", deepDive: {
        intro: "SOC / detection / IR is the defensive operations half.",
        questions: [
          { id: "scope", type: "chips", label: "SecOps scope?",
            options: ["SIEM / monitoring", "Threat detection / hunting", "Incident response", "SOAR / automation", "Forensics"] },
          { id: "tools", type: "text", label: "SIEM / tools?", placeholder: "Splunk, Sentinel, CrowdStrike, Wazuh" }
        ], tips: [] } },
      { id: "iam", label: "IAM & Zero Trust", icon: "🔑", deepDive: {
        intro: "Identity is increasingly the core security perimeter.",
        questions: [
          { id: "scope", type: "chips", label: "IAM scope?",
            options: ["SSO / federation", "PAM", "Zero Trust", "IGA / governance", "MFA"] }
        ], tips: [] } },
      { id: "grc", label: "Compliance & GRC", icon: "📋", deepDive: {
        intro: "GRC is a distinct, less hands-on-technical track.",
        questions: [
          { id: "frameworks", type: "chips", label: "Frameworks?",
            options: ["SOC 2", "ISO 27001", "PCI DSS", "HIPAA", "NIST / CMMC", "FedRAMP"] }
        ],
        tips: [
          { when: a => (a.frameworks || []).includes("FedRAMP") || (a.frameworks || []).includes("NIST / CMMC"),
            text: "FedRAMP/NIST/CMMC usually means government work — clearance and citizenship requirements often apply; confirm in Logistics." }
        ] } },
      { id: "offensive", label: "Offensive / Pen Testing", icon: "🗡️", deepDive: {
        intro: "Offensive security is a specialized, certification-heavy track.",
        questions: [
          { id: "scope", type: "chips", label: "Offensive scope?",
            options: ["Web app pentest", "Network pentest", "Red team", "Vulnerability assessment", "Bug bounty"] },
          { id: "certs", type: "radio", label: "Certifications?",
            options: ["Required (OSCP / etc.)", "Preferred", "Not important"] }
        ],
        tips: [
          { when: a => a.certs === "Required (OSCP / etc.)",
            text: "OSCP/offensive certs sharply narrow the pool and raise rates — confirm it's a true must-have." }
        ] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "AI shows up in security as detection tooling, security copilots, and the new job of securing AI systems.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["AI-driven threat detection", "Security copilots / triage", "Securing AI/LLM systems", "AI-assisted code scanning", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "Copilot for Security, AI SIEM, LLM security…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Securing AI/LLM systems"),
            text: "Securing AI/LLM systems (prompt injection, model risk) is brand-new — treat real experience as a rare differentiator." }
        ] } }
    ],
    specialists: [
      { label: "Security Analyst", overlapsArea: "secops" },
      { label: "Cloud Security Engineer", overlapsArea: "cloud_sec" },
      { label: "Penetration Tester", overlapsArea: "offensive" },
      { label: "GRC Analyst", overlapsArea: "grc" },
      { label: "IAM Specialist", overlapsArea: "iam" },
      { label: "DevOps Engineer", overlapsArea: null }
    ],
    profileRules: [
      { must: ["appsec", "cloud_sec"], profile: "Application / cloud security engineer",
        detail: "Target AppSec/cloud-security engineers. Secure SDLC and cloud posture are the filters." },
      { must: ["secops", "iam"], profile: "SecOps / detection engineer",
        detail: "Target SOC / detection-engineering titles. SIEM, detection, and IR are the filters." },
      { must: ["offensive", "appsec"], profile: "Offensive security engineer",
        detail: "Target pentest / red-team titles. Certs (OSCP) and engagement track record are the filters." },
      { must: ["grc", "iam"], profile: "Security / GRC analyst",
        detail: "Target GRC and identity-governance titles. Framework and audit experience are the filters." }
    ],
    stackCategories: [
      { id: "siem", label: "SIEM / SOAR", placeholder: "Splunk, Sentinel, Chronicle…" },
      { id: "cloud", label: "Cloud security", placeholder: "Wiz, Prisma, CSPM, IAM…" },
      { id: "appsec", label: "AppSec (SAST/DAST)", placeholder: "Snyk, Checkmarx, Burp…" },
      { id: "iam", label: "IAM", placeholder: "Okta, Entra ID, SailPoint…" },
      { id: "vuln", label: "Vulnerability mgmt", placeholder: "Tenable, Qualys, Rapid7…" },
      { id: "scripting", label: "Scripting", placeholder: "Python, PowerShell, Bash…" }
    ],
    aiUseCases: ["Threat detection", "Alert triage", "Code scanning", "Documentation", "Log analysis"],
    metrics: ["Vulnerabilities remediated", "MTTD", "MTTR", "Compliance posture", "Incidents", "Patch time", "False-positive rate"],
    backgrounds: BG_COMMON.concat(["Healthcare", "Financial Services", "Government / Defense", "Critical infrastructure"])
  },

  /* -------------------------------------------------- QA / TEST ENGINEER */
  qa_engineer: {
    label: "QA / Test Engineer",
    icon: "✅",
    tagline: "Automation, manual, performance, and quality",
    blurb: "QA spans hands-on manual testing to full SDET automation engineering. The automation-vs-manual split and the tech stack are the biggest filters — pin the 70–80%.",
    timePrompt: "“Between test automation, manual/exploratory, API, and performance testing — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "automation", label: "Test Automation", icon: "🤖", deepDive: {
        intro: "Automation framework and language are the hardest filters — 'has automated' isn't specific enough.",
        questions: [
          { id: "tools", type: "chips", label: "Automation frameworks / tools?",
            options: ["Selenium", "Cypress", "Playwright", "Appium", "WebdriverIO", "Custom framework"] },
          { id: "language", type: "text", label: "Language(s)?", placeholder: "Java, JavaScript/TS, Python, C#" },
          { id: "scope", type: "radio", label: "Build frameworks or write tests within one?",
            options: ["Build / architect frameworks (SDET)", "Write tests in existing framework", "Mix"] }
        ],
        tips: [
          { when: a => a.scope === "Build / architect frameworks (SDET)",
            text: "Building frameworks is an SDET/engineer skill set — target software-engineer-level QA and expect higher rates than manual/scripting QA." }
        ] } },
      { id: "manual", label: "Manual / Exploratory", icon: "🔎", deepDive: {
        intro: "Manual and exploratory testing is a distinct discipline from automation.",
        questions: [
          { id: "scope", type: "chips", label: "Manual scope?",
            options: ["Exploratory", "Test case design", "Regression", "UAT support", "Accessibility"] }
        ], tips: [] } },
      { id: "api", label: "API / Backend Testing", icon: "🔌", deepDive: {
        intro: "API testing depth signals a more technical QA.",
        questions: [
          { id: "tools", type: "chips", label: "API testing tools?",
            options: ["Postman", "REST Assured", "Karate", "SoapUI", "Custom scripts"] }
        ], tips: [] } },
      { id: "performance", label: "Performance / Load", icon: "⚡", deepDive: {
        intro: "Performance testing is a specialized, scarcer skill.",
        questions: [
          { id: "tools", type: "chips", label: "Perf tools?",
            options: ["JMeter", "k6", "Gatling", "LoadRunner", "Locust"] }
        ],
        tips: [
          { when: a => (a.tools || []).length > 0,
            text: "Performance testing is a niche within QA — if it's a must-have, screen for real load-test projects and results, not just tool exposure." }
        ] } },
      { id: "test_ops", label: "CI/CD & Test Ops", icon: "🚚", deepDive: {
        intro: "Integrating tests into pipelines separates modern QA from siloed QA.",
        questions: [
          { id: "scope", type: "chips", label: "What's expected?",
            options: ["Tests in CI/CD", "Test environments", "Test data management", "Reporting / dashboards"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "AI is entering QA via test generation, self-healing automation, and visual testing.",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["AI-assisted test generation", "Self-healing automation", "Visual / AI testing", "Testing AI/ML features", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "Testim, Applitools, mabl, Copilot…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Testing AI/ML features"),
            text: "Testing AI/ML systems (non-deterministic outputs, eval-based checks) is an emerging skill — screen for it specifically if it's core." }
        ] } }
    ],
    specialists: [
      { label: "SDET", overlapsArea: "automation" },
      { label: "Manual QA Analyst", overlapsArea: "manual" },
      { label: "Automation Engineer", overlapsArea: "automation" },
      { label: "Performance Engineer", overlapsArea: "performance" },
      { label: "DevOps Engineer", overlapsArea: "test_ops" },
      { label: "Developers", overlapsArea: null }
    ],
    profileRules: [
      { must: ["automation", "api"], profile: "SDET / automation engineer",
        detail: "Target SDET titles who build frameworks and API tests. Code + framework design are the filters." },
      { must: ["performance", "automation"], profile: "Performance / automation engineer",
        detail: "Target performance-test engineers. Load-test results at scale are the filter." },
      { must: ["manual", "test_ops"], profile: "QA analyst / quality lead",
        detail: "Target QA analyst/lead titles. Test strategy and quality process are the filters." }
    ],
    stackCategories: [
      { id: "automation", label: "Automation frameworks", placeholder: "Selenium, Playwright, Cypress…" },
      { id: "management", label: "Test management", placeholder: "TestRail, Zephyr, Xray…" },
      { id: "apiperf", label: "API / perf tools", placeholder: "Postman, JMeter, k6…" },
      { id: "cicd", label: "CI/CD", placeholder: "Jenkins, GitHub Actions…" },
      { id: "lang", label: "Languages", placeholder: "Java, JavaScript/TS, Python…" },
      { id: "bugtracking", label: "Bug tracking", placeholder: "Jira, Azure DevOps…" }
    ],
    aiUseCases: ["Test generation", "Test-data generation", "Bug triage", "Documentation", "Log analysis"],
    metrics: ["Defect detection rate", "Escaped defects", "Automation coverage %", "Test cycle time", "Release quality", "Flaky-test rate"],
    backgrounds: BG_COMMON.concat(["Healthcare", "E-commerce", "Gaming"])
  },

  /* ------------------------------------------- CRM DEVELOPER / CONSULTANT */
  crm_developer: {
    label: "CRM Developer / Consultant",
    icon: "🔷",
    tagline: "Salesforce, Dynamics, and CRM platforms",
    blurb: "CRM work is gated by platform (Salesforce vs. Dynamics vs. HubSpot) and by the config-vs-code split. An admin, a developer, and a functional consultant share the space but not the skill set. Pin platform + clouds first.",
    timePrompt: "“Between configuration, development, integration, and reporting — what three things carry most of the week, and roughly what percentage each?”",
    focusAreas: [
      { id: "platform", label: "CRM Platform", icon: "🧭", deepDive: {
        intro: "Platform is the hardest, non-negotiable filter.",
        questions: [
          { id: "platform", type: "radio", label: "Which platform?",
            options: ["Salesforce", "Microsoft Dynamics 365", "HubSpot", "ServiceNow", "Oracle / SAP CRM", "Other"] },
          { id: "certs", type: "radio", label: "Certifications?",
            options: ["Required", "Preferred", "Not important"] }
        ],
        tips: [
          { when: a => a.platform === "Salesforce" && a.certs === "Required",
            text: "Salesforce certs (Admin, PD1/PD2, Architect) are a common screening filter — confirm exactly which ones are required." }
        ] } },
      { id: "clouds", label: "Clouds / Modules", icon: "🧩", deepDive: {
        intro: "The specific cloud/module is as important as the platform.",
        questions: [
          { id: "modules", type: "chips", label: "Which clouds / modules?",
            options: ["Sales Cloud", "Service Cloud", "Marketing Cloud", "Experience Cloud", "CPQ / Revenue", "Field Service", "Commerce"] }
        ],
        tips: [
          { when: a => (a.modules || []).includes("Marketing Cloud"),
            text: "Marketing Cloud (SFMC) is a distinct specialty from core Salesforce dev — don't assume overlap; target SFMC-specific experience." }
        ] } },
      { id: "config", label: "Configuration & Admin", icon: "🔧", deepDive: {
        intro: "Declarative/admin work vs. code is the key skill split.",
        questions: [
          { id: "scope", type: "chips", label: "Declarative scope?",
            options: ["Flows / automation", "Objects / schema", "Security / profiles / permissions", "Reports / dashboards"] }
        ], tips: [] } },
      { id: "development", label: "Development", icon: "💻", deepDive: {
        intro: "Code skills (Apex/LWC/plugins) define developer vs. admin roles.",
        questions: [
          { id: "skills", type: "chips", label: "Development skills?",
            options: ["Apex", "Lightning Web Components (LWC)", "Visualforce", "Dynamics plugins / C#", "JavaScript", "APIs"] }
        ],
        tips: [
          { when: (a, s) => (a.skills || []).length > 0 && areaPriority(s, "development") === "must",
            text: "Development-heavy CRM roles are a different (pricier) pool than admin/config — target developer titles and code samples." }
        ] } },
      { id: "integrations", label: "Integrations", icon: "🔗", deepDive: {
        intro: "Integration scope pulls the role technical.",
        questions: [
          { id: "tech", type: "chips", label: "Integration tech?",
            options: ["REST / SOAP APIs", "Middleware (MuleSoft, Boomi)", "Data loaders / ETL", "Marketing / ERP integration"] }
        ], tips: [] } },
      { id: "reporting", label: "Data & Reporting", icon: "📊", deepDive: {
        intro: "Reporting and data migration are common CRM asks.",
        questions: [
          { id: "scope", type: "chips", label: "Scope?",
            options: ["Dashboards / reports", "Data migration", "Data quality", "Analytics (CRM Analytics / Tableau)"] }
        ], tips: [] } },
      { id: "ai", label: "AI / GenAI", icon: "🧠", deepDive: {
        intro: "CRM vendors are shipping AI fast (Salesforce Einstein/Agentforce, Copilot for Dynamics).",
        questions: [
          { id: "usage", type: "chips", label: "How does AI factor into this role?",
            options: ["Einstein / Agentforce", "Copilot for Dynamics", "AI-assisted config/code", "Predictive / AI features", "Not a factor"] },
          { id: "depth", type: "radio", label: "Depth of AI work?",
            options: ["Core part of the role", "Occasional / augmenting", "Just AI-assisted tooling"] },
          { id: "tools", type: "text", label: "Specific AI tools / skills?", placeholder: "Einstein, Agentforce, Copilot Studio…" }
        ],
        tips: [
          { when: a => (a.usage || []).includes("Einstein / Agentforce") || (a.usage || []).includes("Copilot for Dynamics"),
            text: "Platform AI (Einstein/Agentforce/Copilot) experience is brand-new and scarce — treat it as a differentiator, not a baseline." }
        ] } }
    ],
    specialists: [
      { label: "CRM Admin", overlapsArea: "config" },
      { label: "CRM Developer", overlapsArea: "development" },
      { label: "CRM / Functional Consultant", overlapsArea: "clouds" },
      { label: "Integration Specialist", overlapsArea: "integrations" },
      { label: "Business Analyst", overlapsArea: null },
      { label: "Marketing Ops", overlapsArea: null }
    ],
    profileRules: [
      { must: ["platform", "development"], profile: "CRM developer",
        detail: "Target platform developers (e.g., Salesforce developer). Apex/LWC or plugin code and certs are the filters." },
      { must: ["platform", "config"], profile: "CRM admin / consultant",
        detail: "Target admin/consultant titles. Declarative depth and platform certs are the filters." },
      { must: ["integrations", "development"], profile: "CRM technical / integration developer",
        detail: "Target technical CRM engineers. APIs, middleware, and code are the filters." },
      { must: ["clouds", "config"], profile: "Functional CRM consultant",
        detail: "Target functional consultants named by cloud/module. That exact combo is the filter." }
    ],
    stackCategories: [
      { id: "platform", label: "CRM platform", placeholder: "Salesforce, Dynamics 365, HubSpot…" },
      { id: "dev", label: "Dev tools", placeholder: "Apex, LWC, C# plugins…" },
      { id: "integration", label: "Integration", placeholder: "MuleSoft, Boomi, REST APIs…" },
      { id: "reporting", label: "Reporting / BI", placeholder: "CRM Analytics, Power BI, Tableau…" },
      { id: "data", label: "Data tools", placeholder: "Data Loader, dataloader.io…" },
      { id: "devops", label: "DevOps / release", placeholder: "Salesforce DX, Copado, Gearset…" }
    ],
    aiUseCases: ["Config assistance", "Code generation", "Report generation", "Documentation", "Data cleanup"],
    metrics: ["User adoption", "On-time delivery", "Data quality", "Automation / efficiency", "Defect rate", "Report usage"],
    backgrounds: BG_COMMON.concat(["Financial Services", "Healthcare", "Manufacturing", "Nonprofit"])
  }
};

/* Order roles appear in the picker */
const ROLE_ORDER = [
  "backend_engineer",
  "fullstack_developer",
  "mobile_developer",
  "data_engineer",
  "data_scientist",
  "ai_engineer",
  "devops_sre",
  "cloud_architect",
  "security_engineer",
  "qa_engineer",
  "technical_pm",
  "erp_consultant",
  "crm_developer"
];
