# Update your existing Make the Case Sheet to 0.5.0

Keep using your existing Google Sheet and its bound Apps Script project. Do not create a new Sheet, delete tabs, or clear any properties. The record schema is unchanged; this update preserves cases, conversation history, and saved provider keys.

1. Close the coach. In your existing Sheet, choose **Extensions → Apps Script**.
2. Replace the contents of **Code.gs**, **Core.gs**, and **Coach.html** with the matching files in this kit. In Apps Script the HTML file is called **Coach**. Keep **Providers.gs** and the existing manifest; their contents have not changed.
3. Click **Save**. Select **setupWorkspace** in the function list beside Run, and click **Run** once. This checks the existing workspace and adds a Start Here page; it does not reset saved cases or keys.
4. Return to your **Google Sheet browser tab** and reload it. Open **Start Here** and click the blue **Open coach** button. The alternative is **Make the Case → Open coach**, in the menu row beside Help. No deployment is needed. If you already have unrelated content in Start Here, the managed page is called Make the Case - Start.
5. Your saved idea should still be selected. The header says **Make the Case**, with **Working on: [idea]** inside the conversation. Your reply box follows the current question, not the window bottom. A small progress panel appears when the window is wide enough. **My case** opens the full case, numbers, pitch, and your record. **Ideas** opens the Kanban board. **＋ New idea** is always in the top bar.

## Continue the customer-update example

Your earlier coach question asked what business or customer outcome matters. Saving a suggestion records notes; it does not send another AI request. In the box labeled **Reply to coach about: [your idea]**, enter a fictional answer such as:

> The goal is more reliable, on-time customer updates, with fewer missed commitments. Freed time would be used to follow up on customer issues, rather than counted as cash savings. These are intended outcomes, not measured results. Ask me one next question.

Choose **Send reply**. Review the pending message and expandable saved content if the send-review screen appears, then explicitly send to your selected provider.

## End-to-end walkthrough

1. **Resume:** confirm the earlier conversation and selected idea are still present. Continue this idea identifies a missing part of the saved case; it is a rule-based prompt, not a new AI response.
2. **Converse:** answer one coach question and send. The reply should use what you already shared. An AI request only happens when you send; opening, reviewing, saving, and viewing the pitch do not request a new generation.
3. **Review one suggestion:** after the AI replies, edit the proposed note directly and choose **Save & continue**. Confirm the case changes and the other proposed notes remain. The next proposed note appears in the same conversation. **Skip this note** dismisses only that proposal and leaves the saved value unchanged. **Keep talking** returns to the reply box; a subsequent AI reply replaces an older unaccepted draft. Empty and unchanged model fields no longer count as suggestions. Open questions remain unresolved notes, not verified answers.
4. **Check editing:** open **My case → Case → Edit** beside Problem. Save changes and Cancel appear at the top of the editor. Close editor closes an unchanged edit directly; unsaved changes require a discard choice. The full-case view uses the main scroll area. Saving a separate case edit sets aside the old AI draft, as disclosed in that editor.
5. **Reopen:** close and reopen the coach. Confirm the selected idea, saved answers and remaining proposed notes persist. The latest saved coach reply is the main dialogue; older messages can expand above it. Opening or saving does not automatically ask the AI another question.
6. **Build the case:** use conversation or case edits to capture the outcome, workflow, proposed change, people, evidence/uncertainties, investigation, quality, stop conditions, and decision requested. Add numbers in Numbers with sources and label estimates. Unknown inputs can stay blank; approval and actual results are explicit reader records.
7. **Review the pitch:** choose **My case → Pitch**. The pitch comes from saved case values. It should carry your edits, label missing evidence, and distinguish forecasts from results. Copy or download it and confirm the output. A useful next request can ask for discovery or measurement before implementation; approval is not granted by this tool.
8. **Check the board:** open **Ideas**. Move a card among Collect, Develop, Advance, and Decisions using Move to. The move and recorded outcome are stored in History, survive reopening, and preserve pending notes. Moving a board card is separate from choosing a conversation topic or recording Testing. Approved requires a reviewer and decision reference and does not set Permission to test. Use ＋ New idea at the top and confirm it creates another case without replacing the current one.

The supplied localhost preview is a fictional demonstration. Persistence and live AI checks must be done in the coach opened from your Google Sheet. This release has 64 automated checks and local browser verification; Rachel's existing installed Sheet still needs the update and this walkthrough. The approved design-only web prototype remains a separate preview; install the Coach.html in this kit, which includes the real Google gateway, provider settings, and error handling.
