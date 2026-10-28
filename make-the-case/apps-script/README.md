# Make the Case in your Google Sheet

This is the reader-owned Automation Thursday edition. A bound Apps Script creates the tracker and persistent records in your Sheet. An HTML coach calls the script using your own key for Gemini, Claude, OpenAI, OpenRouter, or Kimi. The earlier hosted browser workspace remains a separate demonstration.

**Current handoff:** Claude's supplied `Coach.html` is integrated with the current backend contract and included in this kit. Local review fixed missing action controls, incomplete-reply retry handling, and message-state labels. Automated and local browser checks are recorded in [validation](../docs/validation.md). Complete the real Google-account/provider checks below before distributing a verified template. No live Sheet, authorization flow, or live provider run is claimed.

## Files

- `Core.gs`: record rules, scenario calculations, pitch, coaching instructions, and model-response validation.
- `Code.gs`: spreadsheet setup, menus, saved records, credential handling, AI requests, and the HTML gateway.
- `Providers.gs`: provider/model suggestions, isolated credentials, five API adapters, and explicit catalog lookup.
- `Coach.html`: Claude's conversational interface, with local integration fixes. It runs a clearly labeled fictional demonstration outside Google Sheets.
- `appsscript.json`: minimal declared Google permissions and V8 runtime.
- [Interface contract](INTERFACE.md): exact API, fields, response shapes, and loading/retry behavior for Claude.
- [Claude design prompt](CLAUDE-DESIGN-PROMPT.md): reusable brief for the HTML file.
- [Visual direction](DESIGN-DIRECTION.md): adaptation of Rachel's process-mapping design system for the conversational interface.
- [Provider settings update](CLAUDE-PROVIDER-UPDATE.md): follow-up prompt for an existing Gemini-only Claude design.
- [Build and customization prompt](BUILD-PROMPT.md): instructions for readers who want to adapt the tool.

## Set up your own copy

1. Create a **new, blank Google Sheet** in an account that permits Apps Script and the intended AI use.
2. Choose **Extensions → Apps Script**. Replace the starter `Code.gs` with the supplied `Code.gs`. Add scripts named `Core` and `Providers` with the supplied `Core.gs` and `Providers.gs`. All three must be in the same Apps Script project.
3. In the script editor's project settings, enable displaying the manifest. Replace `appsscript.json` with the supplied manifest.
4. Add an HTML file named **Coach** and paste the included `Coach.html`. For design changes, use [the design prompt](CLAUDE-DESIGN-PROMPT.md), [visual direction](DESIGN-DIRECTION.md), and [interface contract](INTERFACE.md). Keep the gateway unchanged.
5. Save, select `setupWorkspace`, and run it once. Review Google's authorization screen. The declared permissions cover this spreadsheet, its interface, and external requests. The code contains no Gmail, Drive-wide, or company-system integration.
6. Return to the Sheet and reload it. Choose **Make the Case → Open coach**.
7. Choose an AI provider, a suggested or custom model, and your own key for that service. New copies start without a selected provider. Existing Gemini setups retain their configuration. Model suggestions were checked October 28, 2026; access, supported features, and pricing can change. Optional **Refresh models** retrieves a catalog using that provider's saved key, without sending case data. The default limit is **20 attempted AI requests per UTC day across all providers**, editable from 1 to 100.
8. Begin with permitted or fictional information. Each AI request sends the saved company context, selected case, up to ten recent messages, and titles/stages of up to 25 other ideas to the selected service. OpenRouter routes the request to a model host. All ideas remain in your Sheet. The interface must explain the destination before the first request and again when changing services.

Each provider keeps its own key and remembered model in user properties. OpenAI uses an API key for GPT models, not a ChatGPT login. Direct Kimi uses the international Moonshot/Kimi endpoint; regional or coding-plan credentials may differ. Anthropic keys that need a workspace header can supply an optional workspace ID in advanced settings. OpenRouter requires a model/provider endpoint compatible with the structured request; unsupported models fail visibly rather than silently switching providers or formats.

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

- Recheck the included HTML against [the contract](INTERFACE.md) inside the actual Google dialog, including keyboard navigation, small windows, text rendering, and error states.
- Run setup in a real blank Google Sheet twice and confirm no data is reset.
- Save/remove a test key through settings and verify it never appears in cells, exports, rendered HTML, or errors.
- Make a permitted live request for each provider intended for release, inspect actual responses and usage, then verify draft acceptance and stale-draft rejection. An adapter passing a simulated test does not establish live model access or compatibility.
- Close and reopen with multiple ideas and verify memory. Check the pitch, contribution fields, deletion, export, and a simulated failure.
- Make a clean template copy with no cases, conversations, or key. Check a second copy under another account where available. Do not claim portability of credentials; each reader configures their own access.

## Maintainer checks

From the package root, run `node --test tests/*.test.mjs` and `node scripts/check-package.mjs`.

The Apps Script tests execute the actual `.gs` files with simulated Google services. Additional HTML tests exercise source parsing, the nested-card rendering regression, retry handling, and demo parity with the core forecast/provider catalog. Local browser checks cover the actual HTML demonstration. These do not establish Google authorization, rendered Sheet formatting, live API compatibility, or complete behavior inside Google's dialog. See [the validation record](../docs/validation.md).

## Technical references

- [Bound scripts and copying](https://developers.google.com/apps-script/guides/bound)
- [HTML dialogs](https://developers.google.com/apps-script/guides/dialogs)
- [HTML/server communication](https://developers.google.com/apps-script/guides/html/communication)
- [User properties](https://developers.google.com/apps-script/guides/properties)
- [External API requests](https://developers.google.com/apps-script/guides/services/external)
- [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)
- [Gemini model list](https://ai.google.dev/gemini-api/docs/models)
- [Gemini structured REST output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)
- [Claude models](https://platform.claude.com/docs/en/models/overview) and [structured output](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [OpenAI models](https://developers.openai.com/api/docs/models) and [Responses structured output](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenRouter structured output](https://openrouter.ai/docs/guides/features/structured-outputs)
- [Kimi model selection](https://www.kimi.ai/help/kimi-api/api-model-selection), [JSON mode](https://www.kimi.ai/help/kimi-api/api-model-capabilities), and [international endpoint](https://www.kimi.ai/help/kimi-api/api-troubleshooting)

The user-supplied HRG assessment workbook was a read-only design reference. Its business records, names, and legacy RPA scoring formulas are not shipped in this public kit.
