import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = ['Core.gs', 'Code.gs'].map(f => fs.readFileSync(new URL('../apps-script/' + f, import.meta.url), 'utf8')).join('\n');
const clean = value => JSON.parse(JSON.stringify(value));

function harness(shared) {
  const state = shared || { sheets: new Map(), user: new Map(), document: new Map(), requests: [], responses: [], nextId: 0, busy: false };
  const properties = map => ({ getProperty: key => map.get(key) ?? null,
    setProperty(key, value) { map.set(key, value); return this; },
    setProperties(obj) { Object.entries(obj).forEach(([k, v]) => map.set(k, v)); return this; },
    deleteProperty(key) { map.delete(key); return this; } });
  function sheet(name) {
    const data = [];
    const s = { name, data, rows: 1000, cols: 26, getName: () => name,
      getLastRow: () => data.reduce((last, row, i) => row?.some(v => v !== '' && v !== undefined) ? i + 1 : last, 0),
      getMaxRows: () => s.rows, getMaxColumns: () => s.cols,
      insertColumnsAfter: (_, count) => { s.cols += count; }, insertRowsAfter: (_, count) => { s.rows += count; },
      setFrozenRows() {}, setFrozenColumns() {}, setHiddenGridlines() {}, setRowHeight() {}, setColumnWidths() {}, setColumnWidth() {},
      deleteRow: row => data.splice(row - 1, 1),
      getRange(row, col, height, width) {
        const range = {
          getValues: () => Array.from({ length: height }, (_, r) => Array.from({ length: width }, (_, c) => data[row + r - 1]?.[col + c - 1] ?? '')),
          setValues(values) {
            assert.equal(values.length, height);
            values.forEach((valuesRow, r) => {
              assert.equal(valuesRow.length, width); data[row + r - 1] ||= [];
              valuesRow.forEach((v, c) => { data[row + r - 1][col + c - 1] = typeof v === 'string' && v.startsWith("'") ? v.slice(1) : v; });
            }); return range;
          },
          clearContent() { for (let r = 0; r < height; r++) for (let c = 0; c < width; c++) if (data[row + r - 1]) data[row + r - 1][col + c - 1] = ''; return range; },
          setBackground() { return range; }, setFontColor() { return range; }, setFontWeight() { return range; },
          setWrap() { return range; }, setVerticalAlignment() { return range; }
        }; return range;
      }
    }; return s;
  }
  const book = { getSheetByName: name => state.sheets.get(name), insertSheet(name) { const s = sheet(name); state.sheets.set(name, s); return s; }, toast() {} };
  const sandbox = {
    console, PropertiesService: { getUserProperties: () => properties(state.user), getDocumentProperties: () => properties(state.document) },
    SpreadsheetApp: { getActiveSpreadsheet: () => book },
    LockService: { getDocumentLock: () => ({ tryLock: () => !state.busy, releaseLock() {} }) },
    Utilities: { getUuid: () => 'test-id-' + (++state.nextId) },
    UrlFetchApp: { fetch(url, options) {
      state.requests.push({ url, options });
      const response = state.responses.shift();
      if (!response) throw new Error('No fake response configured');
      if (response instanceof Error) throw response;
      return { getResponseCode: () => response.code ?? 200, getContentText: () => typeof response.body === 'string' ? response.body : JSON.stringify(response.body) };
    } }
  };
  vm.createContext(sandbox); vm.runInContext(source, sandbox);
  const call = (action, payload = {}) => clean(sandbox.api({ action, payload }));
  const boot = () => { const r = call('bootstrap'); assert.equal(r.ok, true, r.error); return r.data; };
  const create = (title = 'Improve weekly updates') => { const r = call('createIdea', { title, problem: 'Chasing information each Friday' }); assert.equal(r.ok, true, r.error); return r.data.ideas.at(-1); };
  const configure = () => { const r = call('saveSettings', { apiKey: 'example-placeholder-not-a-real-key', model: 'gemini-3.8-flash', maxCallsPerDay: 20 }); assert.equal(r.ok, true, r.error); };
  const response = (raw, options = {}) => state.responses.push({ body: { candidates: [{ finishReason: options.finishReason || 'STOP', content: { parts: [{ text: JSON.stringify(raw) }] } }], usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50, totalTokenCount: 180 } } });
  return { state, sandbox, call, boot, create, configure, response };
}
function ready() { const h = harness(); h.sandbox.setupWorkspace(); return h; }
const sampleMetrics = { volume: 80, baselineMinutes: 22, draftMinutes: 6, reviewMinutes: 8, coverage: 80, uptake: 75, supportHours: 2, license: 100, otherCost: 40, setupCash: 200, setupHours: 4, hourlyRate: 40, monthlyBenefit: null, months: 3 };

