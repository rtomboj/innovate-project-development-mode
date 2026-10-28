import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../apps-script/Coach.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
const clean = value => JSON.parse(JSON.stringify(value));
const extract = (start, end) => script.slice(script.indexOf(start), script.indexOf(end, script.indexOf(start)));

test('supplied Coach script parses and has no external runtime dependencies or credential persistence', () => {
  new vm.Script(script);
  assert.doesNotMatch(html, /<(?:script|iframe)\b[^>]*\bsrc\s*=|<link\b[^>]*\bhref\s*=/i);
  assert.doesNotMatch(script, /\b(?:fetch|eval)\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|new Function/);
  assert.match(script, /google\.script\.run/);
});
test('nested card content preserves following action buttons and footer text', () => {
  class Node { constructor(text) { this.text = text; this.children = []; } appendChild(child) { this.children.push(child); } setAttribute() {} addEventListener() {} }
  const context = { Node, document: { createElement: () => new Node(), createTextNode: t => new Node(t) } };
  vm.createContext(context); vm.runInContext(extract('function h(tag,props)', 'function clear('), context);
  const node = context.h('section', null, 'first', ['nested', ['deeper'], 'after nested'], 'accept button', 'footer');
  assert.deepEqual(node.children.map(n => n.text), ['first', 'nested', 'deeper', 'after nested', 'accept button', 'footer']);
});

function sender(response, setup) {
  const fields = {}, metrics = {}, item = { id: 'case-1', title: 'Example', revision: 1, fields, metrics, messages: [] };
  const box = { value: 'A rough idea', focus() {} }, calls = [];
  const context = { Promise, Number, Error, Object,
    LIVE: true, S: { busy: false, ws: { selectedId: item.id, ideas: [item], usage: { calls: 0 }, settings: { provider: 'gemini', model: 'gemini-3.8-flash', hasKey: true, maxCallsPerDay: 20 } }, disclosedFor: 'gemini', setAside: {}, pending: null },
    $: () => box, setBusy: value => { context.S.busy = value; }, setNotice: (kind, text) => { context.notice = { kind, text }; },
    renderNotice() {}, renderAll() {}, openSettings() {}, openDisclosure() {}, markSaved() {}, announce() {},
    classify: () => 'error', newId: () => 'unique-request-id', isWorkspace: () => true,
    isIdea: i => !!i && typeof i.id === 'string' && Array.isArray(i.messages),
    handleErr: e => { context.outerError = e; return Promise.resolve(); }, reloadAfterStale: () => Promise.resolve(),
    call: (action, payload) => { calls.push({ action, payload }); return typeof response === 'function' ? response() : Promise.resolve(response); }
  };
  if (setup) setup(context);
  vm.createContext(context); vm.runInContext(extract('function send(fromRetry)', '/* ---------- rendering'), context);
  return { context, box, calls, item, settle: async () => { await new Promise(resolve => setImmediate(resolve)); await new Promise(resolve => setImmediate(resolve)); } };
}
test('malformed successful transport remains an uncertain request that can be retried with its ID', async () => {
  const s = sender({ idea: {} }); s.context.send(); await s.settle();
  assert.equal(s.context.S.pending.state, 'uncertain'); assert.equal(s.context.S.pending.requestId, 'unique-request-id');
  assert.equal(s.box.value, 'A rough idea'); assert.equal(s.context.S.busy, false);
});
test('confirmed server failure retains text and marks an intentional new attempt as necessary', async () => {
  const s = sender(() => Promise.reject(Object.assign(new Error('Provider rejected the request'), { kind: 'server' })));
  s.context.send(); await s.settle(); assert.equal(s.context.S.pending.state, 'failed'); assert.equal(s.box.value, 'A rough idea');
});
test('an uncertain same-ID retry can retrieve a reply even when the daily limit was reached', async () => {
  const response = { idea: { id: 'case-1', title: 'Example', revision: 1, fields: {}, metrics: {}, messages: [] }, usage: { calls: 20 } };
  const s = sender(response, c => { c.S.ws.usage.calls = 20; c.S.pending = { ideaId: 'case-1', message: 'A rough idea', requestId: 'original-request-id', state: 'uncertain', provider: 'gemini', model: 'gemini-3.8-flash' }; });
  s.context.send(true); await s.settle(); assert.equal(s.calls.length, 1); assert.equal(s.calls[0].payload.requestId, 'original-request-id'); assert.equal(s.context.S.pending, null);
});
test('an uncertain request cannot silently be retried on a different provider or model', async () => {
  const s = sender({}, c => { c.S.pending = { ideaId: 'case-1', message: 'A rough idea', requestId: 'original-request-id', state: 'uncertain', provider: 'openai', model: 'gpt-6.1-sol' }; });
  s.context.send(true); await s.settle(); assert.equal(s.calls.length, 0); assert.match(s.context.notice.text, /original provider and model/);
});
test('demo provider settings follow the real provider catalog and forecast calculations match Core.gs', async () => {
  let id = 0;
  const context = { setTimeout: fn => fn(), newId: () => 'demo-id-' + (++id), clone: clean };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL('../apps-script/Core.gs', import.meta.url), 'utf8') + '\n' + fs.readFileSync(new URL('../apps-script/Providers.gs', import.meta.url), 'utf8'), context);
  context.FIELDS = context.MTC.fields; context.METRICS = context.MTC.metrics; context.PROTECTED = context.MTC.protectedFields; context.CONTEXT = context.MTC.context;
  vm.runInContext(script.slice(script.indexOf('var Demo=(function()'), script.lastIndexOf('\nrenderAll();')), context);
  const call = async (action, payload = {}) => clean(await context.Demo.api({ action, payload }));
  let b = (await call('bootstrap')).data;
  assert.equal(b.settings.provider, '');
  const actualProviders = clean(context.mtcProviders_());
  assert.deepEqual(b.settings.providers.map(p => [p.id, p.suggestions]), actualProviders.map(p => [p.id, p.suggestions]));
  for (const i of b.ideas) assert.deepEqual(i.forecast, clean(context.mtcForecast_(i)));
  let count = b.ideas.length;
  for (; count < 17; count++) await call('createIdea', { title: 'Opportunity ' + count, problem: '' });
  b = (await call('bootstrap')).data; assert.equal(b.ideas.length, 17); assert.equal(new Set(b.ideas.map(i => i.id)).size, 17);
  for (const p of actualProviders) {
    const saved = await call('saveSettings', { provider: p.id, model: p.defaultModel, maxCallsPerDay: 20 });
    assert.equal(saved.ok, true); assert.equal(saved.data.settings.provider, p.id); assert.equal(saved.data.settings.hasKey, false);
  }
  assert.equal((await call('getModels', { provider: 'openai' })).ok, false);
  assert.equal((await call('saveSettings', { provider: 'openai', model: 'gpt-6.1-sol', maxCallsPerDay: 20, apiKey: 'not-a-real-key' })).ok, false);
});
