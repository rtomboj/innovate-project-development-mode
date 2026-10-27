# Validation record

October 27, 2026. Sheets backend kit 0.2.0 and browser demonstration 0.1.

## Sheets backend checks

The actual `Core.gs` and `Code.gs` files run in a Node sandbox with simulated Google Sheets, Properties, Lock, UUID, and URL Fetch services. All 23 Apps Script tests pass, in addition to the original 16 browser-model tests (39 total).

The new tests cover repeatable setup, conflicting headers, unknown versus zero inputs, changing review/support burden, complete financial cost arithmetic, invalid metric/field rejection, Testing permission references, stale writes, persistence of 17 ideas and context across a fresh script runtime, credential exclusion from bootstrap/export/URLs, draft review and acceptance, protected model fields, malformed model data, request deduplication, failed/truncated/network responses, daily attempt limits and reported tokens, relevant prompt context, draft invalidation, literal spreadsheet text, case/history deletion, history capacity, oversized audit data, file load order, busy workspaces, and model-path validation.

The outgoing request uses the current documented Gemini REST structured-response format and a model ID checked against Google's official list. This is a source/code check, not a successful API call. No real key or company data was used. The spreadsheet and provider behavior in these tests are simulations.

Claude is designing `Coach.html` separately at Rachel's request. The UI is not supplied in this backend handoff. A real Google Sheet, authorization flow, actual Gemini request, saved key handling under Google execution identities, native formatting, and integrated HTML behavior remain to be checked. Reader setup instructions retain those checks before newsletter release. No external user recruitment is required.

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
