import path from 'node:path';
import process from 'node:process';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';

async function main() {
  const [inputArg, outputArg, ...nodeNames] = process.argv.slice(2);
  if (!inputArg || !outputArg || nodeNames.length === 0) {
    throw new Error(
      'Usage: node scripts/sanitize-model.mjs <input.glb> <output.glb> <node-name> [...]',
    );
  }

  const input = path.resolve(inputArg);
  const output = path.resolve(outputArg);
  if (input === output) {
    throw new Error('Input and output paths must differ');
  }

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(input);
  const targets = new Set(nodeNames);
  const removed = [];
  for (const node of document.getRoot().listNodes()) {
    if (!targets.has(node.getName())) continue;
    removed.push(node.getName());
    node.dispose();
  }
  const missing = nodeNames.filter((name) => !removed.includes(name));
  if (missing.length > 0) {
    throw new Error(`Required node not found: ${missing.join(', ')}`);
  }

  await document.transform(prune());
  await io.write(output, document);
  console.log(`Removed ${removed.join(', ')} and wrote ${output}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
