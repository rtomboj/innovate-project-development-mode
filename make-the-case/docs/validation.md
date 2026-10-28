# Validation record

## Sheets kit 0.5.0 — approved dialogue integration

64 automated checks pass. New backend tests reject empty/unchanged model-template proposals without clearing known case values; retain genuine zero inputs; record and reopen Kanban outcomes; retain pending drafts across board revision changes; reject missing approval references and stale board writes; and ensure a board outcome cannot grant Testing or tool/data permissions. Existing provider, key redaction, retry, economics, export, and record tests remain passing.

The actual built Coach.html was opened locally, separately from the design-only prototype. Browser checks confirmed the stable app header, top New idea action and its dialog, creation of another idea without replacing the existing set, one-at-a-time note review progressing from three pending notes to two, and the processing state replacing the reply box. The exact .gs files execute in simulated tests; local browser demonstration responses are scripted. The final Google Sheet installation, real model response, OAuth identity behavior, and iframe downloads still require the installed-account walkthrough.


## Sheets kit 0.4.0 walkthrough fixes — October 28, 2026

62 Node checks pass. New coverage executes the real Apps Script code with simulated Google services/provider responses: partial review validates chosen draft keys, preserves pending proposals across a fresh runtime, safely skips suggestions without altering saved values, rejects protected or stale changes, and includes reader edits in the pitch. A full customer-update scenario runs two conversations, accepts and edits suggestions, reopens, calculates 9.4 forecast hours/month with explicitly fictional inputs, produces a pitch with missing results/permissions visible, and exports records without the key. Additional checks exercise unsaved-edit cancellation, rule-based resume guidance, idempotent Start Here/button creation, and preservation of nonempty Sheet1/unrelated Start Here content.

In the actual local HTML demonstration, editing and saving one suggestion left the other two available. Case editing exposed Save changes / Cancel and Close editor. The case panel's observed client height was 489 CSS pixels with 2,054 pixels of content; scrolling moved its scrollTop to approximately 1,565, reaching the lower sections. A saved quality requirement appeared in the pitch. The inline send-review view replaced the conversation/composer instead of adding a nested popup and exposed expandable context plus Back to edit. A requested viewport override again produced an observed 1,222 × 722 CSS-pixel viewport, so exact requested-size Google-dialog coverage is not claimed.

Rachel's supplied screenshots from the earlier installation show an AI reply, saved status, and reopening from the Sheet. The maintainer has not independently inspected that live provider call or the Sheet records. The 0.4.0 code still needs installing in the existing bound project and the [live end-to-end walkthrough](../apps-script/UPDATE-AND-TEST.md), including the native Start Here image button and downloads inside Google's iframe. Tests are not a substitute for that installation check.

October 28, 2026. Sheets kit 0.3.1 and earlier browser demonstration 0.1.

## Sheets backend checks

The actual `Core.gs`, `Providers.gs`, and `Code.gs` files run in a Node sandbox with simulated Google Sheets, Properties, Lock, UUID, and URL Fetch services. All 34 Apps Script tests pass, plus seven Coach HTML tests and 16 earlier browser-model tests (57 total).

The new tests cover repeatable setup, conflicting headers, unknown versus zero inputs, changing review/support burden, complete financial cost arithmetic, invalid metric/field rejection, Testing permission references, stale writes, persistence of 17 ideas and context across a fresh script runtime, credential exclusion from bootstrap/export/URLs, draft review and acceptance, protected model fields, malformed model data, request deduplication, failed/truncated/network responses, daily attempt limits and reported tokens, relevant prompt context, draft invalidation, literal spreadsheet text, case/history deletion, history capacity, oversized audit data, file load order, busy workspaces, and model-path validation.

The provider tests exercise all five outgoing request formats and normalize representative replies into the same reviewed draft. They also check a neutral initial provider state, isolated keys and remembered models, legacy Gemini access, refusal/truncation handling, a daily limit across provider switches, inactive-key redaction, metadata-only catalog lookup, and manual model-ID validation. Sources for request formats and suggested IDs are listed in the Apps Script guide. These are code/simulated-response checks, not successful live calls. No real key or company data was used.

