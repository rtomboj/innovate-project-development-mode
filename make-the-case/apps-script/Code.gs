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
    mtcStartHere_(book); onOpen();
    book.toast('Ready. Open the Start Here tab and click Open coach, or use Make the Case → Open coach in the top menu.');
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
      case 'reviewDraft':
        var reviewIdea = mtcFindIdea_(p.ideaId); mtcRevision_(reviewIdea, p.revision);
        var selection = mtcReviewSelection_(reviewIdea, mtcDraft_(reviewIdea, mtcHistoryRows_()), p, at);
        var reviewData = { draft: selection.draft, patch: selection.patch, skipped: selection.skipped, revision: selection.idea.revision };
        mtcHistoryCapacity_(1, reviewData);
        mtcSaveIdea_(selection.idea); mtcHistory_(reviewIdea.id, 'reviewed', '', 'Reader reviewed selected suggestions', reviewData, at);
        mtcRefreshViews_(); data = mtcBootstrap_(); break;
      case 'updateIdea':
        mtcKeys_(p, ['ideaId', 'patch', 'revision']);
        var record = mtcFindIdea_(p.ideaId); mtcRevision_(record, p.revision);
        var updated = mtcPatch_(record, p.patch, false, at);
        mtcHistoryCapacity_(1, { patch: p.patch, revision: updated.revision });
        mtcSaveIdea_(updated); mtcHistory_(record.id, 'edited', '', 'Reader updated the case', { patch: p.patch, revision: updated.revision }, at);
        mtcRefreshViews_(); data = mtcBootstrap_(); break;
      case 'setBoard':
        mtcKeys_(p, ['ideaId', 'revision', 'lane', 'outcome', 'reviewer', 'reference', 'note']);
        var boardIdea = mtcFindIdea_(p.ideaId); mtcRevision_(boardIdea, p.revision);
        if (['collect', 'develop', 'advance', 'decisions'].indexOf(p.lane) < 0) throw new Error('Choose Collect, Develop, Advance, or Decisions.');
        var boardRecord = { lane: p.lane, outcome: p.lane === 'decisions' ? (p.outcome || 'awaiting') : '', reviewer: mtcText_(p.reviewer || '', 200, 'Decision reviewer'), reference: mtcText_(p.reference || '', 500, 'Decision reference'), note: mtcText_(p.note || '', 1200, 'Decision note') };
        if (p.lane === 'decisions' && ['awaiting', 'approved', 'backlogged', 'not-pursuing'].indexOf(boardRecord.outcome) < 0) throw new Error('Choose a valid recorded outcome.');
        if (boardRecord.outcome === 'approved' && (!boardRecord.reviewer.trim() || !boardRecord.reference.trim())) throw new Error('Recording Approved needs who approved it and a decision reference.');
        if (p.lane !== 'decisions') { boardRecord.reviewer = ''; boardRecord.reference = ''; boardRecord.note = ''; }
        var carriedDraft = mtcDraft_(boardIdea, mtcHistoryRows_()), boardUpdated = mtcPatch_(boardIdea, {}, false, at);
        if (carriedDraft) carriedDraft.baseRevision = boardUpdated.revision;
        var boardEvent = { board: boardRecord, draft: carriedDraft, revision: boardUpdated.revision };
        mtcHistoryCapacity_(1, boardEvent); mtcSaveIdea_(boardUpdated); mtcHistory_(boardIdea.id, 'board', '', 'Reader updated idea board', boardEvent, at);
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
  var entries = history.filter(function (e) { return e.ideaId === idea.id && (e.type === 'reply' || e.type === 'reviewed' || e.type === 'board'); });
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
  var boardEvents = history.filter(function (e) { return e.ideaId === idea.id && e.type === 'board'; });
  view.board = boardEvents.length ? boardEvents[boardEvents.length - 1].data.board : { lane: { Exploring: 'collect', Developing: 'develop', 'Needs review': 'advance', Testing: 'advance', Parked: 'decisions' }[idea.fields.status], outcome: idea.fields.status === 'Parked' ? 'backlogged' : '', reviewer: '', reference: '', note: '' };
  if (view.board.outcome) view.pitch += '\n\n## Recorded board outcome\n' + view.board.outcome + '\nReviewer: ' + (view.board.reviewer || 'Not recorded') + '\nReference: ' + (view.board.reference || 'Not recorded') + '\n' + view.board.note + '\nThis records a reported decision; it does not grant tool, data, or live-test permission.\n';
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

/** Creates a visible entry point, preserving every nonempty/unrelated tab. */
function mtcStartHere_(book) {
  var marker = 'Make the Case | Start Here', props = PropertiesService.getDocumentProperties();
  var name = props.getProperty('MTC_START_TAB') || 'Start Here', sheet = book.getSheetByName(name);
  if (sheet && sheet.getLastRow() && sheet.getRange(1, 1, 1, 1).getValues()[0][0] !== marker) {
    name = 'Make the Case - Start'; sheet = book.getSheetByName(name);
    if (sheet && sheet.getLastRow() && sheet.getRange(1, 1, 1, 1).getValues()[0][0] !== marker) return;
  }
  if (!sheet) {
    var initial = book.getSheetByName('Sheet1');
    if (initial && !initial.getLastRow() && !initial.getLastColumn() && !initial.getImages().length && !initial.getDrawings().length && !initial.getCharts().length) sheet = initial.setName(name);
    else sheet = book.insertSheet(name);
  }
  props.setProperty('MTC_START_TAB', name);
  // Only write the managed header/instructions. Other reader content remains untouched.
  mtcWrite_(sheet, 1, [[marker, ''], ['', 'Make the Case'], ['', 'Your AI opportunity tracker and conversation memory'], ['', ''], ['', ''], ['', ''], ['', ''],
    ['', 'REOPEN ANY TIME'], ['', 'Click Open coach above. Or use the Make the Case menu beside Help → Open coach.'],
    ['', 'Continue your selected idea: review suggestions, answer the next question, then review your pitch draft.'],
    ['', 'New idea starts a separate opportunity. Your existing ideas stay in this Sheet.'],
    ['', 'Save changes saves case notes. Send reply asks the AI for its next response.'],
    ['', 'No deployment is needed. If the menu is missing, reload this spreadsheet.'],
    ['', 'Use the coach for edits; Ideas and Evidence & costs are refreshed from the saved Cases.']]);
  sheet.setHiddenGridlines(true); sheet.setColumnWidth(1, 28); sheet.setColumnWidth(2, 780);
  sheet.getRange(1, 1, 14, 2).setBackground('#111418').setFontColor('#e8ebef').setWrap(true);
  sheet.getRange(2, 2, 1, 1).setFontSize(28).setFontWeight('bold');
  sheet.getRange(8, 2, 1, 1).setFontColor('#89c1fa').setFontWeight('bold');
  for (var row = 1; row <= 14; row++) sheet.setRowHeight(row, row === 2 ? 52 : 34);
  if (!sheet.getImages().some(function (img) { return img.getAltTextTitle() === 'Make the Case: Open coach'; })) {
    var button = sheet.insertImage(Utilities.newBlob(Utilities.base64Decode('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'), 'image/png', 'open-coach.png'), 2, 5);
    button.setAltTextTitle('Make the Case: Open coach').setAltTextDescription('Open or resume your Make the Case conversation').assignScript('showCoach');
  }
  book.setActiveSheet(sheet); book.moveActiveSheet(1);
}
