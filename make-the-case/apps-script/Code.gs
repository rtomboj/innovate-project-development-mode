/** Bound Google Sheets application. Add Claude's Coach.html to use the coach. */
function mtcTables_() { return {
  'Ideas': ['Idea ID', 'Title', 'Stage', 'Problem', 'Intended outcome', 'Next request', 'Net hours/month (forecast)', 'Next decision', 'Updated'],
  'Cases': ['id', 'title', 'revision', 'updatedAt'].concat(MTC.fields).concat(MTC.metrics),
  'Evidence & costs': ['Idea ID', 'Title', 'Baseline source', 'Supporting evidence', 'Assumptions', 'Open questions', 'Tasks/month', 'Current minutes/task', 'Proposed minutes/task', 'Check/correct minutes/task', 'Coverage %', 'Uptake %', 'Support hours/month', 'Covered tasks/month', 'Gross hours/month', 'Net hours/month', 'Recurring cash/month', 'Total evaluation cost', 'Total financial benefit', 'Financial ROI', 'Actual result', 'Result source'],
  'History': ['Event ID', 'Idea ID', 'Type', 'At (UTC)', 'Request ID', 'Text', 'Data'],
  'Context': ['Key', 'Value']
}; }

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Make the Case')
    .addItem('Set up / check workspace', 'setupWorkspace')
    .addItem('Open coach', 'showCoach')
    .addItem('Refresh tracker', 'refreshTracker')
    .addToUi();
}
function setupWorkspace() {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) throw new Error('The workspace is busy. Try again shortly.');
  try {
    var book = SpreadsheetApp.getActiveSpreadsheet();
    if (!book) throw new Error('Run this from the Apps Script project attached to your Google Sheet.');
    // Validate every existing named tab before creating or changing anything.
    Object.keys(mtcTables_()).forEach(function (name) {
      var s = book.getSheetByName(name);
      if (s && s.getLastRow() > 0) mtcAssertHeaders_(s, mtcTables_()[name]);
    });
    Object.keys(mtcTables_()).forEach(function (name) {
      var sheet = book.getSheetByName(name) || book.insertSheet(name), headers = mtcTables_()[name];
      if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
      if (!sheet.getLastRow()) mtcWrite_(sheet, 1, [headers]);
      sheet.setFrozenRows(1); sheet.setHiddenGridlines(true);
      sheet.getRange(1, 1, 1, headers.length).setBackground('#182d28').setFontColor('#ffffff').setFontWeight('bold').setWrap(true);
      sheet.setRowHeight(1, 42); sheet.setColumnWidths(1, headers.length, 160);
      if (name === 'Cases') sheet.setFrozenColumns(2);
      if (name === 'Context') sheet.setColumnWidth(2, 620);
      if (name === 'History') { sheet.setColumnWidth(6, 420); sheet.setColumnWidth(7, 420); }
    });
    PropertiesService.getDocumentProperties().setProperty('MTC_SCHEMA', MTC.schema);
    var existingKeys = mtcRead_('Context').map(function (r) { return r[0]; });
    MTC.context.forEach(function (k) { if (existingKeys.indexOf(k) < 0) mtcPutContext_(k, ''); });
    mtcRefreshViews_();
    book.toast('Workspace ready. Add Coach.html, then choose Make the Case → Open coach.');
  } finally { lock.releaseLock(); }
}
function showCoach() {
  mtcReady_();
  var html;
  try { html = HtmlService.createHtmlOutputFromFile('Coach'); }
  catch (e) { throw new Error('Add Claude\'s Coach.html to this Apps Script project first. The interface contract is in the kit.'); }
  SpreadsheetApp.getUi().showModalDialog(html.setWidth(1100).setHeight(750), 'Make the Case');
}
function refreshTracker() {
  var result = api({ action: 'refresh', payload: {} });
  if (!result.ok) throw new Error(result.error);
  SpreadsheetApp.getActiveSpreadsheet().toast('Tracker refreshed from the saved cases.');
}