test('setup creates five tables, preserves unrelated content, and can safely be rerun', () => {
  const h = ready(); const i = h.create(); h.sandbox.setupWorkspace();
  assert.equal(h.state.sheets.size, 5); assert.equal(h.boot().ideas[0].id, i.id);
  assert.equal(h.state.sheets.get('Context').getLastRow(), 7); // five context entries + selectedId + header
});
test('setup refuses a conflicting existing tab before changing it', () => {
  const h = ready(); const s = h.state.sheets.get('Cases'); s.data[0][0] = 'Private records'; const before = JSON.stringify(s.data);
  assert.throws(() => h.sandbox.setupWorkspace(), /different headers/); assert.equal(JSON.stringify(s.data), before);
});
test('new metrics remain unknown; zero is a real input', () => {
  const h = ready(), i = h.create(); assert.equal(i.metrics.supportHours, null); assert.equal(i.forecast.netHours, null);
  const r = h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { metrics: { ...sampleMetrics, uptake: 0, supportHours: 0 } } });
  assert.equal(r.ok, true, r.error); assert.equal(r.data.ideas[0].forecast.netHours, 0);
});
test('forecast includes checking/support and visibly responds to a worse assumption', () => {
  const h = ready(), i = h.create();
  let r = h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { metrics: sampleMetrics } });
  assert.ok(Math.abs(r.data.ideas[0].forecast.netHours - 4.4) < 1e-9);
  r = h.call('updateIdea', { ideaId: i.id, revision: 2, patch: { metrics: { reviewMinutes: 20 } } });
  assert.ok(Math.abs(r.data.ideas[0].forecast.netHours + 5.2) < 1e-9);
  assert.equal(r.data.ideas[0].forecast.nextDecision, 'Revisit the approach');
  assert.equal(h.state.sheets.get('Ideas').data[1][6], r.data.ideas[0].forecast.netHours);
});
test('financial scenario includes setup labor, support, and recurring cash without double-counting capacity', () => {
  const h = ready(), i = h.create();
  const r = h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { metrics: { ...sampleMetrics, monthlyBenefit: 500 } } });
  const a = r.data.ideas[0].forecast; assert.equal(a.totalCost, 1020); assert.equal(a.totalBenefit, 1500); assert.equal(a.roi, 480 / 1020);
});
test('invalid metrics, unknown patch fields, and unverified Testing are rejected without record changes', () => {
  const h = ready(), i = h.create();
  for (const patch of [{ metrics: { coverage: 101 } }, { metrics: { months: 0 } }, { fields: { unknown: 'x' } }, { fields: { status: 'Testing' } }]) {
    assert.equal(h.call('updateIdea', { ideaId: i.id, revision: 1, patch }).ok, false);
  }
  assert.equal(h.boot().ideas[0].revision, 1);
});
test('permission evidence is required and is invalidated safely when removed during Testing', () => {
  const h = ready(), i = h.create();
  const r = h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { fields: { status: 'Testing', permissions: 'Confirmed', reviewer: 'Example reviewer', approvalEvidence: 'Example decision reference' } } });
  assert.equal(r.ok, true, r.error);
  assert.equal(h.call('updateIdea', { ideaId: i.id, revision: 2, patch: { fields: { approvalEvidence: '' } } }).ok, false);
});
test('stale revision cannot overwrite a newer case', () => {
  const h = ready(), i = h.create();
  assert.equal(h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { fields: { problem: 'Updated' } } }).ok, true);
  assert.match(h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { title: 'Old window' } }).error, /another window/);
  assert.equal(h.boot().ideas[0].title, i.title);
});
test('17 ideas and saved context survive a fresh script runtime', () => {
  const h = ready(); h.call('setContext', { company: 'Fictional Northstar', goal: 'More reliable client updates' });
  for (let n = 0; n < 17; n++) h.create('Opportunity ' + n);
  const next = harness(h.state); const b = next.boot();
  assert.equal(b.ideas.length, 17); assert.equal(b.context.company, 'Fictional Northstar'); assert.equal(b.selectedId, b.ideas.at(-1).id);
});
test('AI key stays in user properties and never appears in bootstrap, exports, or request URLs', () => {
  const h = ready(); h.configure(); const i = h.create(); h.response({ reply: 'What happened last Friday?', draft: null });
  const r = h.call('chat', { ideaId: i.id, message: 'Help me scope this', requestId: 'request-key-check' }); assert.equal(r.ok, true, r.error);
  const key = h.state.user.get('MTC_API_KEY');
  assert.equal(JSON.stringify(h.boot()).includes(key), false); assert.equal(JSON.stringify(h.call('exportWorkspace')).includes(key), false);
  assert.equal(h.state.requests[0].url.includes(key), false); assert.equal(h.state.requests[0].options.headers['x-goog-api-key'], key);
  assert.equal(h.call('deleteKey').data.settings.hasKey, false); assert.equal(h.call('chat', { ideaId: i.id, message: 'Again', requestId: 'new-request-key-check' }).ok, false);
});
test('AI changes remain a separate draft until explicitly accepted', () => {
  const h = ready(); h.configure(); const i = h.create();
  h.response({ reply: 'Let us verify that estimate. Where did it come from?', draft: { fields: { assumptions: 'Timing is an unmeasured estimate', openQuestions: 'Check representative timings' }, metrics: { baselineMinutes: 22 }, reason: 'User supplied an estimate, not a measurement.' } });
  const r = h.call('chat', { ideaId: i.id, message: 'I estimate 22 minutes', requestId: 'request-draft-accept' });
  assert.equal(r.ok, true, r.error); assert.equal(r.data.idea.metrics.baselineMinutes, null); assert.equal(r.data.draft.metrics.baselineMinutes, 22);
  const accepted = h.call('acceptDraft', { ideaId: i.id, draftId: r.data.draft.id, revision: 1 });
  assert.equal(accepted.ok, true, accepted.error); assert.equal(accepted.data.ideas[0].metrics.baselineMinutes, 22); assert.equal(accepted.data.ideas[0].draft, null);
});
test('AI cannot propose approval, actual results, credit, executable fields, or malformed numbers', () => {
  for (const draft of [ { fields: { permissions: 'Confirmed' }, metrics: {}, reason: '' }, { fields: { actualResult: 'Saved millions' }, metrics: {}, reason: '' }, { fields: { contribution: 'Built everything' }, metrics: {}, reason: '' }, { fields: { code: 'execute()' }, metrics: {}, reason: '' }, { fields: {}, metrics: { volume: '80' }, reason: '' } ]) {
    const h = ready(); h.configure(); const i = h.create(); h.response({ reply: 'A response', draft });
    const r = h.call('chat', { ideaId: i.id, message: 'An idea', requestId: 'request-invalid-output' });
    assert.equal(r.ok, false); assert.equal(h.boot().ideas[0].revision, 1); assert.equal(h.boot().ideas[0].draft, null);
  }
});
test('repeating a successful request ID returns saved work without another model call', () => {
  const h = ready(); h.configure(); const i = h.create(); h.response({ reply: 'Which part takes the most effort?', draft: null });
  const p = { ideaId: i.id, message: 'Friday updates', requestId: 'repeatable-request-id' };
  assert.equal(h.call('chat', p).ok, true); assert.equal(h.call('chat', p).ok, true); assert.equal(h.state.requests.length, 1);
  assert.equal(h.boot().usage.calls, 1); assert.equal(h.boot().ideas[0].messages.length, 2);
  assert.equal(h.call('chat', { ...p, message: 'Different content' }).ok, false);
});
test('failed or truncated requests cannot be silently replayed and never change the case', () => {
  for (const response of [{ code: 429, body: {} }, { body: { candidates: [{ finishReason: 'MAX_TOKENS' }] } }, { body: 'invalid JSON' }, new Error('network failed')]) {
    const h = ready(); h.configure(); const i = h.create(); h.state.responses.push(response);
    const p = { ideaId: i.id, message: 'A message', requestId: 'failed-request-id' };
    assert.equal(h.call('chat', p).ok, false); assert.equal(h.call('chat', p).ok, false); assert.equal(h.state.requests.length, 1);
    assert.equal(h.boot().usage.calls, 1); assert.equal(h.boot().ideas[0].revision, 1);
  }
});
test('daily limit is enforced before the next model call and token counts are recorded', () => {
  const h = ready(); h.configure(); h.call('saveSettings', { model: 'gemini-3.8-flash', maxCallsPerDay: 1 }); const i = h.create();
  h.response({ reply: 'What should improve?', draft: null });
  assert.equal(h.call('chat', { ideaId: i.id, message: 'First', requestId: 'request-usage-one' }).ok, true);
  assert.match(h.call('chat', { ideaId: i.id, message: 'Second', requestId: 'request-usage-two' }).error, /daily request limit/);
  assert.equal(h.state.requests.length, 1); assert.equal(h.boot().usage.totalTokens, 180);
});
test('prompt carries relevant saved context and other ideas without the API key', () => {
  const h = ready(); h.configure(); h.call('setContext', { company: 'Fictional Northstar', constraints: 'Customer information requires review' });
  const other = h.create('Another idea'), i = h.create(); h.response({ reply: 'What can you measure?', draft: null });
  h.call('chat', { ideaId: i.id, message: 'Where do I start?', requestId: 'request-context-check' });
  const payload = JSON.parse(h.state.requests[0].options.payload), reference = JSON.parse(payload.contents[0].parts[0].text);
  assert.equal(reference.context.company, 'Fictional Northstar'); assert.equal(reference.otherIdeas[0].title, other.title);
  assert.equal(reference.recentMessages.at(-1).text, 'Where do I start?'); assert.equal(JSON.stringify(reference).includes(h.state.user.get('MTC_API_KEY')), false);
});
test('a changed case invalidates the prior AI draft', () => {
  const h = ready(); h.configure(); const i = h.create(); h.response({ reply: 'A question?', draft: { fields: { outcome: 'A proposed outcome' }, metrics: {}, reason: 'For review' } });
  const r = h.call('chat', { ideaId: i.id, message: 'An outcome', requestId: 'request-stale-draft' });
  h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { title: 'Changed scope' } });
  assert.equal(h.call('acceptDraft', { ideaId: i.id, draftId: r.data.draft.id, revision: 2 }).ok, false);
});
test('formula-like inputs are escaped on writing but round-trip as plain text', () => {
  const h = ready(); const i = h.create('=IMPORTXML("untrusted")');
  assert.equal(i.title, '=IMPORTXML("untrusted")'); assert.equal(h.sandbox.mtcSafeCell_('=1+1'), "'=1+1");
  assert.equal(h.sandbox.mtcSafeCell_(-5), -5);
});
test('deleting a case removes its conversation and drafts while retaining other cases', () => {
  const h = ready(); h.configure(); const keep = h.create('Keep this'), i = h.create('Delete this'); h.response({ reply: 'A question?', draft: null });
  h.call('chat', { ideaId: i.id, message: 'Private example', requestId: 'request-delete-case' });
  assert.equal(h.call('deleteIdea', { ideaId: i.id, revision: 1 }).ok, true);
  const exported = h.call('exportWorkspace').data; assert.equal(exported.ideas.length, 1); assert.equal(exported.ideas[0].id, keep.id);
  assert.equal(exported.history.some(e => e.ideaId === i.id), false);
});
test('a full history is rejected before changing the case', () => {
  const h = ready(), i = h.create(); h.sandbox.MTC.maxHistory = h.state.sheets.get('History').getLastRow() - 1;
  assert.equal(h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { title: 'Should not save' } }).ok, false);
  assert.equal(h.boot().ideas[0].title, i.title);
});
test('oversized audit data is rejected before changing the case', () => {
  const h = ready(), i = h.create(), fields = {};
  h.sandbox.MTC.fields.filter(k => !['status', 'permissions'].includes(k)).forEach(k => { fields[k] = 'a'.repeat(2400); });
  assert.equal(h.call('updateIdea', { ideaId: i.id, revision: 1, patch: { fields } }).ok, false);
  assert.equal(h.boot().ideas[0].revision, 1);
});
test('script files can initialize in either order', () => {
  const sandbox = {}; vm.createContext(sandbox);
  for (const name of ['Code.gs', 'Core.gs']) vm.runInContext(fs.readFileSync(new URL('../apps-script/' + name, import.meta.url), 'utf8'), sandbox);
  assert.equal(sandbox.mtcTables_().Cases[4], 'status');
});
test('busy workspace and unsafe model IDs fail before sending a network request', () => {
  const h = ready(); h.state.busy = true; assert.match(h.call('bootstrap').error, /processing another request/); h.state.busy = false;
  assert.equal(h.call('saveSettings', { model: 'https://elsewhere.example', maxCallsPerDay: 20 }).ok, false); assert.equal(h.state.requests.length, 0);
});
