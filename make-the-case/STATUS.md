# Release status

October 28, 2026. Sheets backend kit 0.3.0 and browser demonstration 0.1.

## Reader-owned newsletter edition

The primary delivery is a reader-owned Google Sheet with an Apps Script conversation interface and the reader's own AI key. Supported adapters are Gemini, Claude, OpenAI, OpenRouter, and Kimi. Each provider has isolated key storage, its own remembered model, dated model suggestions, and optional explicit catalog lookup. New copies require an explicit provider choice; existing Gemini configurations are preserved. The Sheet is the tracker and persistent record.

Built: setup/menu, five-tab record structure, saved context and cases, revision checks, conversation/history persistence, reviewed model drafts, scenario economics, pitch output, user-specific key settings, enforced daily attempt limits across services, request deduplication, export without credentials, and deletion of a case with its conversation. The kit includes three .gs files, manifest, setup guide, exact interface contract, Claude design/provider-update prompts, reader customization prompt, and 33 passing backend tests using simulated services (49 total including the earlier browser model).

**Pending integration:** Rachel is having Claude design `Coach.html` and supplied a screenshot of the Gemini-only settings. The actual HTML file has not been supplied to this checkout. A follow-up prompt updates that design to the version 0.3 provider contract. The interface must be integrated and checked in a real Google Sheet with permitted AI access before this is a complete working newsletter template. No live account authorization, provider request, native formatting verification, or finished HTML integration is claimed. No recruited external reader study is required.

## Earlier browser demonstration

- Portable AI-guided method and measurement reference.
- Browser workspace with multiple ideas, one selected focus, scope, people/permissions, evidence, scenario economics, pitch export, decision and contribution records, and JSON save/restore.
- Connected fictional Northstar example.
- Newsletter draft, starting guide, research note, portfolio case-study content, and an in-app method page.
- All 16 calculation and record tests pass. Browser checks verified changing assumptions, preservation/export/restoration of 17 ideas, the testing-permission condition, and the AI briefing. Local links/assets and the credential-pattern scan pass. See the validation record for the mobile and skill-validator limits.

## Publication

The private maintainer preview at https://tomboj-make-the-case.swiftibex11.chatgpt.site remains the earlier browser demonstration. It has not been replaced with the Sheets edition and is not the newsletter delivery.

The GitHub package is being updated in [draft PR #1](https://github.com/rtomboj/innovate-project-development-mode/pull/1), branch `make-the-case-prototype-20261027`, under `make-the-case/`. The existing root README and original methodology are preserved. The new module's license applies only to its own original materials. The revised newsletter draft remains unpublished. No merge, public template link, or edit to an existing portfolio page is claimed.

## AI behavior

AI assisted development of the project. The earlier browser makes no AI calls. The Sheets backend calls the selected service only when a reader submits a message with that provider's key; HTML integration and live provider checks are pending. It does not train a model or automatically write to company systems. Catalog lookup is an explicit metadata request and sends no case context.
