# Reader build and customization prompt

Use this with an approved coding assistant and the complete `apps-script/` folder. This is a reproducible build kit; generating a different application from a short description alone does not reproduce the tested code. Never paste an API key into a coding conversation.

---

Help me set up and customize **Make the Case**, a reader-owned Google Sheets tool distributed through Tomboj's Automation Thursday.

Use the supplied `Core.gs`, `Code.gs`, `Providers.gs`, `appsscript.json`, and the finished `Coach.html` as the starting point. Read `README.md` and `INTERFACE.md` before changing anything. If `Coach.html` is missing, state that the interface is pending and use `CLAUDE-DESIGN-PROMPT.md` plus the contract to generate it. Support Gemini, Claude, OpenAI, OpenRouter, and Kimi through the supplied adapters and provider-specific suggestions. Do not describe the full application as verified until it has been checked in Google Sheets with a permitted API key.

My goal is to turn knowledge of everyday work into a credible improvement case. I may have no idea, one idea, many ideas, or a proposal with feedback. Do not assume my qualifications, authority, budget, or ability to build the solution. I can contribute discovery, domain knowledge, evidence, coordination, learning, or adoption.

Explain setup one meaningful step at a time. Adapt your wording to my experience. Ask only for information needed for setup or a requested customization. I enter the key directly into my own tool's settings. Never ask me to paste it into chat, source code, a spreadsheet cell, or a shared file.

Preserve the following behavior:

1. A bound script creates five tabs: Ideas, Cases, Evidence & costs, History, Context. Cases is the source of record; Ideas and Evidence & costs are derived views. Keep stable IDs, revisions, supported headers, explicit unknowns, and the actual gateway contract.
2. A conversation builds from saved context and the selected case. Keep every idea; do not reset work between sessions or when switching providers. Explain what data goes to the selected service and any model host. Save useful AI summaries as reviewable proposals and retrieve accepted records on return.
3. The reader explicitly accepts model-proposed fields and assumptions. The AI cannot record permissions, approvals, stage, actual results, or contribution as facts. User-recorded evidence stays distinct from forecasts.
4. Calculate covered tasks, processing/checking time, ongoing support, setup effort, cash cost, and an optional attributable financial scenario using the tested code. Missing is not zero. Released time is not automatically cash savings. Never double-count capacity as an additional financial benefit.
5. Preserve permission and result references, affected people, proposed owners, collaborators, learning/support, test quality, continue/adapt/stop conditions, and a proportionate next request. A pitch does not authorize implementation.
6. Keep keys in user-specific properties and AI calls server-side. No external browser requests, analytics, background model loops, automatic retries, company-system writes, or public deployment are needed for this edition. Do not add these without my explicit request.
7. Keep the enforced daily attempt limit, request IDs, stale-revision checks, safe text rendering, literal spreadsheet text, and export without credentials. Check failures as well as the happy path. Personal Sheet records are visible to anyone with appropriate access to that Sheet; user properties do not protect against untrusted script editors.

Customization may change branding, introductory wording, suggested examples, and organization context. Changes to record fields, permissions, calculations, or the API require updates to the tests and interface contract. Do not copy internal assessment data or legacy scoring weights into a public template.

Finish with what was changed, how it was checked, remaining Google-account verification, and the exact next setup action. Do not claim measured business improvement, security certification, promotion, or job protection from generating the tool.
