# Claude follow-up: provider-neutral settings

Supply this prompt with the updated `INTERFACE.md`, `Core.gs`, `Code.gs`, and **Providers.gs**, plus your current `Coach.html`. Keep the existing design. The backend has changed; this is more than renaming a label.

---

Update Make the Case's existing `Coach.html` so it supports **Google Gemini, Anthropic/Claude, OpenAI/GPT, OpenRouter, and Moonshot/Kimi**. Follow the attached version 0.3 interface contract and backend. Preserve the current visual design, conversation, saved cases, and all other working features.

The settings currently assume Gemini. Replace that assumption throughout the actual interface AND fictional demonstration state.

1. **Provider first.** Add a required provider selector with an initially selected empty “Choose your AI provider” option for a new workspace. Provider IDs: `gemini`, `anthropic`, `openai`, `openrouter`, `kimi`. Use labels from `settings.providers`. An existing installation's saved choice should be preserved.
2. **Model suggestions.** For the chosen provider, show its `suggestions` as labeled model choices and retain that entry's saved `model`. Include “Other model ID” with a text field. Do not hard-code a universal model or restrict every choice to `gemini-`. OpenRouter IDs use vendor/model. Suggested choices are dated starting points, not guarantees of account access or low cost.
3. **The correct key.** Change the key label/placeholder to the selected provider. Show that provider entry's `hasKey`, not another provider's status. Clear an unsaved key when switching providers and after saving. Never return a saved key to the UI, put it into localStorage, include it in a download, or reuse it with another provider. Demonstration mode never accepts or sends real keys.
4. **Save and delete.** Call `saveSettings` with `{provider, model, maxCallsPerDay, apiKey?}`. Omit or leave apiKey empty to retain the selected provider's existing key. Delete with `deleteKey({provider})`; explain that it affects only that service. Replace local state with the returned workspace only after success. The daily limit is global across services.
5. **Optional catalog refresh.** Add “Refresh models” calling `getModels({provider})` only when clicked and when that provider has a saved key. It returns `{provider,models,source,checkedAt,hasMore,note}`. This is a catalog lookup, not a chat request. Do not silently choose a different model, erase a manual ID, or auto-refresh on opening. Show lookup failures clearly and keep static suggestions available.
6. **Provider-aware communication.** Before chat, show the active service/model and explain the selected case context sent there. Explain that OpenRouter routes to a model host. Switching services keeps the same Sheet memory; require an appropriate updated disclosure before sending to a new service. Do not automatically retry on another service or model.
7. **Helpful naming.** Explain that OpenAI uses an OpenAI API key for GPT models, rather than a ChatGPT login. Kimi uses an international Moonshot/Kimi API key for this backend; regional and coding-plan credentials may differ. Optional advanced Anthropic workspace ID can be supplied as `workspaceId` if the user's key requires it.
8. **Demo parity.** Demo bootstrap must include all five providers and their suggestions. New demo settings should start unselected. Save/model switching may update fictional settings, but keep real-key input disabled and show “Demonstration — no AI calls”. Never display a fake successful provider connection.

Continue using only `google.script.run...api({action,payload})` for real application calls. All model requests remain in the backend. Keep safe text rendering, request IDs, draft review, revision checks, and failure handling. Do not modify the .gs files.

Return the complete updated `Coach.html` and a short list of what changed. Do not claim live integration was tested unless it actually was.
