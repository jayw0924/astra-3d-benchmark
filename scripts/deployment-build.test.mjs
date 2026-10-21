import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

test('Vercel builds the public app without requiring private session transcripts', async () => {
  const packageJson = await readJson('package.json');
  const vercel = await readJson('vercel.json');

  assert.match(packageJson.scripts.build, /research:validate/);
  assert.equal(packageJson.scripts['build:app'], 'tsc -b && vite build');
  assert.equal(vercel.buildCommand, 'npm run build:app');
  assert.equal(vercel.outputDirectory, 'dist');
});
