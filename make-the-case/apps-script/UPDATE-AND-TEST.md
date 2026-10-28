# Update your existing Make the Case Sheet to 0.4.0

Keep using your existing Google Sheet and its bound Apps Script project. Do not create a new Sheet, delete tabs, or clear any properties. The record schema is unchanged; this update preserves cases, conversation history, and saved provider keys.

1. Close the coach. In your existing Sheet, choose **Extensions → Apps Script**.
2. Replace the contents of **Code.gs**, **Core.gs**, and **Coach.html** with the matching files in this kit. In Apps Script the HTML file is called **Coach**. Keep **Providers.gs** and the existing manifest; their contents have not changed.
3. Click **Save**. Select **setupWorkspace** in the function list beside Run, and click **Run** once. This checks the existing workspace and adds a Start Here page; it does not reset saved cases or keys.
4. Return to your **Google Sheet browser tab** and reload it. Open **Start Here** and click the blue **Open coach** button. The alternative is **Make the Case → Open coach**, in the menu row beside Help. No deployment is needed. If you already have unrelated content in Start Here, the managed page is called Make the Case - Start.
5. Your saved idea should still be selected. Look for **Continue this idea** beneath the conversation. Any pending suggestions appear above it. If the sidebar is hidden, use **Show case**; that sidebar is optional while you converse.

## Continue the customer-update example

Your earlier coach question asked what business or customer outcome matters. Saving a suggestion records notes; it does not send another AI request. In the box labeled **Reply to coach about: [your idea]**, enter a fictional answer such as:

> The goal is more reliable, on-time customer updates, with fewer missed commitments. Freed time would be used to follow up on customer issues, rather than counted as cash savings. These are intended outcomes, not measured results. Ask me one next question.

Choose **Send reply**. Review the pending message and expandable saved content if the send-review screen appears, then explicitly send to your selected provider.

## End-to-end walkthrough

1. **Resume:** confirm the earlier conversation and selected idea are still present. Continue this idea identifies a missing part of the saved case; it is a rule-based prompt, not a new AI response.
2. **Converse:** answer one coach question and send. The reply should use what you already shared. An AI request only happens when you send; opening, reviewing, saving, and viewing the pitch do not request a new generation.
3. **Review one suggestion:** choose Use suggestion, or Edit suggestion / Write my own → Save this answer. Confirm the saved case changes and the other pending suggestions remain. Skip for now dismisses only that proposal and leaves the current saved answer unchanged. Open questions remain unresolved notes until you work through them.
4. **Check editing:** open Show case → Case → Edit beside Problem. Save changes and Cancel appear at the top of the editor. Close editor closes an unchanged edit directly; unsaved changes require a discard choice. Scroll within the case panel to reach later sections. Saving a separate case edit sets aside the old AI draft, as disclosed in the editor.
5. **Reopen:** close and reopen the coach. Confirm the saved answer and remaining suggestions persist, and Continue this idea identifies the next gap. Closing does not send another request.
6. **Build the case:** use conversation or case edits to capture the outcome, workflow, proposed change, people, evidence/uncertainties, investigation, quality, stop conditions, and decision requested. Add numbers in Numbers with sources and label estimates. Unknown inputs can stay blank; approval and actual results are explicit reader records.
7. **Review the pitch:** choose View pitch draft. The pitch comes from saved case values. It should carry your edits, label missing evidence, and distinguish forecasts from results. Copy or download it and confirm the output. A useful next request can ask for discovery or measurement before implementation; approval is not granted by this tool.

The supplied localhost preview is a fictional demonstration. Persistence and live AI checks must be done in the coach opened from your Google Sheet. This release has automated and local browser verification; Rachel's existing installed Sheet still needs the update and this walkthrough.