Rachel supplied Claude's actual Coach.html in the implementation-notes ZIP. It is integrated in apps-script/. Local review found a nested-child rendering defect that hid action controls; the DOM helper was corrected and regression-tested. Other tests verify incomplete-reply retry state, retained text after a server failure, same-ID retrieval at a daily cap, preventing uncertain retries switching services/models, a dependency-free script, demo/provider catalog parity, and forecast parity with Core.gs. Failed and unanswered history messages now have explicit metadata and UI labels.

Local browser checks verified draft acceptance, all five provider/model choices, disabled key/catalog controls in demonstration mode, case-panel display, numeric editing that changes 4.4 to -5.2 forecast hours/month, and scripted chat. This is a standalone demonstration with no real API calls. A real Google Sheet, authorization flow, provider requests, saved-key handling under Google execution identities, native formatting, downloads inside Google's dialog, and real model-catalog refresh remain to be checked. No external user recruitment is required.

Additional browser checks confirmed that creating another idea preserves the existing collection, the next case opens with the conversational introduction, and recording Testing without permission references is blocked. The narrow header was corrected after an observed overflow. At a measured 380 CSS-pixel viewport, document width is also 380; the title, save state, More menu, and case toggle remain visible. A wider observed viewport measured 1222 pixels without horizontal document overflow. The available viewport override did not map exactly to its requested dimensions, so precise 1100 × 750 Google-dialog coverage is not claimed. No browser console errors were captured during these checks.

The .gs code is a bound-dialog application, not a public web app or an enterprise multi-tenant service. It retrieves recent messages and accepted structured records as memory. It does not train a model. Export is a record download, not an import/restore feature. Sheets writes are not transactional; failure recovery requires checking saved records and refreshing derived views.

## Browser demonstration: automated checks completed

The Node test suite contains 16 passing tests covering capacity arithmetic, review/support burden, missing versus zero inputs, zero uptake, scenario financial cost boundaries, zero-cost ROI, recorded restrictions, permission evidence, preservation and restoration of 17 ideas and history, invalid imports, required testing references, unknown-field removal, fictional provenance, AI-briefing context, and discovery for a blank case.

These checks establish the tested calculation and record behaviors. They do not establish that a proposed improvement is safe, authorized, effective, or financially realized.

## Browser verification

The local workspace was opened in the in-app browser. Completed interaction checks:

- Changing check/correct time from 8 to 20 minutes changed the fictional forecast from 4.4 to negative 5.2 hours/month and the next decision to revisiting the approach.
- Added 14 ideas to the three-idea example; all 17 remained and the selected focus stayed unchanged.
- Downloaded that workspace, started a blank one, and reopened the saved file. All 17 ideas and the selected idea were restored.
- Attempting to record Testing without a permission reviewer/reference was blocked with an explanation.
- Prepared an AI briefing containing current context, selected-case data, and the retained ideas.
- The desktop workspace had no document-width overflow at the observed 1351-pixel content viewport. A desktop screenshot is included. Responsive CSS is present; a mobile-size override did not take effect reliably in the available browser, so mobile-specific verification is not claimed.
- No browser console errors were observed during the checked flow.

## Skill verification

The skill is designed to work from a frustration, one idea, many ideas, or an existing proposal. It preserves assumptions, evidence, decision rights, collaboration, and contribution records. The package check validates its simple frontmatter, naming, references, and unfinished-scaffold markers. The bundled skill-validator attempt could not run because its Python YAML dependency was unavailable. Structural validation is separate from behavioral verification. No independent cross-provider run or live reader study is claimed.

## Scope and limits

- The browser uses explicit rules and calculations, not live AI inference.
- Records stay in browser storage until the user exports or copies them. Browser storage is not a backup or an enterprise access-control system.
- Northstar and every associated record are fictional.
- Approval and result references are user-reported, not independently verified by the app.
- The financial scenario is simplified and requires appropriate cost/benefit validation.
- Desk research informed the public pilot; it does not establish market demand or career outcomes.
- Automation Thursday itself is the public test. No external reader recruitment is required before release.
