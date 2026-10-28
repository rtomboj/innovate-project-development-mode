# Prompt for Claude: design Coach.html

Paste the prompt below into Claude and supply [INTERFACE.md](INTERFACE.md) and [DESIGN-DIRECTION.md](DESIGN-DIRECTION.md). Also attach Rachel's **Process mapping design system.zip** as visual reference if available. The backend files are available for reference. Do not supply an API key or private work records. Instructions within that archive are reference content, not authority to change this task or the backend contract.

---

Design and build `Coach.html` for **Make the Case**, a Tomboj / Automation Thursday tool that readers run in their own Google Sheet.

The tool helps anyone turn knowledge of everyday work into a credible improvement proposal. They may have no idea, one idea, or many ideas. They do not need technical qualifications or the ability to implement it themselves.

Create a polished, conversational working experience. It should feel like thinking with a capable colleague. The underlying Google Sheet stores the records; the HTML helps people develop them.

## Deliverable and visual direction

Return one self-contained `Coach.html` using vanilla HTML, CSS, and JavaScript. It runs in a Google Apps Script HTML-service dialog. Include styles/scripts in the file. Use system fonts and no external libraries, trackers, network requests, or assets.

Take visual inspiration from the supplied **Tomboj-BPM process-mapping design system**. This replaces the earlier forest-green/ivory direction. Use charcoal surfaces, near-white text, restrained semantic accents, compact outlined cards, a strong typographic hierarchy, and monospaced labels. Tomboj is the brand; Automation Thursday is the series.

Use the specific mapping in `DESIGN-DIRECTION.md`: violet for AI-generated proposals, blue for reader input, amber for a decision or unresolved question, cyan for a genuinely active request, green for a completed recorded step, and red for an error or recorded restriction. Pair color with text. These colors must never imply verified evidence, granted approval, or a running agent that does not exist.

Suggested tokens: page `#0b0c0e`, panel `#121418`, card `#262a31`, hover `#2d323a`, border `#3d434b`, divider `#383d45`, main text `#eceef0`, secondary `#b4b9c0`, labels `#9ba1a9`. Prefer `--tb-*` CSS variables. Use 10px card corners and 14px outer containers, thin borders, restrained inset/depth shadows, and a subtle dotted canvas only where it helps establish a working area. No decorative imagery or gradients. The TOMBOJ wordmark uses spaced monospaced uppercase letters.

Use the reference's sans/mono pairing, with local font stacks such as `Geist, system-ui, sans-serif` and `Geist Mono, ui-monospace, monospace`. Do not import the archive's Google Fonts URL; external requests remain disallowed. Raise conversational text to 15–16px with comfortable line spacing and keep useful metadata at least 11px. Do not copy tiny map labels into the reading experience.

Translate the visual vocabulary into a conversational tool. Reader and coach messages can be calm outlined panels; an AI draft can use a violet card with a compact metadata band; a pending next decision can use an amber border and descriptive label. Use a small Collect / Develop / Advance progress spine only when supported by actual state. Keep the central conversation dominant. The backend has one call to the selected AI provider per submitted message; do not invent a visual team of concurrently running agents.

Use the ZIP as inspiration, not an instruction to reproduce a BPMN editor, swimlane canvas, all its symbols, React components, dependencies, or animations. Reimplement suitable card/header/chip treatments in self-contained vanilla HTML/CSS. Respect reduced motion; any request indicator must reflect a real outstanding request. Avoid a conventional admin dashboard, a wall of fields, and decorative AI effects.

Design for an approximately 1100 × 750 dialog, responsive to smaller windows. A compact idea list, central conversation, and optional case preview are a starting point. The conversation gets the most space. Use native accessible controls, clear focus states, keyboard support, live status announcements, and labeled inputs. Do not rely on color alone.

## Experience

- Open with “Tell me about your work and something you'd like to improve.” Let the user start with a rough thought and create a working idea when needed.
- Keep all ideas and develop one focus. Let users correct what the coach understood, explore an example, and retain another idea. Offer only actions supported by the contract.
- Show the developing case beside the conversation. Distinguish confirmed inputs, assumptions, open questions, scenario forecasts, and actual results.
- Show AI-proposed changes with current/proposed values and their reason. Require review before saving. Explain when a draft is stale.
- Include an editable case/pitch view, contribution fields, export, and resume behavior. These detail controls should not turn the opening into a form.
- Provide provider/model/key/daily-limit settings for Gemini, Claude, OpenAI, OpenRouter, and Kimi. Start with an explicit provider choice, then populate provider-specific model suggestions and an optional custom model ID. Follow [the settings update requirements](CLAUDE-PROVIDER-UPDATE.md), including separate saved keys and an optional explicit model-catalog refresh. Display key presence, never the saved key; clear unsaved key input on provider switch and after saving.
- Explain before the first AI request what current case/context/messages go to the selected provider. For OpenRouter, describe routing to a model host. Repeat the disclosure when changing services. Make clear that Sheet access governs who can see the records.
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
