# Make the Case

**Turn what you know about the work into a proposal someone can evaluate.**

Collect your ideas, develop one through a conversation, and prepare a specific next-step request. Keep the evidence, decisions, and your contribution as the work progresses. You do not have to build the solution yourself.

**Innovate or Make the Case?** [Innovate](https://github.com/rtomboj/innovate-project-development-mode/blob/main/TombojInnovateSkill.md) guides how AI works an idea through with you before jumping to solutions: flesh it out, surface missing context, compare best/cost-effective/innovative approaches, and decide what comes next. **Make the Case** organizes workplace insight into an evidence-aware proposal and a record of ideas, decisions, contributions, and results. Both can start with a rough idea; neither requires the other. [Choose a starting point](docs/reviewer-guide.md).

**[Download the Google Sheets kit — v0.5.0](downloads/make-the-case-google-sheets-v0.5.0.zip)** · **[Start here](START-HERE.md)** · **[Update an existing copy](apps-script/UPDATE-AND-TEST.md)**

This is an early-release, reader-owned kit. It uses your Google Sheet, its bound Apps Script, and your own permitted AI key. Setup requires pasting the supplied files; there is no one-click Google template or Tomboj-hosted account. See [release status and verification](STATUS.md).

![Make the Case: actual Coach file showing dialogue, progress, and the top New idea button](docs/images/coach-dialogue-v0.5.0.png)

*Actual built Coach.html in its clearly labeled fictional demonstration. No AI call or Google Sheet write occurred in this capture.*

**[See the five-view screenshot walkthrough](docs/example-gallery.md)** — conversation, editable suggestions, Kanban ideas, scenario numbers, and the pitch.

## Choose where to begin

| You want to… | Start with |
| --- | --- |
| Use the conversation coach in your own Google Sheet | [Download and setup guide](START-HERE.md) |
| Understand what the experience and output look like | [Screenshot walkthrough](docs/example-gallery.md) |
| Develop a case with an assistant using portable instructions | [Make the Case skill](skills/make-the-case/SKILL.md) — optional, separate from Innovate |
| Review the branch, its scope, and remaining verification | [Reviewer guide](docs/reviewer-guide.md) |

## What you do

| Part | What happens | What you keep |
| --- | --- | --- |
| Collect | Describe the work and retain your opportunities | Context and an idea collection, including ideas you defer |
| Develop | Scope one case, examine evidence and costs, involve people and identify permissions | Working notes, explicit unknowns, and a bounded plan |
| Advance | Prepare the next request, record feedback and decisions, and capture later results | A pitch and a contribution record with sources and shared credit |

The reply box follows the current question. AI-proposed notes stay editable until saved. A compact progress panel shows what is building; My case opens the full case, numbers, pitch, and contribution/results record. Ideas opens a Kanban board with Collect, Develop, Advance, and Decisions. Recorded outcomes include Awaiting decision, Approved, Backlogged, and Not pursuing. Completing a pitch never approves implementation.

## Get started

Download the kit and follow [Start here](START-HERE.md). Create a blank Sheet, add Code.gs, Core.gs, Providers.gs, Coach.html and the manifest to its bound Apps Script project, then run setupWorkspace. Reopen from Start Here → Open coach or the Make the Case menu. No web-app deployment is needed.

For AI conversation, open More → Settings and choose Gemini, Claude, OpenAI/GPT, OpenRouter, or Kimi with your own key. Provider usage may cost money. You can create ideas and edit case records without connecting AI. A daily request limit controls message attempts, not exact spending.

Your records live in your Google Sheet. Sending an AI message shares relevant saved case context with your selected service; OpenRouter routes it to a model host. Use tools and information your organization permits. The [full setup guide](apps-script/README.md) explains ownership, data sharing, costs, limits, and recovery.

## What makes a case useful

- A business or customer outcome and a specific decision to request.
- Evidence with sources, visible assumptions, and unknowns that remain unknown.
- People who use, review, approve, support, or are affected by the change.
- Checking, correction, setup and support included in the economics.
- Forecasts separated from actual results, and capacity separated from cash savings.
- A fair record of discovery, domain knowledge, coordination, delivery and adoption.

An improved proposal can be useful before implementation. It does not grant approval, establish savings, or guarantee recognition or job security.

## Maintainer and publication status

64 automated checks and documented local browser checks pass. Final live Google-account verification remains a maintainer task; no independently verified cross-provider deployment is claimed. Read [validation](docs/validation.md) for the evidence and limits. The [finish-and-publish handoff](docs/maintainer-handoff.md) identifies the remaining installed-Sheet pass, GitHub review/merge, and newsletter steps.

The newsletter itself is the public experiment. A separately recruited reader study is not a release prerequisite. The [article draft](docs/newsletter-draft.md) and [launch post draft](docs/launch-post-draft.md) are unpublished writing materials.

## Method, example, and source

The kit is one piece of a larger AI change-management question: how employee insight and company priorities become supported, governed work with measurable outcomes. See [the portfolio case study](docs/portfolio-case-study.md), [research context](docs/research.md), and the [fictional Northstar example](docs/northstar-example.md).

The assistant-neutral [method folder](skills/make-the-case/) and earlier [browser workspace](dist/) remain available as other ways to explore. The earlier browser demonstration does not call AI. The [design-only conversation preview](web-preview/README.md) records the approved direction; install the built Coach.html from apps-script/, rather than that prototype.

For maintainers, run `node --test tests/*.test.mjs`, `node scripts/check-package.mjs`, and `python scripts/package_sheets.py`. The package script updates the ZIP in downloads/ and outputs/ and its SHA256SUMS file. Provider, case, calculation, revision, request, key-redaction, and draft/board behaviors have simulated tests; see validation before making broader claims.

Created by Rachel Wilde / Tomboj. Original code and written materials in this module use the [MIT license](LICENSE), except third-party sources and brand identifiers. [Attribution](ATTRIBUTIONS.md) explains provenance. The repository’s pre-existing methodology has not been relicensed or replaced.