/** The only client-facing data gateway. All helpers end in _ and are private to google.script.run. */
function api(request) {
  var lock = LockService.getDocumentLock(), acquired = false;
  try {
    mtcKeys_(request, ['action', 'payload']);
    mtcText_(request.action, 40, 'Action'); mtcObject_(request.payload || {});
    acquired = lock.tryLock(1000);
    if (!acquired) throw new Error('The workspace is processing another request. Wait, then retry.');
    mtcReady_();
    var p = request.payload || {}, at = new Date().toISOString(), data;
    switch (request.action) {
      case 'bootstrap': data = mtcBootstrap_(); break;
      case 'setContext':
        mtcKeys_(p, MTC.context);
        Object.keys(p).forEach(function (k) { mtcText_(p[k], 2400, k); });
        Object.keys(p).forEach(function (k) { mtcPutContext_(k, p[k]); });
        data = mtcBootstrap_(); break;
      case 'createIdea':
        mtcKeys_(p, ['title', 'problem']);
        var title = mtcText_(p.title, 180, 'Title').trim();
        if (!title) throw new Error('Give this opportunity a short working title.');
        if (mtcIdeas_().length >= MTC.maxIdeas) throw new Error('This pilot supports up to 200 ideas per workspace.');
        var idea = mtcNewIdea_(Utilities.getUuid(), title, mtcText_(p.problem || '', 2400, 'Problem'), at);
        mtcHistoryCapacity_(1, {});
        mtcSaveIdea_(idea); mtcPutContext_('selectedId', idea.id);
        mtcHistory_(idea.id, 'created', '', 'Opportunity created', {}, at);
        mtcRefreshViews_(); data = mtcBootstrap_(); break;
      case 'selectIdea':
        mtcKeys_(p, ['ideaId']); mtcFindIdea_(p.ideaId); mtcPutContext_('selectedId', p.ideaId); data = mtcBootstrap_(); break;
      case 'chat': data = mtcChat_(p, at); break;
      case 'acceptDraft':
        mtcKeys_(p, ['ideaId', 'draftId', 'revision']);
        var current = mtcFindIdea_(p.ideaId); mtcRevision_(current, p.revision);
        var draft = mtcDraft_(current, mtcHistoryRows_());
        if (!draft || draft.id !== p.draftId || draft.baseRevision !== current.revision) throw new Error('This draft is no longer current. Reopen the case and review the latest version.');
        var accepted = mtcPatch_(current, { fields: draft.fields, metrics: draft.metrics }, true, at);
        mtcHistoryCapacity_(1, { draftId: draft.id, revision: accepted.revision });
        mtcSaveIdea_(accepted); mtcHistory_(current.id, 'accepted', '', 'Reader accepted proposed changes', { draftId: draft.id, revision: accepted.revision }, at);
        mtcRefreshViews_(); data = mtcBootstrap_(); break;
      case 'updateIdea':
        mtcKeys_(p, ['ideaId', 'patch', 'revision']);
        var record = mtcFindIdea_(p.ideaId); mtcRevision_(record, p.revision);
        var updated = mtcPatch_(record, p.patch, false, at);
        mtcHistoryCapacity_(1, { patch: p.patch, revision: updated.revision });
        mtcSaveIdea_(updated); mtcHistory_(record.id, 'edited', '', 'Reader updated the case', { patch: p.patch, revision: updated.revision }, at);
        mtcRefreshViews_(); data = mtcBootstrap_(); break;
      case 'saveSettings': data = mtcSaveSettings_(p); break;
      case 'getModels': data = mtcGetModels_(p); break;
      case 'deleteKey':
        mtcKeys_(p, ['provider']);
        var deleteProvider = mtcProvider_(p.provider || mtcSelectedProvider_()).id;
        PropertiesService.getUserProperties().deleteProperty('MTC_KEY_' + deleteProvider.toUpperCase());
        if (deleteProvider === 'gemini') PropertiesService.getUserProperties().deleteProperty('MTC_API_KEY');
        data = mtcBootstrap_(); break;
      case 'exportWorkspace':
        mtcKeys_(p, []); data = { schema: MTC.schema, version: MTC.version, exportedAt: at,
          context: mtcContext_(), ideas: mtcIdeas_(), history: mtcHistoryRows_(), settings: mtcSettings_(), usage: mtcUsage_() }; break;
      case 'deleteIdea':
        mtcKeys_(p, ['ideaId', 'revision']);
        var deleted = mtcFindIdea_(p.ideaId); mtcRevision_(deleted, p.revision);
        mtcDeleteIdea_(deleted.id); mtcRefreshViews_(); data = mtcBootstrap_(); break;
      case 'refresh': mtcRefreshViews_(); data = mtcBootstrap_(); break;
      default: throw new Error('Unsupported action.');
    }
    return { ok: true, data: data };
  } catch (e) {
    // Never include an upstream response, request payload, or key in an error.
    var message = mtcRedact_(e.message || 'The request could not be completed.').slice(0, 600);
    return { ok: false, error: message };
  } finally { if (acquired) lock.releaseLock(); }
}

