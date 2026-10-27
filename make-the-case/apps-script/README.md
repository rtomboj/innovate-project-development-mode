# Make the Case in your Google Sheet

This is the reader-owned Automation Thursday edition. A bound Apps Script creates the tracker and persistent records in your Sheet. An HTML coach calls the script, which uses your own Gemini API key. The earlier hosted browser workspace remains a separate demonstration.

**Current handoff:** the backend, setup, interface contract, and tests are included. The final `Coach.html` is being designed separately in Claude at Rachel's request. This folder deliberately contains no substitute design. Add that file and complete the Google-account checks below before distributing a working template. No live Sheet, live model run, or finished HTML integration is claimed.

## Files

- `Core.gs`: record rules, scenario calculations, pitch, coaching instructions, and model-response validation.
- `Code.gs`: spreadsheet setup, menus, saved records, credential handling, AI requests, and the HTML gateway.
- `appsscript.json`: minimal declared Google permissions and V8 runtime.
- [Interface contract](INTERFACE.md): exact API, fields, response shapes, and loading/retry behavior for Claude.
- [Claude design prompt](CLAUDE-DESIGN-PROMPT.md): reusable brief for the HTML file.
- [Build and customization prompt](BUILD-PROMPT.md): instructions for readers who want to adapt the tool.

## Set up your own copy

1. Create a **new, blank Google Sheet** in an account that permits Apps Script and the intended AI use.
2. Choose **Extensions → Apps Script**. Replace the starter `Code.gs` with the supplied `Code.gs`, and add a script named `Core` with the supplied `Core.gs` contents. Files must be in the same Apps Script project.
3. In the script editor's project settings, enable displaying the manifest. Replace `appsscript.json` with the supplied manifest.
4. Add an HTML file named **Coach** and paste Claude's finished `Coach.html`. Supply Claude with [the design prompt](CLAUDE-DESIGN-PROMPT.md) and [the interface contract](INTERFACE.md). Keep the gateway unchanged.
5. Save, select `setupWorkspace`, and run it once. Review Google's authorization screen. The declared permissions cover this spreadsheet, its interface, and external requests. The code contains no Gmail, Drive-wide, or company-system integration.
6. Return to the Sheet and reload it. Choose **Make the Case → Open coach**.
7. In the coach settings, enter your own Gemini API key and a model available to your account. The initial model suggestion is `gemini-3.8-flash`, from Google's model list checked October 27, 2026. Model access and pricing can change. The default limit is **20 attempted AI requests per UTC day**, editable from 1 to 100.
8. Begin with permitted or fictional information. Each AI request sends the saved company context, the selected case, up to ten recent messages, and titles/stages of up to 25 other ideas to Google's Gemini service. All ideas remain in your Sheet. The interface must explain this before the first request.

No public web-app deployment, Cloud Run server, or Tomboj-hosted account is required for this bound-dialog edition. You need a Google account that allows it and your own permitted AI access. An organization administrator can restrict scripts, authorization, or external services.

## What the five tabs do

| Tab | Purpose |
| --- | --- |
| Ideas | A derived opportunity tracker with status, next request, and forecast. |
| Cases | The authoritative case records, with stable IDs, revisions, text fields, and numeric assumptions. |
| Evidence & costs | A derived review view of sources, uncertainties, calculation inputs, forecasts, and reported results. |
| History | Saved messages, suggested drafts, explicit reader edits, and decisions to accept drafts. |
| Context | Editable company/team background, goals, constraints, and preferences. |

Use the coach for edits so changes have a revision and history. The two derived views are rebuilt from Cases and should not be edited. If Cases is edited directly, use **Refresh tracker** afterward; direct edits do not create contribution or decision evidence. Setup preserves unrelated tabs and refuses conflicting headers. Pilot limits are 200 ideas, 5,000 history entries, 2,400 characters per case/context field, and 4,000 per message.

## Memory and control

Memory is the saved context, case records, and conversation history. Closing and reopening the tool retrieves them. The selected case stays selected. Useful model summaries become a proposed draft; the reader reviews them before they become case inputs. Old messages are retained in History, while recent messages and accepted case fields supply subsequent AI context. This does not train or change the base model.

The reader can edit context, amend a case, delete a case with its messages/drafts, remove the API key, and download a JSON export. The export is a portable record, not a one-click restore format in this version. Use Google Sheets copies/version history for account-level backup. Deleting a case from this tool does not erase Google's version history or provider records.

The Sheet is a personal workspace. Anyone you give spreadsheet access may see its records; editors also control its bound code. User properties scope the key to the current user/project, but they are not a security boundary against untrusted script editors. Keep the copy and script private or share only with trusted editors. The key is never written into cells, returned by the gateway, added to a request URL, or included in an export. No key or project-specific credential is included in this kit.

## Costs, requests, and failures

The script uses one model request per submitted message. It does not run background agents, automatic retries, or model calls when the Sheet opens or recalculates. Attempt counts are reserved before calling the provider. Failures count because they can still consume resources. Provider-reported prompt/output/total token counts are recorded when available; reasoning tokens can make total tokens exceed prompt plus output. Token counts are not a currency invoice. A daily request limit limits calls, not the exact amount billed; use the provider's controls as well.

Each message has a unique request ID. Repeating a successful ID retrieves the saved result. A failed/interrupted ID cannot silently call the model again. If the browser loses a response, retry with the same ID. After a confirmed failure, make an intentional new attempt with a new ID. The UI must explain that distinction. Updates use revisions to reject stale writes from another window.

Apps Script and the model provider impose quotas. The bound script holds a document lock while processing a request to avoid overlapping writes. A busy window receives an error it can retry later. Sheets writes are not a database transaction: if a Google service fails partway through an operation, reopen the Sheet and inspect the saved case/history before retrying. Derived views can be rebuilt with Refresh tracker.

## Before newsletter release

These are maintainer checks, not a recruited reader study:

- Add Claude's HTML, verify its actions match [the contract](INTERFACE.md), and check keyboard/navigation, small windows, text rendering, and error states.
- Run setup in a real blank Google Sheet twice and confirm no data is reset.
- Save/remove a test key through settings and verify it never appears in cells, exports, rendered HTML, or errors.
- Make one permitted live request, inspect the actual Gemini response and usage, then verify draft acceptance and stale-draft rejection.
- Close and reopen with multiple ideas and verify memory. Check the pitch, contribution fields, deletion, export, and a simulated failure.
- Make a clean template copy with no cases, conversations, or key. Check a second copy under another account where available. Do not claim portability of credentials; each reader configures their own access.

## Maintainer checks

From the package root, run `node --test tests/*.test.mjs` and `node scripts/check-package.mjs`.

The Apps Script tests execute the actual `.gs` files with simulated Google services. They verify record behavior and the outgoing request structure; they do not establish Google authorization, rendered Sheet formatting, live API compatibility, or Claude's interface behavior. See [the validation record](../docs/validation.md).

## Technical references

- [Bound scripts and copying](https://developers.google.com/apps-script/guides/bound)
- [HTML dialogs](https://developers.google.com/apps-script/guides/dialogs)
- [HTML/server communication](https://developers.google.com/apps-script/guides/html/communication)
- [User properties](https://developers.google.com/apps-script/guides/properties)
- [External API requests](https://developers.google.com/apps-script/guides/services/external)
- [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)
- [Gemini model list](https://ai.google.dev/gemini-api/docs/models)
- [Gemini structured REST output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)

The user-supplied HRG assessment workbook was a read-only design reference. Its business records, names, and legacy RPA scoring formulas are not shipped in this public kit.
