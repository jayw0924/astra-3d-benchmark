import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

test('refuses a download whose SHA-256 does not match', async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-fetch-'));
  await mkdir(path.join(root, 'research'), { recursive: true });
  const server = createServer((_request, response) => response.end('wrong bytes'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(() => server.close());
  const address = server.address();
  assert(address && typeof address === 'object');

  await writeFile(
    path.join(root, 'research', 'asset-manifest.json'),
    JSON.stringify({
      assets: [
        {
          id: 'fixture',
          immutableUrl: `http://127.0.0.1:${address.port}/asset.glb`,
          sha256: '0'.repeat(64),
          bytes: 11,
          localPath: 'public/assets/models/fixture.glb',
        },
      ],
    }),
  );

  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [
      path.join(projectRoot, 'scripts', 'fetch-asset.mjs'),
      'fixture',
      '--root',
      root,
    ]);
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => resolve({ code, stderr }));
  });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /SHA-256 mismatch/);
  await assert.rejects(
    access(path.join(root, 'public', 'assets', 'models', 'fixture.glb')),
  );
});
