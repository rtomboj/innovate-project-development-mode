/* Provider adapters. Fixed endpoints; credentials never go to a different provider. */
function mtcProviders_() {
  return [
    { id: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-3.8-flash',
      docs: 'https://ai.google.dev/gemini-api/docs/models',
      suggestions: [{ id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash — general coaching' }, { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite — lighter tasks' }] },
    { id: 'anthropic', label: 'Anthropic / Claude', defaultModel: 'claude-sonnet-5-5',
      docs: 'https://platform.claude.com/docs/en/models/overview',
      suggestions: [{ id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 — general coaching' }, { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 — lighter tasks' }, { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 — deeper work' }] },
    { id: 'openai', label: 'OpenAI / GPT models', defaultModel: 'gpt-6.1-sol',
      docs: 'https://developers.openai.com/api/docs/models',
      suggestions: [{ id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol — general coaching' }, { id: 'gpt-6-luna', label: 'GPT-6 Luna — lighter tasks' }, { id: 'gpt-6-astra', label: 'GPT-6 Astra — deeper work' }] },
    { id: 'openrouter', label: 'OpenRouter', defaultModel: 'openai/gpt-6.1-sol',
      docs: 'https://openrouter.ai/models',
      suggestions: [{ id: 'openai/gpt-6.1-sol', label: 'OpenAI GPT-6.1 Sol via OpenRouter' }, { id: 'moonshotai/kimi-k2.6', label: 'Kimi K2.6 via OpenRouter' }] },
    { id: 'kimi', label: 'Moonshot / Kimi', defaultModel: 'kimi-k2.6',
      docs: 'https://www.kimi.ai/help/kimi-api/api-model-selection',
      suggestions: [{ id: 'kimi-k2.6', label: 'Kimi K2.6 — general coaching' }, { id: 'kimi-k3', label: 'Kimi K3 — deeper work' }] }
  ];
}
function mtcProvider_(id) {
  var result = mtcProviders_().find(function (p) { return p.id === id; });
  if (!result) throw new Error('Choose Gemini, Claude, OpenAI, OpenRouter, or Kimi.');
  return result;
}
function mtcProviderKey_(id) {
  mtcProvider_(id);
  var props = PropertiesService.getUserProperties();
  return props.getProperty('MTC_KEY_' + id.toUpperCase()) || (id === 'gemini' ? props.getProperty('MTC_API_KEY') : null);
}
function mtcSelectedProvider_() {
  var props = PropertiesService.getUserProperties();
  // Preserve an existing Gemini installation; new copies require an explicit choice.
  return props.getProperty('MTC_PROVIDER') || (props.getProperty('MTC_API_KEY') || props.getProperty('MTC_MODEL') ? 'gemini' : '');
}
function mtcProviderModel_(id) {
  var p = mtcProvider_(id), props = PropertiesService.getUserProperties();
  return props.getProperty('MTC_MODEL_' + id.toUpperCase()) || (id === 'gemini' && props.getProperty('MTC_MODEL')) || p.defaultModel;
}
function mtcValidateModel_(id, value) {
  mtcProvider_(id); mtcText_(value, 160, 'Model');
  var generic = /^[A-Za-z0-9][A-Za-z0-9._:\/-]{0,159}$/;
  var prefix = { gemini: /^gemini-/, anthropic: /^claude-/, openai: /^(gpt-|o[134](?:-|$)|chatgpt-)/, kimi: /^(kimi-|moonshot-)/ };
  if (!generic.test(value) || value.indexOf('..') >= 0 || value.indexOf('//') >= 0 ||
      (id === 'openrouter' ? !/^[A-Za-z0-9._-]+\/[A-Za-z0-9._:-]+$/.test(value) : !prefix[id].test(value))) {
    throw new Error('Enter a model ID for the selected provider, not a URL. OpenRouter IDs use vendor/model.');
  }
  return value;
}
function mtcRedact_(text) {
  var out = String(text), props = PropertiesService.getUserProperties();
  var keys = mtcProviders_().map(function (p) { return props.getProperty('MTC_KEY_' + p.id.toUpperCase()); });
  keys.push(props.getProperty('MTC_API_KEY'));
  keys.filter(Boolean).forEach(function (key) { out = out.split(key).join('[redacted]'); });
  return out;
}
function mtcProviderRequest_(provider, model, key, prompt) {
  mtcValidateModel_(provider, model);
  var schema = mtcResponseSchema_(), system = mtcSystemPrompt_(), body, url, headers = {};
  if (provider === 'gemini') {
    url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';
    headers['x-goog-api-key'] = key;
    body = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: schema } }, maxOutputTokens: 8192 } };
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages'; headers['x-api-key'] = key; headers['anthropic-version'] = '2026-10-21';
    var workspace = PropertiesService.getUserProperties().getProperty('MTC_ANTHROPIC_WORKSPACE');
    if (workspace) headers['anthropic-workspace-id'] = workspace;
    body = { model: model, max_tokens: 8192, system: system, messages: [{ role: 'user', content: prompt }],
      output_config: { format: { type: 'json_schema', schema: schema } } };
  } else if (provider === 'openai') {
    url = 'https://api.openai.com/v1/responses'; headers.Authorization = 'Bearer ' + key;
    body = { model: model, store: false, instructions: system, input: prompt, max_output_tokens: 8192,
      text: { format: { type: 'json_schema', name: 'make_the_case', strict: false, schema: schema } } };
  } else {
    headers.Authorization = 'Bearer ' + key;
    body = { model: model, max_tokens: 8192, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] };
    if (provider === 'openrouter') {
      url = 'https://openrouter.ai/api/v1/chat/completions';
      body.response_format = { type: 'json_schema', json_schema: { name: 'make_the_case', strict: false, schema: schema } };
      body.provider = { require_parameters: true, allow_fallbacks: false };
    } else {
      url = 'https://api.moonshot.ai/v1/chat/completions';
      body.response_format = { type: 'json_object' };
      if (model.indexOf('kimi-k2.6') === 0) body.thinking = { type: 'disabled' };
      if (model.indexOf('kimi-k3') === 0) body.reasoning_effort = 'low';
    }
  }
  return { url: url, options: { method: 'post', contentType: 'application/json', headers: headers,
    muteHttpExceptions: true, followRedirects: false, payload: JSON.stringify(body) } };
}
function mtcProviderOutput_(provider, body) {
  var text = '', complete = false, input = 0, output = 0, total = 0, u;
  if (provider === 'gemini') {
    u = body.usageMetadata || {}; input = u.promptTokenCount; output = u.candidatesTokenCount; total = u.totalTokenCount;
    var c = body.candidates && body.candidates[0];
    complete = !!c && c.finishReason === 'STOP';
    text = ((c && c.content && c.content.parts) || []).filter(function (p) { return !p.thought && typeof p.text === 'string'; }).map(function (p) { return p.text; }).join('');
  } else if (provider === 'anthropic') {
    u = body.usage || {}; input = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0); output = u.output_tokens; total = (input || 0) + (output || 0);
    complete = body.stop_reason === 'end_turn';
    text = (body.content || []).filter(function (p) { return p.type === 'text' && typeof p.text === 'string'; }).map(function (p) { return p.text; }).join('');
  } else if (provider === 'openai') {
    u = body.usage || {}; input = u.input_tokens; output = u.output_tokens; total = u.total_tokens;
    complete = body.status === 'completed';
    var parts = [];
    (body.output || []).forEach(function (item) { if (item.type === 'message') (item.content || []).forEach(function (p) { if (p.type === 'output_text') parts.push(p.text); else if (p.type === 'refusal') complete = false; }); });
    text = parts.join('');
  } else {
    u = body.usage || {}; input = u.prompt_tokens; output = u.completion_tokens; total = u.total_tokens;
    var choice = body.choices && body.choices[0]; complete = !!choice && choice.finish_reason === 'stop';
    text = choice && choice.message && choice.message.content;
    if (choice && choice.message && choice.message.refusal) complete = false;
  }
  var count = function (n) { return typeof n === 'number' && isFinite(n) && n >= 0 ? n : 0; };
  return { text: typeof text === 'string' ? text : '', complete: complete,
    tokens: { promptTokens: count(input), outputTokens: count(output), totalTokens: count(total) } };
}

