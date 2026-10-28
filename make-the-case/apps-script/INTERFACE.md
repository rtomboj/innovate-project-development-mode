# Coach.html integration contract

Version 0.3.0. All application calls go through `api({action, payload})`. The `.gs` files are authoritative. Claude owns the HTML design; this contract fixes the connection points. Provider selection is now explicit: Gemini, Claude, OpenAI, OpenRouter, or Kimi. See [the settings update prompt](CLAUDE-PROVIDER-UPDATE.md).

```js
function call(action, payload = {}) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(result => result.ok ? resolve(result.data) : reject(new Error(result.error)))
      .withFailureHandler(() => reject(new Error('Google could not complete the request. Reopen the workspace before retrying.')))
      .api({ action, payload });
  });
}
```

All return values are JSON-safe. Do not call private helpers. Do not make direct AI, fetch, analytics, font, or asset requests from the HTML. Never render user/model strings with `innerHTML`. Display them through `textContent` and form values. Render a pitch as plain text with preserved whitespace, or a Markdown renderer that cannot introduce HTML/executable URLs.

## Actions and return values

| Action | Payload | Success data |
| --- | --- | --- |
| `bootstrap` | `{}` | Workspace view below |
| `setContext` | Partial object of `company`, `role`, `goal`, `constraints`, `preferences` | Workspace view |
| `createIdea` | `{title, problem}` | Workspace view, newly created idea selected |
| `selectIdea` | `{ideaId}` | Workspace view |
| `chat` | `{ideaId, message, requestId}` | `{idea, messages, draft, forecast, usage}` |
| `acceptDraft` | `{ideaId, draftId, revision}` | Workspace view |
| `updateIdea` | `{ideaId, patch, revision}` | Workspace view |
| `saveSettings` | `{provider, apiKey?, model, maxCallsPerDay, workspaceId?}` | Workspace view |
| `deleteKey` | `{provider}` | Workspace view; removes only that provider's key |
| `getModels` | `{provider}` | Provider catalog result below |
| `exportWorkspace` | `{}` | Export object with schema/context/ideas/history/settings/usage |
| `deleteIdea` | `{ideaId, revision}` | Workspace view; removes that case and its history |
| `refresh` | `{}` | Workspace view |

`patch` accepts only `{title?, fields?: {...}, metrics?: {...}}`. Revision is a required integer from the current idea. Do not increment it locally. A stale revision is rejected. Unknown keys are errors. Provider IDs are `gemini`, `anthropic`, `openai`, `openrouter`, `kimi`. `saveSettings` omits `apiKey` or supplies an empty string to keep that provider's existing key. Switching providers never reuses another service's key. The UI must clear its key input after saving; keys must never enter browser persistence or demonstration data. A key can be deleted only with `deleteKey`. `workspaceId` is optional for Anthropic keys that need a workspace header; it is not a secret.

## Workspace view

```json
{
  "schema": "tomboj.make-the-case.sheets.v1",
  "version": "0.3.0",
  "context": {"company":"", "role":"", "goal":"", "constraints":"", "preferences":"", "selectedId":"optional saved ID"},
  "selectedId": null,
  "ideas": [],
  "settings": {
    "provider":"", "hasKey":false, "model":"", "maxCallsPerDay":20,
    "workspaceId":"", "suggestionsCheckedAt":"2026-10-28",
    "providers":[
      {"id":"gemini", "label":"Google Gemini", "hasKey":false, "model":"gemini-3.8-flash",
       "suggestions":[{"id":"gemini-3.8-flash", "label":"Gemini 3.8 Flash — general coaching"}],
       "docs":"https://ai.google.dev/gemini-api/docs/models"}
    ]
  },
  "usage": {"date":"2026-10-27", "timezone":"UTC", "calls":0, "promptTokens":0, "outputTokens":0, "totalTokens":0}
}
```

The example above abbreviates `settings.providers`; the actual array includes all five services, per-provider key-presence indicators, remembered models, suggestions, and documentation links. A new installation has an empty active provider/model. Show an explicit “Choose your AI provider” placeholder, and do not automatically select the first option. Older Gemini installations retain their saved provider. The global daily limit applies across provider switches. Usage additionally includes `byProvider` counters after a generation attempt.

On provider selection, populate model suggestions and the saved model from that entry, then offer “Other model ID”. Do not copy the old provider's model or key input to the new one. The selected provider is not active until Save succeeds. Suggestions are a dated starting point, not a promise of access, price, quality, or compatibility.

`getModels` is an explicit server-side model-catalog lookup using that provider's saved key. It sends no case data and makes no text-generation request. It returns `{provider, models:[{id,label}], source:"provider-catalog", checkedAt, hasMore, note}`. Refresh only on a reader action, keep the current model selected, and show an error without changing saved settings. Catalog refresh may be incomplete; manual IDs remain available. A catalog entry is not proof it accepts this app's structured request.

`selectedId` is null when no ideas exist. Bootstrap does not create a placeholder idea. On the first actual user message, create an idea with a working title such as "Explore my work", then call chat with the returned selected ID. If a provider or key is missing, show settings before sending. AI-call disclosure must name the selected service and explain the saved context, selected case, recent messages, and other idea titles being sent. For OpenRouter, explain that it routes to a model host. Show the disclosure again when the destination provider changes.

## Idea view

