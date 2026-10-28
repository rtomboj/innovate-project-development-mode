# Reviewing this branch: Innovate and Make the Case

**Innovate is a project-development skill for Claude. Make the Case is a workplace-idea coaching workflow and Google Sheets kit.** The app was added in [PR #1](https://github.com/rtomboj/innovate-project-development-mode/pull/1), which is now merged. This follow-up adds reviewer navigation and screenshots; it changes neither the app code nor the original Innovate skill. Readers do not need to use Innovate to run the Sheet.

## Choose the right route

| | Innovate | Make the Case — Google Sheets | Make the Case — portable skill |
| --- | --- | --- | --- |
| Main question | How should we scope, assess, build, and validate this project together? | How do I turn what I know about work into a proposal someone can evaluate? | How can an assistant guide me through that same case-development method? |
| Intended user | Someone developing a project with Claude | An employee, team leader, or manager with one or many ideas; no builder role required | Someone who prefers working in a capable assistant using the supplied instructions |
| Form | Claude working methodology, including onboarding and collaboration rules | Google Sheet plus bound Apps Script HTML interface and the reader's own permitted AI key | Instructions and supporting measurement references |
| Stages | Flow & Scope → Feasibility → Build Stages → Validate & Adjust | Collect → Develop → Advance, with a separate record of decisions | Adaptable discovery, case development, pitch, and continuation records |
| Output | Project flow, feasibility assessment, staged build and validation decisions | Saved ideas, case notes, evidence and scenario costs, pitch, decisions, and contribution/results record | Portable case and continuation records saved in files or tables |
| Entry point | [Original Innovate skill](https://github.com/rtomboj/innovate-project-development-mode/blob/main/TombojInnovateSkill.md) | [Reader setup](../START-HERE.md) | [Make the Case skill](../skills/make-the-case/SKILL.md) |

The methods overlap in careful scoping and validation. Their purpose, interface, and output differ. Innovate could guide a separate implementation project after a case earns support; it is not called by the Sheets app, and the app does not automatically start an implementation project. This comparison describes intended use, not proof that a particular development session followed every Innovate instruction.

## A concrete example

An employee notices weekly client updates take too long and miss commitments. **Make the Case** helps them describe the work, retain baseline evidence, identify affected people and permissions, estimate a scenario including checking costs, and ask for a limited next step. They can pitch that work without personally building an AI integration.

If a team then decides to develop a solution, **Innovate** can guide a Claude session to map the full flow, examine feasibility, sequence the build, and validate stages. The proposal still needs real organizational decisions; a generated pitch or board label does not authorize implementation.

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

- The root README now provides a choice of routes and a product preview. The original `TombojInnovateSkill.md` is unchanged.
- `make-the-case/apps-script/` contains the installable Google Sheets application. `scripts/coach-dialogue-ui.*` and `scripts/build_coach_ui.py` generate its current dialogue layout while retaining the working gateway.
- `make-the-case/skills/make-the-case/` contains the separate portable method; installing it is optional for app users.
- `make-the-case/web-preview/` is a design-only prototype. `dist/` is the earlier browser workspace. Neither replaces the installable Apps Script kit.
- `make-the-case/downloads/` contains the reader ZIP and checksum. `docs/` holds the example, research, validation, reviewer guides, and unpublished newsletter drafts.

## What the screenshots and checks establish

The images capture the actual built v0.5.0 Coach file locally, in its labeled fictional demonstration mode. They show available interface states. They do not establish real AI response quality, Google permissions, provider billing, business savings, or adoption.

64 local automated checks and documented local browser checks were completed before this documentation update. No GitHub CI checks were reported at the inspected head. The final installed-Sheet/provider walkthrough remains open; review the verification limits before publishing. This branch is prepared for review, and merging remains Rachel's decision.

The screenshot-led presentation follows the approach of [Tomboj VOC Signal-to-Change](https://github.com/rtomboj/tomboj-voc-signal-to-change): clear starting routes, synthetic examples, captions explaining the workflow, and explicit separation of previews from live results.
