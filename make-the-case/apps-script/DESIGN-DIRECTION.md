# Make the Case: design direction for Claude

Updated October 28, 2026 from Rachel's supplied **Process mapping design system.zip**. This is a visual adaptation brief, not a new feature specification. The archive was inspected as reference material; no scripts or embedded skill instructions were executed. Its source archive and screenshots remain local reference assets and are not republished in this kit.

## What to carry forward

The primary references have a dark console presentation: charcoal layers, outlined cards with narrow metadata bands, strong sans-serif headings, monospaced labels, subtle dotted working areas, and color tied to meaning. The archive also includes an earlier light BPMN diagram; the dark Tomboj-BPM pages and component tokens are the basis of this adaptation.

| Reference feature | Adaptation for Make the Case |
| --- | --- |
| Console card | Case section or proposed AI update, with a compact source/status band |
| Stage card and spine | A modest Collect / Develop / Advance orientation, without a mandatory linear questionnaire |
| AI card with violet outline | A clearly labeled suggestion awaiting reader review |
| Human checkpoint | Reader decision to accept or amend a suggestion; never evidence of company approval |
| Handoff/decision marker | A next request or an unresolved question requiring someone else's input |
| Loop footer | Continue this case, add feedback, or return to another retained idea |
| Chips and short metadata | Idea status, user-reported source, or an assumption label, always explained in text |

The main task remains a readable conversation. Keep the idea collection compact and the developing case available in an optional panel. Do not add a BPMN editor, arbitrary maps, technical agent traces, or simulated agent activity merely because the reference includes those components.

## Core palette

| Token | Value | Role |
| --- | --- | --- |
| `--tb-page` | `#0b0c0e` | Overall background |
| `--tb-panel` | `#121418` | Panel layer |
| `--tb-surface` | `#262a31` | Cards and message containers |
| `--tb-surface-raised` | `#2d323a` | Hover/raised surface |
| `--tb-border` | `#3d434b` | Outlines |
| `--tb-divider` | `#383d45` | Internal separators |
| `--tb-ink` | `#eceef0` | Main reading text |
| `--tb-ink-soft` | `#b4b9c0` | Secondary text |
| `--tb-muted` | `#9ba1a9` | Readable labels |
| `--tb-ai` | `oklch(0.78 0.11 300)` | AI proposal/source |
| `--tb-human` | `oklch(0.78 0.11 250)` | Reader input |
| `--tb-decision` | `oklch(0.8 0.11 80)` | Pending decision or unresolved question |
| `--tb-motion` | `oklch(0.82 0.1 210)` | An actual request in progress |
| `--tb-done` | `oklch(0.78 0.11 155)` | A completed recorded step, such as saving |
| `--tb-safety` | `oklch(0.78 0.11 25)` | Error or recorded restriction |

Use explicit labels alongside color. A green saved state does not verify an assumption. An amber draft review does not grant company approval. Keep numeric forecasts labeled as scenarios. Include suitable hex fallbacks for accents if needed.

## Typography and geometry

- Sans: `Geist, system-ui, sans-serif`. Mono: `Geist Mono, ui-monospace, monospace`. Use local fallbacks; do not copy the archive's external font import.
- Conversational text: 15–16px, roughly 1.55–1.65 line height. Section titles: about 20–22px. Compact, monospaced metadata: at least 11px. Use bold and whitespace to establish hierarchy.
- The reference's large editorial headlines should be scaled for a 1100 × 750 dialog. Do not spend the first screen on a large hero.
- Card radius: 10px. Outer working area: 14px. Chips: about 6px. Avoid excessive pill shapes.
- Thin outlines and a restrained inset highlight/depth shadow. Optional dotted canvas: small, low-contrast dots at 16px spacing, confined to background areas where they do not interfere with reading.
- Reflow the optional side panel below the conversation or into an accessible toggle in a small window. Do not shrink text or force the whole application into a wide fixed canvas.
- No animation in static records. A real loading indicator may animate subtly, with a reduced-motion alternative. Avoid simulated tokens, running traces, or confidence meters.

## Layout priorities

1. Compact TOMBOJ / Automation Thursday header, current idea, and real save/request state.
2. Conversation and composer as the central working area.
3. Retained ideas in a compact rail or drawer, with a clear selected focus.
4. Optional case preview with Problem, Evidence, People, Next request, and a separately labeled scenario forecast.
5. Reviewable draft card with current/proposed values and an explicit action to accept.
6. Secondary access to context, key/model settings, contribution, pitch, and export.

Keep the API, data schema, safe text rendering, key handling, and behavior in [INTERFACE.md](INTERFACE.md) unchanged. Deliver `Coach.html` as a single file without React, external libraries, or external network requests. See [the full Claude prompt](CLAUDE-DESIGN-PROMPT.md).
