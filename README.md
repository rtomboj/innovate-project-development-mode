# /innovate — Project Development Mode for LLM

A structured project development methodology for Claude, created by Rachel Wilde / Tomboj.

## Two starting points in this repository

| You want to… | Use | Start here |
| --- | --- | --- |
| Shape a project with Claude: understand its flow, assess feasibility, plan build stages, and validate each stage | **Innovate** — a reusable working methodology for you and Claude | [Read the Innovate skill](TombojInnovateSkill.md) |
| Turn an everyday work-improvement idea into an evidence-aware proposal, retain other ideas, and track decisions and contributions | **Make the Case** — a reader-owned Google Sheets conversation coach | [See Make the Case](make-the-case/README.md) · [Setup guide](make-the-case/START-HERE.md) |
| Review what this branch adds before trying or merging it | **Reviewer walkthrough** — scope, routes, screenshots, and verification limits | [Innovate vs Make the Case](make-the-case/docs/reviewer-guide.md) · [Screenshot gallery](make-the-case/docs/example-gallery.md) |

**Innovate guides how you develop a project. Make the Case helps you develop and communicate a workplace proposal.** They can complement each other, but the Google Sheets app does not require installing or running Innovate. Make the Case also includes its own optional portable skill; that is separate from the Innovate skill above.

## Innovate: what this is

`/innovate` is a reusable Claude working mode for project scoping, feasibility analysis, build planning, and strategic ideation. It is designed for people who are shaping ideas, building projects, or working through complex multi-stage decisions.

It is a structured project development methodology that guides how Claude works with a user when something is being scoped, planned, or built.

The process follows four phases:

```text
Flow & Scope → Feasibility → Build Stages → Validate & Adjust
```

Read [TombojInnovateSkill.md](TombojInnovateSkill.md) for onboarding, collaboration rules, the four phases, attribution, and its use terms. The methodology file is unchanged by the Make the Case addition.

## Make the Case: what the new module looks like

Collect ideas, develop one through dialogue, and prepare a bounded next request. The Sheet holds the user's records; Apps Script supplies the interface; AI messages use the reader's selected provider and their own API key. Someone can contribute the insight and case without being the person who builds the solution.

![Make the Case: conversation beside a compact case-progress panel, using fictional demonstration data](make-the-case/docs/images/coach-dialogue-v0.5.0.png)

*Actual built Coach.html running locally in demonstration mode. Fictional Northstar data, scripted replies, no AI calls, and no Google Sheet writes. This image is a product walkthrough, not evidence of a live deployment or business results.*

**[See the five-view walkthrough](make-the-case/docs/example-gallery.md)** · **[Download and set up your own copy](make-the-case/START-HERE.md)**

Make the Case is an early-release kit. Local automated and browser checks are documented; final installed-Google-Sheet/provider verification remains open. See [verification and limits](make-the-case/docs/validation.md). The module has its own [license and attribution](make-the-case/ATTRIBUTIONS.md); these do not change the original Innovate methodology's terms.
