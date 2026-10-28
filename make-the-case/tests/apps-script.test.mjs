import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = ['Core.gs', 'Providers.gs', 'Code.gs'].map(f => fs.readFileSync(new URL('../apps-script/' + f, import.meta.url), 'utf8')).join('\n');
const clean = value => JSON.parse(JSON.stringify(value));

function harness(shared) {
  const state = shared || { sheets: new Map(), user: new Map(), document: new Map(), requests: [], responses: [], nextId: 0, busy: false };
  const properties = map => ({ getProperty: key => map.get(key) ?? null,
    setProperty(key, value) { map.set(key, value); return this; },
    setProperties(obj) { Object.entries(obj).forEach(([k, v]) => map.set(k, v)); return this; },
    deleteProperty(key) { map.delete(key); return this; } });
  function sheet(name) {
    const data = [];
    const images = [];
    const s = { name, data, rows: 1000, cols: 26, getName: () => s.name,
      setName(n) { state.sheets.delete(s.name); s.name = n; state.sheets.set(n, s); return s; },
      getLastColumn: () => Math.max(0, ...data.map(r => r.reduce((n, v, i) => v !== '' && v !== undefined ? i + 1 : n, 0))),
      getImages: () => images, getDrawings: () => [], getCharts: () => [],
      insertImage() { const img = { title: '', getAltTextTitle() { return this.title; }, setAltTextTitle(t) { this.title=t; return this; }, setAltTextDescription() { return this; }, assignScript(n) { this.script=n; return this; } }; images.push(img); return img; },
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
          setWrap() { return range; }, setVerticalAlignment() { return range; }, setFontSize() { return range; }
        }; return range;
      }
    }; return s;
  }
  const book = { getSheetByName: name => state.sheets.get(name), insertSheet(name) { const s = sheet(name); state.sheets.set(name, s); return s; }, toast() {}, setActiveSheet(s) { state.activeSheet=s.name; }, moveActiveSheet() {} };
  const sandbox = {
    console, PropertiesService: { getUserProperties: () => properties(state.user), getDocumentProperties: () => properties(state.document) },
    SpreadsheetApp: { getActiveSpreadsheet: () => book, getUi: () => ({ createMenu() { const menu={addItem(){return menu;},addToUi(){}};return menu; } }) },
    LockService: { getDocumentLock: () => ({ tryLock: () => !state.busy, releaseLock() {} }) },
    Utilities: { getUuid: () => 'test-id-' + (++state.nextId), base64Decode: s => Buffer.from(s, 'base64'), newBlob: bytes => bytes },
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
  const configure = () => { const r = call('saveSettings', { provider: 'gemini', apiKey: 'example-placeholder-not-a-real-key', model: 'gemini-3.8-flash', maxCallsPerDay: 20 }); assert.equal(r.ok, true, r.error); };
  const response = (raw, options = {}) => state.responses.push({ body: { candidates: [{ finishReason: options.finishReason || 'STOP', content: { parts: [{ text: JSON.stringify(raw) }] } }], usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50, totalTokenCount: 180 } } });
  return { state, sandbox, call, boot, create, configure, response };
}
function ready() { const h = harness(); h.sandbox.setupWorkspace(); return h; }
const sampleMetrics = { volume: 80, baselineMinutes: 22, draftMinutes: 6, reviewMinutes: 8, coverage: 80, uptake: 75, supportHours: 2, license: 100, otherCost: 40, setupCash: 200, setupHours: 4, hourlyRate: 40, monthlyBenefit: null, months: 3 };

