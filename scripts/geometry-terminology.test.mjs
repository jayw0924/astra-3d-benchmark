import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');
const explanatoryFiles = [
  'src/App.tsx',
  'research/asset-candidates.md',
  'research/runs/2026-10-20-sol-baseline-setup/notes.md',
  'research/runs/2026-10-20-astra-inspection/notes.md',
];

test('current explanatory copy uses static geometry-count terminology', async () => {
  for (const relativePath of explanatoryFiles) {
    const content = await readFile(path.join(projectRoot, relativePath), 'utf8');
    assert.doesNotMatch(content, /\b(?:render|upload) vertices\b/i, relativePath);
    assert.doesNotMatch(content, /\buploaded POSITION vertices\b/i, relativePath);
  }
});