/** Explicit catalog refresh; never sends a case or conversation. Does not generate text. */
function mtcGetModels_(p) {
  mtcKeys_(p, ['provider']);
  var provider = mtcProvider_(p.provider), key = mtcProviderKey_(provider.id);
  if (!key) throw new Error('Save a key for this provider before refreshing its model list.');
  var headers = {}, url;
  if (provider.id === 'gemini') { url = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'; headers['x-goog-api-key'] = key; }
  else if (provider.id === 'anthropic') { url = 'https://api.anthropic.com/v1/models?limit=1000'; headers['x-api-key'] = key; headers['anthropic-version'] = '2026-10-21'; var ws = PropertiesService.getUserProperties().getProperty('MTC_ANTHROPIC_WORKSPACE'); if (ws) headers['anthropic-workspace-id'] = ws; }
  else { headers.Authorization = 'Bearer ' + key; url = { openai: 'https://api.openai.com/v1/models', openrouter: 'https://openrouter.ai/api/v1/models', kimi: 'https://api.moonshot.ai/v1/models' }[provider.id]; }
  var result;
  try { result = UrlFetchApp.fetch(url, { method: 'get', headers: headers, muteHttpExceptions: true, followRedirects: false }); }
  catch (e) { throw new Error('The model list could not be reached. Saved settings are unchanged.'); }
  if (result.getResponseCode() !== 200) throw new Error('Model lookup returned HTTP ' + result.getResponseCode() + '. Check this provider\'s key and account.');
  var data; try { data = JSON.parse(result.getContentText()); } catch (e) { throw new Error('The provider returned an unreadable model list.'); }
  var list = provider.id === 'gemini' ? data.models : data.data;
  if (!Array.isArray(list)) throw new Error('The provider returned an unsupported model list.');
  var models = list.filter(function (m) {
    if (provider.id === 'gemini') return (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0;
    if (provider.id === 'openrouter') return (m.supported_parameters || []).some(function (v) { return v === 'response_format' || v === 'structured_outputs'; }) && (!m.architecture || !m.architecture.output_modalities || m.architecture.output_modalities.indexOf('text') >= 0);
    return true;
  }).map(function (m) { return { id: String(m.id || m.name || '').replace(/^models\//, ''), label: String(m.display_name || m.displayName || m.name || m.id || '') }; })
    .filter(function (m) { try { mtcValidateModel_(provider.id, m.id); return true; } catch (e) { return false; } }).slice(0, 500);
  return { provider: provider.id, models: models, source: 'provider-catalog', checkedAt: new Date().toISOString(),
    hasMore: !!(data.nextPageToken || data.has_more) || list.length > 500,
    note: 'Catalog presence does not establish account access or compatibility with this coaching request. Manual model IDs remain available.' };
}
