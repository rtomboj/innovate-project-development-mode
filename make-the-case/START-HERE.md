# Start here: Make the Case

Turn an improvement idea into a proposal someone can evaluate. Keep your other ideas, work through the evidence, and record your contribution as the work develops.

**[Download the Google Sheets kit, v0.5.0](downloads/make-the-case-google-sheets-v0.5.0.zip)**

This is an early-release, reader-owned kit. Setup involves creating a Google Sheet and pasting the supplied Apps Script files. It is not a one-click template or a hosted Tomboj service. Automated and local browser checks pass; see [current verification status](STATUS.md).

## What you need

- A Google account that allows Google Sheets and Apps Script.
- For AI conversation, an API key for a service your organization permits: Gemini, Claude, OpenAI/GPT, OpenRouter, or Kimi. Provider usage may cost money.
- Information you are permitted to use. The Sheet stores your case and conversation; sending a message shares relevant saved context with your selected AI provider. OpenRouter also routes it to a model host.

You can create ideas and edit case notes without connecting an AI key. AI replies require a key. The downloaded Coach.html also runs a clearly labeled fictional demonstration outside Google; that demonstration makes no AI requests and does not save to a Sheet.

## New installation

1. Download and unzip the kit. Open its `apps-script` folder.
2. Create a blank Google Sheet named **Make the Case — My AI Opportunity Tracker**.
3. In the Sheet, choose **Extensions → Apps Script**. Name this separate project **Make the Case — Apps Script**.
4. Replace the starter **Code.gs** contents with the supplied **Code.gs**. Add script files named **Core** and **Providers**, pasting the matching `.gs` files. Add an HTML file named **Coach**, pasting **Coach.html**.
5. In Apps Script project settings, enable showing the manifest, then replace **appsscript.json** with the supplied manifest. Save the project.
6. Select **setupWorkspace** beside Run and run it once. Review Google's authorization screens for this spreadsheet, its interface, and external requests.
7. Return to the **Google Sheet browser tab** and reload it. Open **Start Here → Open coach**. Alternatively use **Make the Case → Open coach** in the Sheet's menu row beside Help. No deployment is needed.
8. For AI conversation, open **More → Settings**, choose your provider/model, and save your own API key. Keys are not stored in cells or included in exports. Start with permitted or fictional information.

For more detail or an installation error, use the [full setup guide](apps-script/README.md). Already using an earlier copy? Follow [Update and test](apps-script/UPDATE-AND-TEST.md); keep the existing Sheet and project.

## Your first pass

Choose **＋ New idea**. A rough title and a few sentences about the work are enough. If you have several ideas, create separate cards so you can return to them.

Describe one recurring problem to the coach. Answer its question in the reply box immediately underneath. AI-proposed notes stay editable until you choose **Save & continue**. Saving a note does not send another message; use **Send** when you want the next AI reply. Keep unknowns visible and identify where estimates come from.

**My case** opens the complete case, numeric assumptions, pitch draft, and your contribution/results record. **Ideas** opens the Kanban board: Collect, Develop, Advance, and Decisions. Record an outcome only when that decision has been made. Approved needs a reviewer and decision reference and does not grant tool, data, or live-test permission.

Close and reopen the coach to confirm your saved records return. Review the pitch for missing evidence, checking/support costs, the people involved, and the specific decision you are requesting. The proposal can ask for investigation or measurement; you do not have to build or deploy the solution yourself.

## Costs and ownership

The source kit is free under the module's [MIT license](LICENSE). Your Google account and AI provider have their own terms and limits. The default daily limit is 20 attempted AI messages across providers; this limits requests, not the exact amount billed. No AI calls happen merely because you open the coach or save a note.

Your records live in your Google Sheet. Anyone with Sheet access may see them; trusted editors also control its bound script. Use your provider's billing controls and your organization's approved tools/data rules.

## Something did not work?

Use [the issue tracker](https://github.com/rtomboj/innovate-project-development-mode/issues) or the newsletter comments. Describe the step, expected behavior, and error text. Do not include an API key, a private Sheet link, or confidential work records.
