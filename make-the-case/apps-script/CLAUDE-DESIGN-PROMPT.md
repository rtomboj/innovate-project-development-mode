# Prompt for Claude: design Coach.html

Paste the prompt below into Claude and supply [INTERFACE.md](INTERFACE.md). The backend files are available for reference. Do not supply an API key or private work records.

---

Design and build `Coach.html` for **Make the Case**, a Tomboj / Automation Thursday tool that readers run in their own Google Sheet.

The tool helps anyone turn knowledge of everyday work into a credible improvement proposal. They may have no idea, one idea, or many ideas. They do not need technical qualifications or the ability to implement it themselves.

Create a polished, conversational working experience. It should feel like thinking with a capable colleague. The underlying Google Sheet stores the records; the HTML helps people develop them.

## Deliverable and visual direction

Return one self-contained `Coach.html` using vanilla HTML, CSS, and JavaScript. It runs in a Google Apps Script HTML-service dialog. Include styles/scripts in the file. Use system fonts and no external libraries, trackers, network requests, or assets.

Warm, thoughtful, professional. Deep forest green, warm ivory, restrained lime accents, readable typography, generous spacing, and accessible contrast. Tomboj is the brand; Automation Thursday is the series. Avoid a conventional admin dashboard, a wall of fields, or decorative AI effects.

Design for an approximately 1100 × 750 dialog, responsive to smaller windows. A compact idea list, central conversation, and optional case preview are a starting point. The conversation gets the most space. Use native accessible controls, clear focus states, keyboard support, live status announcements, and labeled inputs. Do not rely on color alone.

## Experience

- Open with “Tell me about your work and something you'd like to improve.” Let the user start with a rough thought and create a working idea when needed.
- Keep all ideas and develop one focus. Let users correct what the coach understood, explore an example, and retain another idea. Offer only actions supported by the contract.
- Show the developing case beside the conversation. Distinguish confirmed inputs, assumptions, open questions, scenario forecasts, and actual results.
- Show AI-proposed changes with current/proposed values and their reason. Require review before saving. Explain when a draft is stale.
- Include an editable case/pitch view, contribution fields, export, and resume behavior. These detail controls should not turn the opening into a form.
- Provide key/model/daily-limit settings. Display a key-presence indicator, never the saved key. Clear the key input after saving, and keep it out of browser persistence.
- Explain before the first AI request that current case, saved context, recent messages, and other idea titles go to Google's Gemini service. Make clear that Sheet access governs who can see the records.
- Never claim the AI approved a project or verified an outcome. Proposed ownership remains unconfirmed. Financial savings and career outcomes are never invented.

## Connection requirements

Follow the attached `INTERFACE.md` exactly. Use only:

```js
google.script.run
  .withSuccessHandler(handler)
  .withFailureHandler(handler)
  .api({ action, payload });
```

The envelope is `{ok:true,data:...}` or `{ok:false,error:"..."}`. Most actions return the full workspace; chat returns one updated idea plus its messages/draft/forecast/usage. Use a small adapter for the gateway and normalize those two response shapes.

Render all user/model strings as text. Never insert them through `innerHTML` or use generated code/formulas/URLs as executable actions. Do not make direct API calls. Do not modify the `.gs` files or invent backend actions.

Show honest loading, error, empty, quota, stale-revision, and retry states. Disable overlapping submissions. Do not fake streaming or successful saves. Preserve unsent text when requests fail.

A new chat message gets a collision-resistant request ID. Keep the same ID for an uncertain transport retry. After a confirmed failed attempt, explain that an intentional new attempt uses a new ID. Never silently repeat paid calls.

When `google.script.run` is absent, include a clearly labeled fictional demonstration mode with its own isolated state. It must never claim a live AI connection or make external requests. Demonstration numbers are assumptions. In the actual bound dialog use only live backend data, including an initially empty workspace.

Return the complete HTML file and a brief list of any contract questions. Keep all design decisions inside that file so it can replace the interface without changing the backend.
