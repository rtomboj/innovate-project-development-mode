# Innovate or Make the Case: choose a starting point

**Innovate guides how AI works through an idea with you. Make the Case organizes workplace insight into a proposal and a continuing record.**

Rachel created Innovate because an LLM would jump into solutions before she had finished thinking through an idea. She needed a collaborator that would help her flesh out the full context and flow, uncover missing pieces, and explore different approaches. Sometimes that showed a worthwhile path; sometimes it helped her stop before spending time on a dead end.

Innovate can support an assessment without becoming a project. Make the Case can support a proposal without the originator becoming the solution's builder. Both can begin with a rough idea, and neither is a required first step for the other.

## Choose the right route

| | Innovate | Make the Case — Google Sheets | Make the Case — portable skill |
| --- | --- | --- | --- |
| Main question | Can you help me work this idea through fully, compare approaches, and decide what comes next? | How do I bring a workplace improvement forward with evidence and a specific request? | How can an assistant guide me through that same case-development method? |
| Intended user | Someone who wants a thinking partner for an idea, business, service, process, personal tool, or possible project | An employee, team leader, or manager with one or many ideas; no builder role required | Someone who prefers working in a capable assistant using the supplied instructions |
| Form | Reusable instructions for a capable assistant or interactive agent, with onboarding and a working agreement | Google Sheet plus bound Apps Script HTML interface and the reader's own permitted AI key | Instructions and supporting measurement references |
| Flow | Flow & Scope → Feasibility & Decision; project/build stages only if chosen | Collect → Develop → Advance, with a separate record of decisions | Adaptable discovery, case development, pitch, and continuation records |
| Approaches | Explicit best, cost-effective, and innovative angles for substantive choices | Relevant alternatives, including ordinary automation or process change; the current app does not require those three fixed lenses | Relevant alternatives; the current method does not require those three fixed lenses |
| Output | An explored idea, flow, options, gaps, and a reasoned decision; optional project plan | Saved ideas, case notes, evidence and scenario costs, pitch, decisions, and contribution/results record | Portable case and continuation records saved in files or tables |
| Entry point | [Innovate skill](../../TombojInnovateSkill.md) | [Reader setup](../START-HERE.md) | [Make the Case skill](../skills/make-the-case/SKILL.md) |

The difference is the purpose of the work, not which person has a more developed idea. Innovate emphasizes the thinking partnership and full exploration. Make the Case adds a specific organizational structure: business/customer outcomes, evidence and economics, affected people, permissions, decision requests, shared contribution, and follow-through.

## When to use each

- **I have an idea and the AI keeps rushing into answers:** use Innovate.
- **I need to understand the whole flow and discover what I have missed:** use Innovate.
- **I need to compare approaches and decide whether this deserves more time:** use Innovate.
- **I need to bring a workplace improvement to a manager, sponsor, or reviewer:** use Make the Case.
- **I need a baseline, costs, collaborators, permissions, and a bounded request:** use Make the Case.
- **I want to retain several ideas and track decisions, contributions, and later results:** use Make the Case.

You can draw on Innovate's three angles while developing a case, or carry an Innovate assessment into Make the Case. If a supported idea becomes a project, Innovate can continue into build planning and validation. Those are possible handoffs, not a required sequence.

A recommendation to proceed, a completed pitch, and a board outcome are not substitutes for actual organizational approval or permission to execute.

## A concrete example

Dana notices that refunds over $50 can wait two days for a sign-off that is usually yes. This is a fictional illustration, not verified company data.

With **Innovate**, she can talk through the whole situation before accepting a proposed solution: what triggers the wait, who is involved, which exceptions matter, what context is missing, and how the best, cost-effective, and innovative approaches compare. She may decide to stop, change the idea, or investigate further. A build is not the default result.

With **Make the Case**, she can turn that insight into a request someone can evaluate: measure one queue with a Finance reviewer, establish the baseline, explain relevant people and permissions, and bring back a recommendation. The case retains the evidence, uncertainty, decisions, and her contribution even if someone else would build a solution.

## Using Innovate with assistants and agents

Read and supply the complete Innovate file using the host's supported instruction mechanism. A named skill, uploaded file, and accessible repository link are different loading routes. Typing a slash command alone does not install the method everywhere.

An interactive assistant can guide the conversation. An agent can use authorized tools to gather evidence, compare options, and prepare a brief, returning meaningful choices to the user. The guide does not itself provide tool access, persistent memory, or permission to act. Rachel's continued use in Claude is the stated origin; support for supplied instructions is not proof of identical behavior across all platforms.

The Sheets app does not call or require the Innovate file. Make the Case's portable skill is also independent of the Sheets interface.

## Review the experience before the code

Open the [five-view screenshot walkthrough](example-gallery.md). It follows one fictional opportunity through conversation, suggestion review, idea tracking, numbers, and a pitch. Each image says what the user does and what the view demonstrates.

| Review question | Where to look |
| --- | --- |
| Can a newsletter reader tell what it is and start? | [Module overview](../README.md) and [Start here](../START-HERE.md) |
| Does the dialogue make the next action clear? | [Conversation and review images](example-gallery.md#1-develop-one-idea-through-dialogue) |
| Can they retain other ideas and see decisions? | [Kanban image](example-gallery.md#3-keep-other-ideas-and-decisions-visible) |
| Are forecasts, unknowns, and permissions represented honestly? | [Numbers and pitch images](example-gallery.md#4-inspect-the-numbers-before-claiming-value), [measurement method](../skills/make-the-case/references/records-and-measurement.md) |
| What runs in their Sheet and how do they update it? | [Apps Script guide](../apps-script/README.md) and [update walkthrough](../apps-script/UPDATE-AND-TEST.md) |
| What has actually been checked, and what remains? | [Validation](validation.md), [release status](../STATUS.md), and [maintainer handoff](maintainer-handoff.md) |

## Scope and source map

- The root README explains Innovate's origin, the assessment and optional build path, assistant/agent use, and when to choose each method. `TombojInnovateSkill.md` v1.2 carries that guidance into the instructions under the MIT License, retaining Rachel Wilde / Tomboj attribution.
- `make-the-case/apps-script/` contains the installable Google Sheets application. `scripts/coach-dialogue-ui.*` and `scripts/build_coach_ui.py` generate its current dialogue layout while retaining the working gateway.
- `make-the-case/skills/make-the-case/` contains the separate portable method; installing it is optional for app users.
- `make-the-case/web-preview/` is a design-only prototype. `dist/` is the earlier browser workspace. Neither replaces the installable Apps Script kit.
- `make-the-case/downloads/` contains the reader ZIP and checksum. `docs/` holds the example, research, validation, reviewer guides, and unpublished newsletter drafts.

## What the screenshots and checks establish

The images capture the actual built v0.5.0 Coach file locally, in its labeled fictional demonstration mode. They show available interface states. They do not establish real AI response quality, Google permissions, provider billing, business savings, or adoption.

The application's [validation record](validation.md) documents 64 local automated checks and local browser checks, with live installed-Sheet/provider verification still open. Those application checks do not test every assistant's adherence to Innovate v1.2. The revised instructions explain intended behavior; completed cross-platform coaching validation is not claimed.

The screenshot-led presentation follows the approach of [Tomboj VOC Signal-to-Change](https://github.com/rtomboj/tomboj-voc-signal-to-change): clear starting routes, synthetic examples, captions explaining the workflow, and explicit separation of previews from live results.
