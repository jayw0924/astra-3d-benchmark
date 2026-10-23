import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import validator from 'gltf-validator';

const projectRoot = path.resolve(import.meta.dirname, '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));
}

test('pins the deterministic geometry toolchain explicitly', async () => {
  const packageJson = await readJson('package.json');
  assert.deepEqual(
    Object.fromEntries([
      '@gltf-transform/cli',
      '@gltf-transform/core',
      '@gltf-transform/extensions',
      '@gltf-transform/functions',
      'gltf-validator',
      'meshoptimizer',
    ].map((name) => [name, packageJson.devDependencies[name]])),
    {
      '@gltf-transform/cli': '4.5.1',
      '@gltf-transform/core': '4.5.1',
      '@gltf-transform/extensions': '4.5.1',
      '@gltf-transform/functions': '4.5.1',
      'gltf-validator': '2.0.0-dev.3.10',
      'meshoptimizer': '1.2.0',
    },
  );
  assert.equal(validator.version(), '2.0.0-dev.3.10');
});

test('official validator parses the immutable Estuary control without errors', async () => {
  const bytes = await readFile(
    path.join(projectRoot, 'public', 'assets', 'models', 'product-estuary.glb'),
  );
  const report = await validator.validateBytes(new Uint8Array(bytes), {
    uri: 'public/assets/models/product-estuary.glb',
    writeTimestamp: false,
    maxIssues: 0,
  });

  assert.equal(report.issues.numErrors, 0);
  assert.equal(report.issues.numWarnings, 28);
  assert.equal(report.issues.numInfos, 15);
  assert.ok(report.issues.messages.every(({ code }) =>
    [
      'UNSUPPORTED_EXTENSION',
      'VALUE_NOT_IN_LIST',
      'UNUSED_OBJECT',
      'IMAGE_UNRECOGNIZED_FORMAT',
    ].includes(code),
  ));
});
