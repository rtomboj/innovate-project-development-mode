import test from 'node:test';
import assert from 'node:assert/strict';
import { blankWorkspace, newIdea, economics, assess, validateWorkspace, pitchMarkdown, assistantPrompt } from '../dist/model.mjs';
import { exampleWorkspace } from '../dist/example.mjs';

test('Northstar accounts for coverage, uptake, checking, and ongoing support', () => {
  const m = economics(exampleWorkspace().ideas[0].metrics);
  assert.equal(m.tasks, 48); assert.equal(m.minutesPerTask, 8);
  assert.equal(m.grossHours, 6.4); assert.equal(m.netHours, 4.4);
  assert.equal(m.monthlyCash, 140); assert.equal(m.roi, null);
});
test('extra review effort changes both economics and the next recommendation', () => {
  const i = exampleWorkspace().ideas[0]; i.metrics.reviewMinutes = 20;
  assert.equal(economics(i.metrics).netHours, -5.2);
  assert.equal(assess(i).title, 'Revisit the approach');
});
test('missing baseline and a genuine zero remain different', () => {
  const i = exampleWorkspace().ideas[0]; i.metrics.baselineMinutes = null;
  assert.equal(economics(i.metrics).available, false);
  i.metrics.baselineMinutes = 0;
  assert.equal(economics(i.metrics).available, true);
  assert.ok(economics(i.metrics).netHours < 0);
});
test('zero uptake creates no task savings while ongoing support still costs time', () => {
  const i = exampleWorkspace().ideas[0]; i.metrics.uptake = 0;
  assert.equal(economics(i.metrics).netHours, -2);
});
test('financial scenario includes setup cash/time and recurring support, without adding capacity', () => {
  const i = exampleWorkspace().ideas[0]; i.metrics.monthlyBenefit = 500;
  const m = economics(i.metrics); assert.equal(m.cost, 1020); assert.equal(m.benefits, 1500);
  assert.equal(m.roi, 480 / 1020);
  i.metrics.baselineMinutes = 100;
  assert.equal(economics(i.metrics).roi, m.roi);
});
test('percentage ROI remains unavailable when cost is zero', () => {
  const m = { ...exampleWorkspace().ideas[0].metrics, setupCash: 0, setupHours: 0, license: 0, otherCost: 0, supportHours: 0, hourlyRate: 0, monthlyBenefit: 100 };
  assert.equal(economics(m).roi, null);
});
test('recorded restrictions take precedence over attractive economics', () => {
  const i = exampleWorkspace().ideas[0]; i.permissions = 'Not permitted';
  assert.equal(assess(i).title, 'Resolve the recorded restriction');
});
test('a confirmed permission choice alone cannot remove the review condition', () => {
  const i = exampleWorkspace().ideas[0]; i.permissions = 'Confirmed';
  assert.ok(assess(i).checks.some(c => c.text.includes('supporting reference')));
});
test('a complete permission record supports a request, not automatic approval', () => {
  const s = exampleWorkspace(), i = s.ideas[0]; i.permissions = 'Confirmed'; i.reviewer = 'Authorized reviewer'; i.approvalEvidence = 'Example decision reference';
  assert.equal(assess(i).title, 'Prepare a bounded test request');
  assert.match(pitchMarkdown(s, i), /does not itself authorize implementation/);
});
test('an exported workspace retains all 17 ideas, their selection, and history', () => {
  const s = exampleWorkspace(); while (s.ideas.length < 17) s.ideas.push(newIdea(`Opportunity ${s.ideas.length + 1}`));
  const restored = validateWorkspace(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.ideas.length, 17); assert.equal(restored.selectedId, s.selectedId);
  assert.deepEqual(restored.ideas[0].history, s.ideas[0].history);
});
test('unsupported schema, duplicate identifiers, invalid metrics, and over-capacity input are rejected', () => {
  const base = exampleWorkspace();
  assert.throws(() => validateWorkspace({ ...base, schema: 'other' }));
  const duplicate = structuredClone(base); duplicate.ideas[1].id = duplicate.ideas[0].id;
  assert.throws(() => validateWorkspace(duplicate), /unique/);
  for (const value of [-1, Infinity, '12']) { const x = structuredClone(base); x.ideas[0].metrics.volume = value; assert.throws(() => validateWorkspace(x), /Invalid number/); }
  const x = structuredClone(base); x.ideas[0].metrics.uptake = 101; assert.throws(() => validateWorkspace(x), /100/);
  const many = structuredClone(base); many.ideas = Array.from({ length: 201 }, () => newIdea()); assert.throws(() => validateWorkspace(many), /200/);
});
test('recording a test in progress requires a reported authority reference', () => {
  const s = exampleWorkspace(); s.ideas[0].status = 'Testing';
  assert.throws(() => validateWorkspace(s), /Testing record/);
  Object.assign(s.ideas[0], { permissions: 'Confirmed', reviewer: 'Reviewer', approvalEvidence: 'Record' });
  assert.equal(validateWorkspace(s).ideas[0].status, 'Testing');
});
test('unexpected imported fields are discarded and an invalid focus recovers safely', () => {
  const s = JSON.parse(JSON.stringify(exampleWorkspace())); s.selectedId = 'missing'; s.context.unexpected = 'discard'; s.ideas[0].runScript = 'discard';
  const out = validateWorkspace(s); assert.equal(out.selectedId, out.ideas[0].id);
  assert.equal(out.context.unexpected, undefined); assert.equal(out.ideas[0].runScript, undefined);
});
test('the pitch preserves fictional provenance, missing actuals, and other opportunities', () => {
  const s = exampleWorkspace(), text = pitchMarkdown(s, s.ideas[0]);
  assert.match(text, /FICTIONAL EXAMPLE/); assert.match(text, /Reported results: Not yet established/);
  assert.match(text, /Consolidate account-status reporting/); assert.match(text, /Financial return is not established/);
});
test('the briefing carries current work and retained ideas as reference data', () => {
  const s = exampleWorkspace(), p = assistantPrompt(s, s.ideas[0]);
  const payload = JSON.parse(p.split('REFERENCE DATA\n')[1]);
  assert.equal(payload.selectedIdea.id, 'NS-01'); assert.equal(payload.otherIdeas.length, 2);
  assert.equal(payload.context.role, s.context.role);
});
test('a blank case points to discovery instead of inventing an ROI or approval', () => {
  const s = blankWorkspace(), a = assess(s.ideas[0]);
  assert.equal(a.money.available, false); assert.equal(a.title, 'Gather the missing evidence');
  assert.ok(a.checks.some(c => c.text.includes('baseline')));
});