test('setup creates five tables and a Start Here page, and can safely be rerun', () => {
  const h = ready(); const i = h.create(); h.sandbox.setupWorkspace();
  assert.equal(h.state.sheets.size, 6); assert.equal(h.boot().ideas[0].id, i.id);
  assert.equal(h.state.sheets.get('Start Here').getImages().length, 1);
  assert.equal(h.state.sheets.get('Start Here').getImages()[0].script, 'showCoach');
  assert.equal(h.state.sheets.get('Context').getLastRow(), 7); // five context entries + selectedId + header
});
test('setup reuses empty Sheet1 but preserves nonempty Sheet1 and unrelated Start Here content', () => {
  let h=harness(),book=h.sandbox.SpreadsheetApp.getActiveSpreadsheet();book.insertSheet('Sheet1');h.sandbox.setupWorkspace();
  assert.equal(h.state.sheets.has('Sheet1'),false);assert.equal(h.state.sheets.has('Start Here'),true);
  h=harness();book=h.sandbox.SpreadsheetApp.getActiveSpreadsheet();
  book.insertSheet('Sheet1').getRange(1,1,1,1).setValues([['Keep my work']]);
  book.insertSheet('Start Here').getRange(1,1,1,1).setValues([['Reader notes']]);h.sandbox.setupWorkspace();
  assert.equal(h.state.sheets.get('Sheet1').data[0][0],'Keep my work');
  assert.equal(h.state.sheets.get('Start Here').data[0][0],'Reader notes');
  assert.equal(h.state.sheets.has('Make the Case - Start'),true);
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
  const key = h.state.user.get('MTC_KEY_GEMINI');
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
test('selected suggestion edits preserve the other suggestions across reopening and never grant approval', () => {
  const h = ready(); h.configure(); const i = h.create();
  h.response({ reply: 'What outcome matters?', draft: { fields: { problem: 'Slow updates', outcome: 'Consistent updates', openQuestions: 'Confirm the review time' }, metrics: { volume: 52, baselineMinutes: 25 }, reason: 'Reader estimates.' } });
  const chat = h.call('chat', { ideaId: i.id, message: 'Twelve weekly updates at 25 minutes each', requestId: 'partial-review' });
  const id = chat.data.draft.id;
  let r = h.call('reviewDraft', { ideaId: i.id, draftId: id, revision: 1, fields: { outcome: 'Fewer late customer updates' } });
  assert.equal(r.ok, true, r.error);
  let next = harness(h.state), saved = next.boot().ideas[0];
  assert.equal(saved.fields.outcome, 'Fewer late customer updates');
  assert.equal(saved.metrics.volume, null); assert.equal(saved.draft.metrics.volume, 52);
  assert.equal(saved.draft.fields.outcome, undefined); assert.equal(saved.draft.baseRevision, 2);
  assert.equal(saved.fields.permissions, 'Unknown'); assert.equal(saved.fields.status, 'Exploring');
  assert.equal(next.call('reviewDraft', { ideaId: i.id, draftId: id, revision: 2, fields: { permissions: 'Confirmed' } }).ok, false);
  assert.equal(next.call('reviewDraft', { ideaId: i.id, draftId: id, revision: 2, fields: { problem: 'Stale' }, skip: ['fields.problem'] }).ok, false);
  r = next.call('reviewDraft', { ideaId: i.id, draftId: id, revision: 2, metrics: { volume: 48 }, skip: ['fields.openQuestions'] });
  assert.equal(r.ok, true, r.error); saved = r.data.ideas[0];
  assert.equal(saved.metrics.volume, 48); assert.equal(saved.fields.openQuestions, '');
  assert.equal(saved.draft.fields.openQuestions, undefined); assert.equal(saved.draft.fields.problem, 'Slow updates');
  assert.match(saved.pitch, /Fewer late customer updates/);
  r = next.call('acceptDraft', { ideaId: i.id, draftId: id, revision: 3 });
  assert.equal(r.ok, true, r.error); assert.equal(r.data.ideas[0].draft, null);
  assert.equal(next.call('reviewDraft', { ideaId: i.id, draftId: id, revision: 3, metrics: { volume: 99 } }).ok, false);
  assert.equal(next.boot().ideas[0].metrics.volume, 48);
});

test('customer-update case runs from conversation through review, reopening, economics, pitch and export', () => {
  const h=ready();h.configure();const i=h.create('Customer status updates');
  h.response({reply:'What customer outcome would matter?',draft:{fields:{problem:'Updates take too long',currentWork:'A person writes and reviews customer updates',assumptions:'12 weekly tasks and 25 minutes are fictional estimates; 52 per average month.'},metrics:{volume:52,baselineMinutes:25},reason:'Record the stated estimates.'}});
  let r=h.call('chat',{ideaId:i.id,message:'I write 12 updates weekly, about 25 minutes each. These are estimates.',requestId:'flow-one'});
  assert.equal(r.ok,true,r.error);r=h.call('acceptDraft',{ideaId:i.id,draftId:r.data.draft.id,revision:1});assert.equal(r.ok,true,r.error);
  h.response({reply:'Who would review the investigation?',draft:{fields:{outcome:'More reliable, on-time customer updates',proposedWork:'An approved tool drafts; a person checks every fact and sends',businessOwner:'Proposed: account services lead; not yet confirmed',baselineSource:'Fictional self-estimate; time ten examples before testing',testPlan:'Measure ten fictional drafts and corrections',quality:'No missed commitments or unsupported facts',stopRule:'Stop if quality falls or checking consumes the gain',request:'Permission to investigate approved tooling and baseline measurements'},metrics:{draftMinutes:5,reviewMinutes:8,coverage:100,uptake:100,supportHours:1},reason:'Proposed scenario; no measured savings.'}});
  r=h.call('chat',{ideaId:i.id,message:'Goal: reliable updates. Explore a draft workflow and measurement request; treat timings as assumptions.',requestId:'flow-two'});assert.equal(r.ok,true,r.error);
  let item=r.data.idea;
  r=h.call('reviewDraft',{ideaId:i.id,draftId:item.draft.id,revision:item.revision,fields:{outcome:'On-time customer updates with fewer missed commitments'}});assert.equal(r.ok,true,r.error);
  const reopened=harness(h.state);item=reopened.boot().ideas[0];
  assert.equal(item.fields.outcome,'On-time customer updates with fewer missed commitments');assert.equal(item.draft.metrics.reviewMinutes,8);
  r=reopened.call('acceptDraft',{ideaId:i.id,draftId:item.draft.id,revision:item.revision});assert.equal(r.ok,true,r.error);item=r.data.ideas[0];
  assert.ok(Math.abs(item.forecast.netHours-9.4)<1e-9);assert.equal(item.forecast.roi,null);
  assert.match(item.pitch,/On-time customer updates with fewer missed commitments/);assert.match(item.pitch,/Permission to investigate/);assert.match(item.pitch,/Not yet established/);
  assert.equal(item.fields.permissions,'Unknown');assert.equal(item.fields.actualResult,'');
  const out=reopened.call('exportWorkspace');assert.equal(out.ok,true);assert.equal(out.data.ideas[0].id,i.id);assert.equal(out.data.history.filter(e=>e.type==='reply').length,2);
  assert.equal(JSON.stringify(out).includes(h.state.user.get('MTC_KEY_GEMINI')),false);assert.equal(h.state.requests.length,2);
});

test('full response templates omit blank and unchanged proposals without clearing known case values', () => {
  const h=ready();h.configure();let i=h.create();
  let r=h.call('updateIdea',{ideaId:i.id,revision:i.revision,patch:{fields:{outcome:'Keep customers informed'},metrics:{baselineMinutes:25}}});i=r.data.ideas[0];
  const fields={},metrics={};h.sandbox.MTC.fields.filter(k=>!h.sandbox.MTC.protectedFields.includes(k)).forEach(k=>fields[k]='');h.sandbox.MTC.metrics.forEach(k=>metrics[k]=null);
  fields.problem='A more precise problem';fields.outcome='Keep customers informed';metrics.baselineMinutes=25;metrics.license=0;
  h.response({reply:'Which outcome should we measure?',draft:{fields,metrics,reason:'Only meaningful changes need review.'}});
  r=h.call('chat',{ideaId:i.id,message:'Refine the problem; keep our outcome and timing.',requestId:'full-template'});assert.equal(r.ok,true,r.error);
  assert.deepEqual(Object.keys(r.data.draft.fields),['problem']);assert.deepEqual(r.data.draft.metrics,{license:0});
  r=h.call('acceptDraft',{ideaId:i.id,revision:i.revision,draftId:r.data.draft.id});assert.equal(r.ok,true,r.error);
  assert.equal(r.data.ideas[0].fields.outcome,'Keep customers informed');assert.equal(r.data.ideas[0].metrics.baselineMinutes,25);
});

test('Kanban records persist across reopening, retain pending notes, and cannot grant test permission', () => {
  const h=ready();h.configure();let i=h.create();h.response({reply:'What result matters?',draft:{fields:{outcome:'More reliable updates'},metrics:{},reason:'Reader supplied an intended outcome.'}});
  let r=h.call('chat',{ideaId:i.id,message:'We want reliable updates.',requestId:'board-draft'});assert.equal(r.ok,true,r.error);
  assert.equal(h.call('setBoard',{ideaId:i.id,revision:1,lane:'decisions',outcome:'approved'}).ok,false);
  r=h.call('setBoard',{ideaId:i.id,revision:1,lane:'develop'});assert.equal(r.ok,true,r.error);i=r.data.ideas[0];
  assert.equal(i.board.lane,'develop');assert.equal(i.draft.baseRevision,2);assert.equal(i.draft.fields.outcome,'More reliable updates');
  const reopened=harness(h.state);i=reopened.boot().ideas[0];assert.equal(i.board.lane,'develop');
  r=reopened.call('setBoard',{ideaId:i.id,revision:i.revision,lane:'decisions',outcome:'approved',reviewer:'Fictional sponsor',reference:'Fictional decision record',note:'Approval to investigate only.'});assert.equal(r.ok,true,r.error);i=r.data.ideas[0];
  assert.equal(i.board.outcome,'approved');assert.equal(i.fields.permissions,'Unknown');assert.equal(i.fields.status,'Exploring');assert.ok(i.draft);assert.match(i.pitch,/Approval to investigate only/);
  assert.equal(reopened.call('setBoard',{ideaId:i.id,revision:2,lane:'collect'}).ok,false);
  assert.equal(reopened.call('setBoard',{ideaId:i.id,revision:i.revision,lane:'collect',fields:{permissions:'Confirmed'}}).ok,false);
  assert.equal(reopened.call('updateIdea',{ideaId:i.id,revision:i.revision,patch:{fields:{status:'Testing'}}}).ok,false);
  const exported=reopened.call('exportWorkspace');assert.ok(exported.data.history.some(e=>e.type==='board'&&e.data.board.outcome==='approved'));
  assert.equal(h.state.requests.length,1);
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
  assert.equal(reference.recentMessages.at(-1).text, 'Where do I start?'); assert.equal(JSON.stringify(reference).includes(h.state.user.get('MTC_KEY_GEMINI')), false);
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
  for (const name of ['Code.gs', 'Providers.gs', 'Core.gs']) vm.runInContext(fs.readFileSync(new URL('../apps-script/' + name, import.meta.url), 'utf8'), sandbox);
  assert.equal(sandbox.mtcTables_().Cases[4], 'status');
});
test('busy workspace and unsafe model IDs fail before sending a network request', () => {
  const h = ready(); h.state.busy = true; assert.match(h.call('bootstrap').error, /processing another request/); h.state.busy = false;
  assert.equal(h.call('saveSettings', { model: 'https://elsewhere.example', maxCallsPerDay: 20 }).ok, false); assert.equal(h.state.requests.length, 0);
});

test('new workspace requires a provider choice and exposes model suggestions without keys', () => {
  const h = ready(), b = h.boot();
  assert.equal(b.settings.provider, ''); assert.equal(b.settings.model, ''); assert.equal(b.settings.hasKey, false);
  assert.deepEqual(b.settings.providers.map(p => p.id), ['gemini', 'anthropic', 'openai', 'openrouter', 'kimi']);
  assert.ok(b.settings.providers.every(p => p.suggestions.length >= 2));
  const i = h.create(); assert.match(h.call('chat', { ideaId: i.id, message: 'Hello', requestId: 'unconfigured-request' }).error, /Choose an AI provider/);
});
test('saved credentials and model selections remain separate for every provider', () => {
  const h = ready();
  for (const p of h.boot().settings.providers) {
    const r = h.call('saveSettings', { provider: p.id, model: p.suggestions[0].id, maxCallsPerDay: 20, apiKey: 'not-a-real-credential-for-' + p.id });
    assert.equal(r.ok, true, r.error); assert.equal(r.data.settings.provider, p.id);
  }
  const b = h.boot(); assert.ok(b.settings.providers.every(p => p.hasKey));
  assert.equal(h.call('deleteKey', { provider: 'kimi' }).data.settings.providers.find(p => p.id === 'kimi').hasKey, false);
  assert.equal(h.boot().settings.providers.find(p => p.id === 'openai').hasKey, true);
  for (const p of b.settings.providers) {
    assert.equal(JSON.stringify(h.call('exportWorkspace')).includes('not-a-real-credential-for-' + p.id), false);
  }
});
test('legacy Gemini settings retain access and deletion removes the legacy key too', () => {
  const h = ready(); h.state.user.set('MTC_API_KEY', 'legacy-placeholder-not-a-real-key'); h.state.user.set('MTC_MODEL', 'gemini-3.8-flash');
  assert.equal(h.boot().settings.provider, 'gemini'); assert.equal(h.boot().settings.hasKey, true);
  h.call('deleteKey', { provider: 'gemini' }); assert.equal(h.boot().settings.hasKey, false);
});
test('each provider routes only its own key and normalizes a valid response into the same reviewed draft', () => {
  const fixtures = {
    gemini: { host: 'generativelanguage.googleapis.com', model: 'gemini-3.8-flash', keyHeader: 'x-goog-api-key', body: raw => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(raw) }] } }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 } }) },
    anthropic: { host: 'api.anthropic.com', model: 'claude-sonnet-5-5', keyHeader: 'x-api-key', body: raw => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(raw) }], usage: { input_tokens: 10, output_tokens: 5 } }) },
    openai: { host: 'api.openai.com', model: 'gpt-6.1-sol', keyHeader: 'Authorization', body: raw => ({ status: 'completed', output: [{ type: 'reasoning', summary: [] }, { type: 'message', content: [{ type: 'output_text', text: JSON.stringify(raw) }] }], usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 } }) },
    openrouter: { host: 'openrouter.ai', model: 'moonshotai/kimi-k2.6', keyHeader: 'Authorization', body: raw => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(raw) } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }) },
    kimi: { host: 'api.moonshot.ai', model: 'kimi-k2.6', keyHeader: 'Authorization', body: raw => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(raw), reasoning_content: 'Not user-facing output' } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }) }
  };
  for (const [provider, f] of Object.entries(fixtures)) {
    const h = ready(), key = 'not-a-real-credential-for-' + provider;
    h.configure(); // A different saved provider must not leak to this request.
    assert.equal(h.call('saveSettings', { provider, model: f.model, apiKey: key, maxCallsPerDay: 20 }).ok, true);
    const i = h.create(), raw = { reply: 'Where did this estimate come from?', draft: { fields: { assumptions: 'Unmeasured estimate' }, metrics: { baselineMinutes: 22 }, reason: 'Review this estimate.' } };
    h.state.responses.push({ body: f.body(raw) });
    const r = h.call('chat', { ideaId: i.id, message: 'An estimate', requestId: 'request-provider-' + provider });
    assert.equal(r.ok, true, provider + ': ' + r.error);
    const sent = h.state.requests[0]; assert.equal(new URL(sent.url).hostname, f.host);
    assert.equal(sent.options.headers[f.keyHeader], f.keyHeader === 'Authorization' ? 'Bearer ' + key : key);
    assert.equal(sent.options.followRedirects, false);
    assert.equal(r.data.idea.metrics.baselineMinutes, null); assert.equal(r.data.draft.metrics.baselineMinutes, 22);
    assert.equal(r.data.usage.byProvider[provider].totalTokens, 15);
    const exportData = h.call('exportWorkspace').data;
    assert.equal(exportData.history.find(e => e.type === 'reply').data.provider, provider);
    assert.equal(JSON.stringify(exportData).includes(key), false);
    if (provider === 'openai') assert.equal(JSON.parse(sent.options.payload).store, false);
    if (provider === 'kimi') assert.equal(JSON.parse(sent.options.payload).thinking.type, 'disabled');
  }
});
test('provider switching cannot reset the total daily request limit', () => {
  const h = ready(); h.configure(); h.call('saveSettings', { provider: 'gemini', model: 'gemini-3.8-flash', maxCallsPerDay: 1 }); const i = h.create();
  h.response({ reply: 'A question?', draft: null }); h.call('chat', { ideaId: i.id, message: 'First', requestId: 'provider-limit-first' });
  h.call('saveSettings', { provider: 'openai', model: 'gpt-6.1-sol', apiKey: 'not-a-real-openai-credential', maxCallsPerDay: 1 });
  assert.match(h.call('chat', { ideaId: i.id, message: 'Second', requestId: 'provider-limit-second' }).error, /daily request limit/);
  assert.equal(h.state.requests.length, 1);
});
test('an existing key is never reused for a newly selected provider without its own credential', () => {
  const h = ready(); h.configure(); const i = h.create();
  h.call('saveSettings', { provider: 'anthropic', model: 'claude-sonnet-5-5', maxCallsPerDay: 20 });
  assert.match(h.call('chat', { ideaId: i.id, message: 'Hello', requestId: 'missing-provider-key' }).error, /selected provider/);
  assert.equal(h.state.requests.length, 0);
});
test('all-provider redaction excludes inactive keys and legacy credentials from errors', () => {
  const h = ready(); h.configure(); h.state.user.set('MTC_KEY_OPENAI', 'another-not-real-credential');
  assert.equal(h.sandbox.mtcRedact_('example-placeholder-not-a-real-key another-not-real-credential'), '[redacted] [redacted]');
});
test('provider-specific refusals and truncated replies cannot update a case', () => {
  const examples = [
    ['anthropic', 'claude-sonnet-5-5', { stop_reason: 'max_tokens', content: [{ type: 'text', text: '{}' }] }],
    ['openai', 'gpt-6.1-sol', { status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] }],
    ['openai', 'gpt-6.1-sol', { status: 'incomplete', output: [] }],
    ['openrouter', 'moonshotai/kimi-k2.6', { choices: [{ finish_reason: 'length', message: { content: '{}' } }] }],
    ['kimi', 'kimi-k3', { choices: [{ finish_reason: 'stop', message: { content: '{}', refusal: 'No' } }] }]
  ];
  for (const [provider, model, body] of examples) {
    const h = ready(); h.call('saveSettings', { provider, model, apiKey: 'not-a-real-provider-credential', maxCallsPerDay: 20 });
    const i = h.create(); h.state.responses.push({ body });
    assert.equal(h.call('chat', { ideaId: i.id, message: 'A question', requestId: 'request-rejected-' + provider }).ok, false);
    assert.equal(h.boot().ideas[0].revision, 1);
  }
});
test('explicit catalog refresh returns provider models without sending case context or counting a generation', () => {
  const h = ready(); h.call('saveSettings', { provider: 'openrouter', model: 'moonshotai/kimi-k2.6', apiKey: 'not-a-real-openrouter-credential', maxCallsPerDay: 20 });
  h.create('Private idea title');
  h.state.responses.push({ body: { data: [ { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6', supported_parameters: ['response_format'], architecture: { output_modalities: ['text'] } }, { id: 'image/model', supported_parameters: [], architecture: { output_modalities: ['image'] } } ] } });
  const r = h.call('getModels', { provider: 'openrouter' }); assert.equal(r.ok, true, r.error); assert.equal(r.data.models.length, 1);
  assert.equal(h.state.requests[0].options.method, 'get'); assert.equal(h.state.requests[0].options.payload, undefined); assert.equal(h.boot().usage.calls, 0);
});
test('manual model IDs allow supported provider formats and block foreign paths', () => {
  const h = ready();
  for (const [provider, model] of [['gemini', 'gpt-6.1-sol'], ['openai', 'gemini-3.8-flash'], ['openrouter', 'https://bad.example/model'], ['kimi', 'kimi-../escape'], ['anthropic', 'claude-foo?key=bad']]) {
    assert.equal(h.call('saveSettings', { provider, model, maxCallsPerDay: 20 }).ok, false);
  }
  assert.equal(h.call('saveSettings', { provider: 'openrouter', model: 'vendor/custom-model:free', maxCallsPerDay: 20 }).ok, true);
});
test('reopened history labels failed or unanswered messages instead of implying a completed exchange', () => {
  const h = ready(); h.configure(); const i = h.create(); h.state.responses.push(new Error('Network unavailable'));
  h.call('chat', { ideaId: i.id, message: 'A failed attempt', requestId: 'history-failed-request' });
  let messages = harness(h.state).boot().ideas[0].messages;
  assert.equal(messages[0].status, 'failed'); assert.equal(messages[0].requestId, 'history-failed-request');
  h.sandbox.mtcHistory_(i.id, 'request', 'history-unanswered-request', 'Interrupted request', {}, new Date().toISOString());
  messages = harness(h.state).boot().ideas[0].messages; assert.equal(messages.at(-1).status, 'unanswered');
});