function mtcReady_() {
  if (!SpreadsheetApp.getActiveSpreadsheet() || PropertiesService.getDocumentProperties().getProperty('MTC_SCHEMA') !== MTC.schema) throw new Error('Choose Make the Case → Set up / check workspace first.');
}
function mtcAssertHeaders_(sheet, headers) {
  var actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (JSON.stringify(actual) !== JSON.stringify(headers)) throw new Error('The tab "' + sheet.getName() + '" has different headers. Use a new blank Sheet or restore its original headers. Nothing has been overwritten.');
}
function mtcSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Missing workspace tab: ' + name + '. Run setup again.');
  mtcAssertHeaders_(sheet, mtcTables_()[name]); return sheet;
}
function mtcRead_(name) {
  var sheet = mtcSheet_(name), last = sheet.getLastRow();
  var limit = name === 'History' ? MTC.maxHistory + 1 : name === 'Context' ? 30 : MTC.maxIdeas + 1;
  if (last > limit) throw new Error('The ' + name + ' tab exceeds the supported pilot size. Export/archive records before continuing.');
  return last < 2 ? [] : sheet.getRange(2, 1, last - 1, mtcTables_()[name].length).getValues();
}
function mtcSafeCell_(v) {
  if (typeof v === 'string' && /^[=+\-@']/.test(v)) return "'" + v;
  return v;
}
function mtcWrite_(sheet, row, values) {
  if (!values.length) return;
  var need = row + values.length - 1;
  if (sheet.getMaxRows() < need) sheet.insertRowsAfter(sheet.getMaxRows(), need - sheet.getMaxRows());
  sheet.getRange(row, 1, values.length, values[0].length).setValues(values.map(function (r) { return r.map(mtcSafeCell_); }));
}
function mtcContext_() {
  var out = {}; MTC.context.forEach(function (k) { out[k] = ''; });
  mtcRead_('Context').forEach(function (r) { if (MTC.context.concat(['selectedId']).indexOf(r[0]) >= 0) out[r[0]] = mtcText_(String(r[1]), 2400, 'Context'); });
  return out;
}
function mtcPutContext_(key, value) {
  var rows = mtcRead_('Context'), index = rows.findIndex(function (r) { return r[0] === key; });
  mtcWrite_(mtcSheet_('Context'), index < 0 ? rows.length + 2 : index + 2, [[key, value]]);
}
function mtcIdeas_() {
  var ids = {};
  return mtcRead_('Cases').filter(function (r) { return r[0] !== ''; }).map(function (r) {
    var id = mtcText_(r[0], 100, 'Idea ID');
    if (!id || ids[id]) throw new Error('Each saved case needs a unique ID.'); ids[id] = true;
    var idea = mtcNewIdea_(id, mtcText_(r[1], 180, 'Title'), '', String(r[3]));
    if (!Number.isInteger(r[2]) || r[2] < 1) throw new Error('The case revision is invalid.'); idea.revision = r[2];
    MTC.fields.forEach(function (k, i) { idea.fields[k] = mtcText_(String(r[4 + i]), 2400, k); });
    MTC.metrics.forEach(function (k, i) { var v = r[4 + MTC.fields.length + i]; idea.metrics[k] = mtcMetric_(v === '' ? null : v, k); });
    mtcPermissionCheck_(idea.fields); return idea;
  });
}
function mtcFindIdea_(id) {
  mtcText_(id, 100, 'Idea ID');
  var idea = mtcIdeas_().find(function (i) { return i.id === id; });
  if (!idea) throw new Error('This idea is no longer in the workspace. Reopen the tracker.'); return idea;
}
function mtcSaveIdea_(idea) {
  var rows = mtcRead_('Cases'), index = rows.findIndex(function (r) { return r[0] === idea.id; });
  var values = [idea.id, idea.title, idea.revision, idea.updatedAt].concat(MTC.fields.map(function (k) { return idea.fields[k]; }))
    .concat(MTC.metrics.map(function (k) { return idea.metrics[k] === null ? '' : idea.metrics[k]; }));
  mtcWrite_(mtcSheet_('Cases'), index < 0 ? rows.length + 2 : index + 2, [values]);
}
function mtcRevision_(idea, revision) {
  if (!Number.isInteger(revision) || idea.revision !== revision) throw new Error('This case changed in another window. Reload it before saving.');
}
function mtcHistoryRows_() {
  return mtcRead_('History').filter(function (r) { return r[0] !== ''; }).map(function (r) {
    var data;
    try { data = JSON.parse(String(r[6] || '{}')); } catch (e) { throw new Error('A history record contains invalid JSON. Restore it before continuing.'); }
    return { id: String(r[0]), ideaId: String(r[1]), type: String(r[2]), at: String(r[3]), requestId: String(r[4]), text: String(r[5]), data: data };
  });
}
function mtcHistory_(ideaId, type, requestId, text, data, at) {
  var sheet = mtcSheet_('History');
  if (sheet.getLastRow() >= MTC.maxHistory + 1) throw new Error('History is full. Export/archive this workspace before adding records.');
  var json = JSON.stringify(data);
  if (json.length > 40000) throw new Error('This record is too long to save. Shorten the text and try again.');
  mtcWrite_(sheet, sheet.getLastRow() + 1, [[Utilities.getUuid(), ideaId, type, at, requestId || '', text, json]]);
}
function mtcHistoryCapacity_(count, data) {
  if (mtcSheet_('History').getLastRow() + count > MTC.maxHistory + 1) throw new Error('History is full. Export/archive this workspace before adding records.');
  if (JSON.stringify(data).length > 40000) throw new Error('This update is too long to record. Save smaller changes.');
}
function mtcMessages_(id, history) {
  var entries = history.filter(function (e) { return e.ideaId === id; }), replied = {}, failed = {};
  entries.forEach(function (e) { if (e.type === 'reply') replied[e.requestId] = true; if (e.type === 'error') failed[e.requestId] = true; });
  return entries.filter(function (e) { return e.type === 'request' || e.type === 'reply'; })
    .map(function (e) { return { role: e.type === 'request' ? 'user' : 'assistant', text: e.text, at: e.at,
      requestId: e.requestId, status: e.type === 'reply' ? 'saved' : replied[e.requestId] ? 'replied' : failed[e.requestId] ? 'failed' : 'unanswered' }; });
}
function mtcDraft_(idea, history) {
  var entries = history.filter(function (e) { return e.ideaId === idea.id && e.type === 'reply'; });
  var latest = entries.length ? entries[entries.length - 1].data.draft : null;
  if (!latest || latest.baseRevision !== idea.revision) return null;
  // Validate stored model output again before exposing it as an actionable draft.
  var checked = mtcValidateAI_({ reply: 'Saved draft', draft: { fields: latest.fields, metrics: latest.metrics, reason: latest.reason } }, idea, latest.id, '').draft;
  return checked;
}
function mtcView_(idea, context, history) {
  var view = JSON.parse(JSON.stringify(idea));
  var messages = mtcMessages_(idea.id, history);
  view.messages = messages.slice(-40); view.messageCount = messages.length;
  view.draft = mtcDraft_(idea, history); view.forecast = mtcForecast_(idea); view.pitch = mtcPitch_(context, idea);
  return view;
}
function mtcBootstrap_() {
  var context = mtcContext_(), history = mtcHistoryRows_(), ideas = mtcIdeas_();
  var selected = ideas.some(function (i) { return i.id === context.selectedId; }) ? context.selectedId : ideas.length ? ideas[0].id : null;
  return { schema: MTC.schema, version: MTC.version, context: context, selectedId: selected,
    ideas: ideas.map(function (i) { return mtcView_(i, context, history); }), settings: mtcSettings_(), usage: mtcUsage_() };
}
function mtcSettings_() {
  var props = PropertiesService.getUserProperties(), limit = Number(props.getProperty('MTC_DAILY_LIMIT') || 20), selected = mtcSelectedProvider_();
  var providers = mtcProviders_().map(function (p) { return { id: p.id, label: p.label, hasKey: !!mtcProviderKey_(p.id),
    model: mtcProviderModel_(p.id), suggestions: p.suggestions, docs: p.docs }; });
  return { provider: selected, hasKey: !!selected && !!mtcProviderKey_(selected),
    model: selected ? mtcProviderModel_(selected) : '', maxCallsPerDay: limit, providers: providers,
    suggestionsCheckedAt: '2026-10-28', workspaceId: props.getProperty('MTC_ANTHROPIC_WORKSPACE') || '' };
}
function mtcSaveSettings_(p) {
  mtcKeys_(p, ['provider', 'apiKey', 'model', 'maxCallsPerDay', 'workspaceId']);
  var provider = mtcProvider_(p.provider || mtcSelectedProvider_()).id, model = mtcValidateModel_(provider, p.model);
  if (!Number.isInteger(p.maxCallsPerDay) || p.maxCallsPerDay < 1 || p.maxCallsPerDay > 100) throw new Error('Choose a daily request limit from 1 to 100.');
  var settings = { MTC_PROVIDER: provider, MTC_DAILY_LIMIT: String(p.maxCallsPerDay) };
  settings['MTC_MODEL_' + provider.toUpperCase()] = model;
  if (Object.prototype.hasOwnProperty.call(p, 'apiKey') && p.apiKey !== '') {
    var key = mtcText_(p.apiKey, 500, 'API key').trim();
    if (!/^[a-zA-Z0-9_.~:/+=\-]{20,500}$/.test(key)) throw new Error('Enter the API key without spaces or quotes.');
    settings['MTC_KEY_' + provider.toUpperCase()] = key;
  }
  if (Object.prototype.hasOwnProperty.call(p, 'workspaceId')) {
    var workspace = mtcText_(p.workspaceId, 100, 'Anthropic workspace ID');
    if (workspace && !/^wrkspc_[a-zA-Z0-9]+$/.test(workspace)) throw new Error('Enter an Anthropic workspace ID beginning wrkspc_, or leave it empty.');
    settings.MTC_ANTHROPIC_WORKSPACE = workspace;
  }
  PropertiesService.getUserProperties().setProperties(settings);
  return mtcBootstrap_();
}
function mtcUsage_() {
  var props = PropertiesService.getUserProperties(), date = new Date().toISOString().slice(0, 10), value;
  try { value = JSON.parse(props.getProperty('MTC_USAGE') || '{}'); } catch (e) { throw new Error('The saved usage counter is invalid. Restore it before making another request.'); }
  if (value.date !== date) return { date: date, timezone: 'UTC', calls: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 };
  if (!Number.isInteger(value.calls) || value.calls < 0) throw new Error('The usage counter is invalid.');
  return value;
}
function mtcChat_(p, at) {
  mtcKeys_(p, ['ideaId', 'message', 'requestId']);
  var idea = mtcFindIdea_(p.ideaId), message = mtcText_(p.message, 4000, 'Message').trim(), requestId = mtcText_(p.requestId, 100, 'Request ID');
  if (!message || !/^[a-zA-Z0-9_\-]{8,100}$/.test(requestId)) throw new Error('Enter a message and a unique request ID.');
  var history = mtcHistoryRows_(), prior = history.find(function (e) { return e.requestId === requestId && e.type === 'request'; });
  if (prior) {
    if (prior.ideaId !== idea.id || prior.text !== message) throw new Error('That request ID belongs to a different message. Create a new request ID.');
    if (!history.some(function (e) { return e.requestId === requestId && e.type === 'reply'; })) throw new Error('That request has no saved reply. It may have failed or been interrupted. Review the history; use a new request ID for an intentional new attempt.');
    return mtcChatResult_(idea.id);
  }
  if (history.length + 3 > MTC.maxHistory) throw new Error('History is nearly full. Export/archive the workspace before another AI request.');
  var settings = mtcSettings_();
  if (!settings.provider) throw new Error('Choose an AI provider and model in settings before sending a message.');
  var key = mtcProviderKey_(settings.provider);
  if (!key) throw new Error('Add your own API key for the selected provider before sending a message.');
  var usage = mtcUsage_();
  if (usage.calls >= settings.maxCallsPerDay) throw new Error('Your daily request limit has been reached. It resets at midnight UTC.');
  var messages = mtcMessages_(idea.id, history).concat([{ role: 'user', text: message, at: at }]);
  var context = mtcContext_(), prompt = mtcPrompt_(context, idea, messages, mtcIdeas_());
  var providerRequest = mtcProviderRequest_(settings.provider, settings.model, key, prompt);
  // Count attempts before the network call. Failed attempts may still consume provider resources.
  usage.calls += 1;
  usage.byProvider = usage.byProvider || {};
  usage.byProvider[settings.provider] = usage.byProvider[settings.provider] || { calls: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 };
  usage.byProvider[settings.provider].calls += 1;
  PropertiesService.getUserProperties().setProperty('MTC_USAGE', JSON.stringify(usage));
  mtcHistory_(idea.id, 'request', requestId, message, { baseRevision: idea.revision, provider: settings.provider, model: settings.model }, at);
  try {
    var response;
    try { response = UrlFetchApp.fetch(providerRequest.url, providerRequest.options); }
    catch (networkError) { throw new Error('The AI request could not reach the selected service. No record changes were accepted.'); }
    var code = response.getResponseCode();
    if (code !== 200) throw new Error(code === 429 ? 'The AI service rate or quota limit was reached. Check your provider account.' : 'The AI service returned HTTP ' + code + '. Check the model, key, and provider settings.');
    var body;
    try { body = JSON.parse(response.getContentText()); } catch (parseError) { throw new Error('The AI service returned an unreadable response.'); }
    var normalized = mtcProviderOutput_(settings.provider, body);
    ['promptTokens', 'outputTokens', 'totalTokens'].forEach(function (name) {
      usage[name] = (usage[name] || 0) + normalized.tokens[name];
      usage.byProvider[settings.provider][name] += normalized.tokens[name];
    });
    PropertiesService.getUserProperties().setProperty('MTC_USAGE', JSON.stringify(usage));
    if (!normalized.complete) throw new Error('The AI response was blocked or incomplete. No suggested changes were saved.');
    var output = normalized.text;
    if (output.length > 35000) throw new Error('The AI response was too long. Try a smaller question.');
    var raw;
    try { raw = JSON.parse(output); } catch (jsonError) { throw new Error('The AI response did not match the required JSON format.'); }
    var validated = mtcValidateAI_(raw, idea, Utilities.getUuid(), at);
    mtcHistory_(idea.id, 'reply', requestId, validated.reply, { draft: validated.draft, provider: settings.provider, model: settings.model }, new Date().toISOString());
    return mtcChatResult_(idea.id);
  } catch (e) {
    mtcHistory_(idea.id, 'error', requestId, 'AI request failed; saved case unchanged', {}, new Date().toISOString());
    throw e;
  }
}
function mtcChatResult_(id) {
  var context = mtcContext_(), history = mtcHistoryRows_(), view = mtcView_(mtcFindIdea_(id), context, history);
  return { idea: view, messages: view.messages, draft: view.draft, forecast: view.forecast, usage: mtcUsage_() };
}
function mtcDeleteIdea_(id) {
  var sheet = mtcSheet_('Cases'), rows = mtcRead_('Cases'), index = rows.findIndex(function (r) { return r[0] === id; });
  sheet.deleteRow(index + 2);
  var history = mtcSheet_('History'), entries = mtcRead_('History');
  for (var i = entries.length - 1; i >= 0; i--) if (entries[i][1] === id) history.deleteRow(i + 2);
  if (mtcContext_().selectedId === id) mtcPutContext_('selectedId', '');
}
function mtcReplaceView_(name, rows) {
  var sheet = mtcSheet_(name), count = mtcTables_()[name].length;
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, count).clearContent();
  mtcWrite_(sheet, 2, rows);
  if (rows.length) sheet.getRange(2, 1, rows.length, count).setVerticalAlignment('top').setWrap(true);
}
function mtcRefreshViews_() {
  var ideas = mtcIdeas_();
  mtcReplaceView_('Ideas', ideas.map(function (i) {
    var a = mtcForecast_(i), f = i.fields;
    return [i.id, i.title, f.status, f.problem, f.outcome, f.request, a.netHours === null ? '' : a.netHours, a.nextDecision, i.updatedAt];
  }));
  mtcReplaceView_('Evidence & costs', ideas.map(function (i) {
    var a = mtcForecast_(i), m = i.metrics, f = i.fields;
    return [i.id, i.title, f.baselineSource, f.evidence, f.assumptions, f.openQuestions,
      m.volume, m.baselineMinutes, m.draftMinutes, m.reviewMinutes, m.coverage, m.uptake, m.supportHours,
      a.coveredTasks, a.grossHours, a.netHours, a.monthlyCash, a.totalCost, a.totalBenefit, a.roi,
      f.actualResult, f.resultSource].map(function (v) { return v === null ? '' : v; });
  }));
}
