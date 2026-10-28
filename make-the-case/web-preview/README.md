# Conversation-first design preview — approval pending

This standalone browser prototype is for Rachel's layout approval before any corresponding Apps Script changes. It is not a replacement Google Sheets build. The existing Apps Script source and 0.4.0 kit are unchanged.

Open the retained local preview at http://127.0.0.1:8871/Coach.html while its preview server is running. The server serves a copy of this Coach.html from outputs/incoming-coach/. There is no separate build, dependency installation, AI service, API key field, or Google connection.

The prototype uses one conversation column and one main scroll area. The contextual reply box is part of that content directly beneath the current question, rather than docked at the bottom of the window. Sending hides it and shows a short, explicitly simulated Reviewing your reply state. The editable working note then takes its place; saving reveals the next question and its reply box together. The Collect, Develop, and Advance buttons change the conversation topic; they do not grant approval or set a project status. My case and Ideas replace the conversation view temporarily. On wider screens, a compact read-only right panel shows saved-topic counts for each stage, two short saved-note excerpts, and View full case. It shares the page scroll and has no editor or competing next-action prompt. Below 980 pixels it is hidden to preserve dialogue space; My case remains available. Earlier conversation can expand in the same scroll area.

Submitting a reply shows one editable working note in that dialogue. Save & continue records it in browser-tab session storage and moves to the next unanswered topic. Back to my reply preserves the edited wording. Skip leaves the answer unestablished, and Jump to topic supports revisiting any part. Unsent replies and pending edits are kept per topic. Reopening in the same browser tab restores them. Closing the tab can remove this preview memory; it is not the Sheet's durable memory.

All initial data and examples are fictional. Responses are scripted to demonstrate interaction, not live AI inference. The prototype records the user's own words as an editable proposed note; it does not validate the claim. A narrative pitch is assembled from saved notes with missing information explicit. Production provider adapters, evidence controls, numeric forecasts, and financial calculations remain in the existing Apps Script implementation and must be integrated only after layout approval; this prototype does not replace those capabilities.

## Ideas board

Ideas now opens a Kanban board: Collect, Develop, Advance, and Decisions. Cards retain their notes, drafts, and conversation. Clicking a card resumes it; decision cards open the saved case. Cards offer Move to for keyboard/touch access and HTML drag/drop for desktop use. Board placement is separate from merely browsing a conversation topic. Moving to a working column resumes an unanswered topic in that phase; it preserves drafts and pending reviews from the former topic.

The Decisions lane distinguishes Awaiting decision, Approved, Backlogged, and Not pursuing. Recording Approved requires a reviewer and decision reference. Selecting an outcome alone does not save it. Outcomes and moves remain in the browser-tab preview, with earlier move/decision records retained in the idea's board history. Current recorded outcomes appear in the saved case and pitch. They do not grant company, tool, data, or live-test permission. Returning a card to a working column clears its current outcome while retaining the prior decision in board history. A finished conversation never creates an approval automatically. The board becomes two columns on medium screens and stacks on small screens.

Checked by browser interaction: move the fictional walkthrough card to Develop using Move to; confirm Approved cannot be recorded with empty approval details; cancel without setting approval; record a fictional Backlogged outcome with a note; reopen and confirm the same outcome in the board and case. Drag/drop is implemented but was not independently exercised in this check. Apps Script files remain unchanged.

## Earlier conversation checks

Checked in the actual preview: create an additional idea while keeping the three originals; submit a reply; edit and save the proposed note; reach the next question; preserve an unsent reply across jumping to another stage and returning; reopen the page with the reply intact; view saved notes and a pitch containing only accepted content; preserve edited pending wording across a stage jump and return; and skip a question without inventing an answer.

The preview script parses. A resized browser was observed at 1,222 × 722 CSS pixels, so exact requested dimensions are not claimed. Final desktop and narrow captures are saved outside this source folder. No live Google or AI test was performed for this design-only iteration.
