import test from 'node:test';
import assert from 'node:assert/strict';
import { assignBlindLabels, buildRenderPlan, candidates } from './render-plan.mjs';

test('blind labels are deterministic, balanced, and do not leak candidate names', () => {
  const first = assignBlindLabels(candidates);
  const second = assignBlindLabels([...candidates].reverse());
  assert.deepEqual(first, second);
  assert.deepEqual(first.map(({ label }) => label).sort(), ['A', 'B']);
  for (const item of first) assert(!item.label.includes(item.id));
});

test('render plan uses identical exterior matrices and nine neutral close-ups per candidate', () => {
  const plan = buildRenderPlan(candidates);
  assert.equal(plan.length, 30);
  assert.equal(new Set(plan.map(({ filename }) => filename)).size, 30);

  for (const label of ['A', 'B']) {
    const subset = plan.filter((item) => item.label === label);
    assert.equal(subset.length, 15);
    assert.deepEqual(
      subset
        .filter(({ kind }) => kind === 'exterior')
        .map(({ lighting, view }) => ({ lighting, view })),
      [
        { lighting: 'viewer', view: 'front-three-quarter' },
        { lighting: 'viewer', view: 'side' },
        { lighting: 'viewer', view: 'rear-three-quarter' },
        { lighting: 'neutral', view: 'front-three-quarter' },
        { lighting: 'neutral', view: 'side' },
        { lighting: 'neutral', view: 'rear-three-quarter' },
      ],
    );
    assert.equal(subset.filter(({ kind }) => kind === 'closeup').length, 9);
    for (const item of subset) {
      assert.match(item.filename, new RegExp(`^${label}--`));
      assert(!item.filename.includes(item.candidate.id));
      assert.match(item.candidate.sha256, /^[a-f0-9]{64}$/);
    }
  }
});
