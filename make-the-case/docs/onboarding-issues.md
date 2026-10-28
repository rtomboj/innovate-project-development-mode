# Onboarding issues from the Google Sheets walkthrough

Tracked in [GitHub issue #2](https://github.com/rtomboj/innovate-project-development-mode/issues/2).

Reported by Rachel on October 28, 2026 while setting up her own Sheet. These are open findings to address before the newsletter release. This log does not claim the live workflow has been independently verified.

| ID | Status | Finding | Required improvement |
| --- | --- | --- | --- |
| ONB-01 | Open | Sheet1 remains after setupWorkspace creates the tool's tabs. | Handle the unused initial tab so the finished workspace looks intentional. Reuse or remove an empty default tab, or explain its purpose. Preserve tabs containing user work. |
| ONB-02 | Open | Setup instructions do not explicitly tell the reader to name the spreadsheet. | Add a naming step before opening Apps Script. Suggested name: Make the Case — My AI Opportunity Tracker. |
| ONB-03 | Open | Setup instructions do not explicitly tell the reader to name the Apps Script project. | Add a separate project-naming step. Suggested name: Make the Case — Apps Script. Explain that this is different from the spreadsheet title. |
| ONB-04 | Open | “Make the Case → Open coach” does not explain where the command is. | Direct the reader back to the spreadsheet tab, tell them to reload it, then identify the custom Make the Case menu in the same menu row as File/Edit/View. Explain that Open coach is inside that menu, not the Apps Script editor's Run dropdown. |
| ONB-05 | Open | After closing the coach, the reader could not find how to reopen it. The custom menu is now visible but does not stand out. | Provide a clear return point in the workbook. Consider reusing the empty initial tab as Start Here, with a prominent Open coach drawing/image assigned to showCoach, plus brief reopening instructions. Apps Script does not expose styling controls for the native menu label. |

| ONB-06 | Open | Reader likes the pre-send warning, but the popup obscures what they need to review. The outer Sheets dialog also constrains the response and case reading space. | Keep the disclosure and explicit send confirmation. Show the pending message and relevant saved context alongside the warning, with expandable details; preserve the draft when returning to edit. Assess response/case reading space in the outer dialog. User-provided screenshot shows an AI reply and saved-to-Sheet status after the key test; this is not an independently inspected provider call or persistence check. |

| ONB-07 | Open | NOW / Empty and SUGGESTED comparisons are not easy to act on, and review controls can fall below the visible area. | Use Current answer / Not added yet. Add visible per-field controls: Use suggestion, Edit suggestion, Write my own, Skip for now. Address open questions individually; distinguish missing-information questions from proposed answers. Save selected/edited content without discarding other pending suggestions, and show what was saved. Unresolved questions are not facts. |
| ONB-08 | Open | The large bottom message box looks like the place to start the next idea. | Label it Reply to coach about [current idea], use a contextual answer/add-information prompt and clear send action, and keep New idea separate. Preserve unsent replies on switching. Reduce initial composer height and let it grow so the conversation and review controls remain visible. |

| ONB-09 | Open | Editing What isn't working leaves it unclear whether closing hides the editor or saves changes, and close/save controls may not be visible. | Make Edit open/close the editor clearly. Keep Save changes and Cancel / Close visible. Close an unchanged editor directly; confirm before discarding unsaved edits. Save updates the displayed value with confirmation; cancel leaves the saved value unchanged. Verify controls fit within the Sheets dialog and reopening displays the last saved value. |

Screenshot follow-up for ONB-09: reader is blocked by the clipped Problem editor; Save/Cancel are not visible. Source inspection shows panel cards can shrink in a flex column while card overflow is hidden. Treat as a blocking layout defect: retain card content height, let the panel scroll, and keep actions reachable.

Follow-up for ONB-07 and ONB-09: the reader expected NOW / Empty to accept typing, then discovered editing lives in the separate case panel. Unify editing at each suggestion: clearly distinguish read-only saved content from an editable proposed value, and support saving selected edits in place without a detour. The reader confirms scrolling down does not reveal the hidden editor controls; scrolling is not a usable workaround. Verify overflow and action reachability in the actual Sheets dialog.

## Clear wording for the current walkthrough

Return to the browser tab containing your Google Sheet. Reload that page. In the menu row near the top of the spreadsheet, where you see File, Edit, and View, click **Make the Case**. Then click **Open coach**. The coach should open in a window over the spreadsheet.

## 0.4.0 implementation and remaining verification

The user explicitly requested implementing the fixes before resuming end-to-end testing. ONB-01 through ONB-09 now have implementation changes in the 0.4.0 kit: a managed Start Here launcher, explicit naming/menu directions, inline send review, individual suggestion controls, a named current-idea reply box, and scrolling editors with visible Save/Cancel/Close actions. Keep these findings open until Rachel checks the updated installed Google dialog; local implementation is not live sign-off.

ONB-10: after saving, closing, and reopening, the reader could not identify what to do next. Added Continue this idea with a next missing-information question, pending-suggestion count, Answer next question and View pitch draft. Clarifies that saving notes and sending an AI message are separate actions. Next guidance is rule-based and does not spend a request.

62 automated checks pass, including simulated persistence through reopening and pitch/export. Local browser checks cover partial suggestion editing, panel scrolling and case save/cancel controls, saved values in the pitch, and inline disclosure. See [update instructions and live test](../apps-script/UPDATE-AND-TEST.md). The user's existing Sheet has not yet been updated by the maintainer.

## Scope while testing continues

Keep the findings open until the updated installation passes the walkthrough. The 0.4.0 source and kit include the fixes; this does not claim the installed Sheet has changed or that live behavior is verified.