```json
{
  "id":"stable identifier", "title":"Working title", "revision":1,
  "updatedAt":"2026-10-27T12:00:00.000Z",
  "fields":{"status":"Exploring", "permissions":"Unknown", "problem":""},
  "metrics":{"volume":null},
  "messages":[{"role":"user", "text":"A rough thought", "at":"2026-10-27T12:00:00.000Z"}],
  "messageCount":1, "draft":null, "forecast":{}, "pitch":"# Working title\n..."
}
```

All listed fields and metrics below are present, even when empty/null. The code sends at most 40 recent messages per idea to the interface, with the total `messageCount`. History retains the older messages. Tell users when older messages are not displayed. After chat, replace the relevant idea in client state with `data.idea` and update usage. Other mutations return the entire workspace view; replace workspace state with it.

### Text fields

| Group | Keys |
| --- | --- |
| Stage and purpose | `status`, `problem`, `outcome`, `selectionReason` |
| Workflow and scope | `currentWork`, `proposedWork`, `exclusions` |
| People | `originator`, `businessOwner`, `collaborators`, `audiences`, `learning` |
| Permissions | `permissions`, `reviewer`, `approvalEvidence` |
| Evidence | `baselineSource`, `evidence`, `assumptions`, `openQuestions` |
| Evaluation | `testPlan`, `quality`, `stopRule`, `reviewDate`, `request` |
| Contribution and result | `contribution`, `actualResult`, `resultSource`, `resultReviewer` |

`status`: Exploring / Developing / Needs review / Testing / Parked.
`permissions`: Unknown / Needs review / Confirmed / Not permitted.
Every text field is a string of at most 2,400 characters. Title: 1–180 characters. Message: 1–4,000 characters. Context fields: 0–2,400 characters. Dates are recorded as user-supplied text; ISO date values from a date input work.

Recording Testing requires Confirmed permissions, a nonempty reviewer, and a decision reference. These are reader-reported records, not app-granted approval. If removing those references, change status out of Testing in the same patch.

### Numeric metrics

| Key | Meaning |
| --- | --- |
| `volume` | Total tasks per month |
| `baselineMinutes` | Current minutes per task |
| `draftMinutes` | Proposed processing/drafting minutes per task |
| `reviewMinutes` | Human checking, correction, and exception minutes per covered task |
| `coverage` | Percent of tasks in scope, 0–100 |
| `uptake` | Percent uptake within covered tasks, 0–100 |
| `supportHours` | Ongoing support hours per month |
| `license` | Recurring license/usage cash per month |
| `otherCost` | Other recurring cash per month |
| `setupCash` | One-off setup cash |
| `setupHours` | One-off setup hours |
| `hourlyRate` | Cost per hour in the same currency as all cash inputs |
| `monthlyBenefit` | Attributable financial benefit per month, distinct from capacity |
| `months` | Evaluation period, greater than 0 and no more than 120 |

All start as `null` (unknown). Send a number or `null`, never an empty string or a formatted currency/percentage string. Zero is a real supplied input. A null result displays as “Not established”, not 0.

### Draft

```json
{
  "id":"draft identifier", "baseRevision":1,
  "fields":{"assumptions":"Timing is an unmeasured estimate"},
  "metrics":{"baselineMinutes":22},
  "reason":"The reader supplied an estimate, not a measurement."
}
```

Show the proposed changes and their current values. Accept sends the current idea revision and draft ID. Editing an idea invalidates the prior draft. A newer reply replaces the prior proposed draft. There is no discard action; users may leave a draft unaccepted or edit the case directly. A draft never changes records merely because a reply was generated.

AI cannot set `status`, `permissions`, `reviewer`, `approvalEvidence`, `actualResult`, `resultSource`, `resultReviewer`, or `contribution`. Provide optional reader editing for these, preferably in the case/contribution panel rather than the opening conversation. It cannot rename ideas; the reader can. It can suggest narrative fields and metric assumptions for review.

### Forecast

`available`, `missing`, `coveredTasks`, `grossHours`, `netHours`, `monthlyCash`, `totalCost`, `totalBenefit`, `roi`, `nextDecision`, `checks`, `label`.

`roi` is a ratio (0.25 means 25%). Missing values are null. Negative capacity is meaningful and must remain visible. All forecasts are scenarios, separate from actual results. Do not recalculate money in the UI or invent currency symbols. The forecast has the equations in `Core.gs`, and the pitch carries the relevant limitations.

## Request handling

Generate request IDs with `crypto.randomUUID()` where available, or another collision-resistant ID using letters/numbers/hyphens. Keep an ID attached to the exact submitted message and idea. Disable overlapping calls. If transport fails and the result is uncertain, retry the same message with the same ID. The server returns the recorded reply without another paid call if it already succeeded. If the server confirms failure/interruption, tell the reader a new intentional attempt needs a new request ID. Do not automatically retry model calls or silently generate another ID.

If a case changes in another window, reopen it with bootstrap and show the error. Never overwrite the user's unsent text. Preserve unsent text in memory until resolved; avoid browser persistence of sensitive content. A daily limit or missing key is a setup/usage state, not a successful reply.

## UI handoff checks

- Actual conversation uses the gateway and each AI proposal remains reviewable.
- Empty bootstrap, no key, busy request, quota error, changed revision, uncertain transport, and malformed response states work.
- All other ideas remain selectable. Display count, current focus, and honest save state.
- Pitch download/copy and JSON download are user actions. Exports include no key; JSON import/restore is not supported yet.
- Delete requires explicit confirmation and states that the case and its conversation are removed from the active workbook.
- Demonstration mode is labeled fictional and runs only when Google services are absent. It cannot call any AI API.
- Test with a real Sheet and permitted API key before claiming the complete application works.
