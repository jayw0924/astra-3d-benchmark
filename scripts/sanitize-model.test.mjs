import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { Document, NodeIO } from '@gltf-transform/core';

const projectRoot = path.resolve(import.meta.dirname, '..');

function runScript(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [
      path.join(projectRoot, 'scripts', 'sanitize-model.mjs'),
      ...args,
    ]);
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (code) => resolve({ code, stderr }));
  });
}

test('removes named trademark nodes from the written model', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'astra-sanitize-'));
  const input = path.join(root, 'input.glb');
  const output = path.join(root, 'output.glb');
  const document = new Document();
  const scene = document.createScene('Scene');
  scene.addChild(
    document.createNode('Body').setCamera(document.createCamera('Body camera')),
  );
  scene.addChild(document.createNode('License Plate'));
  await new NodeIO().write(input, document);

  const result = await runScript([input, output, 'License Plate']);
  assert.equal(result.code, 0, result.stderr);

  const sanitized = await new NodeIO().read(output);
  assert.deepEqual(
    sanitized.getRoot().listNodes().map((node) => node.getName()),
    ['Body'],
  );
});
