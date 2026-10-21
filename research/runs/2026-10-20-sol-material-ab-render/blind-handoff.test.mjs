import test from 'node:test';
import assert from 'node:assert/strict';
import { assertIdentityFreeText } from './blind-handoff.mjs';

test('blind handoff rejects candidate identity tokens and source paths', () => {
  assert.doesNotThrow(() => assertIdentityFreeText('Candidate A and Candidate B'));
  for (const leak of [
    'Estuary Enamel',
    'fjord-enamel-candidate',
    'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f',
    '2026-10-20-astra-material-fjord-ef457b',
  ]) {
    assert.throws(() => assertIdentityFreeText(leak), /identity leak/i);
  }
});
