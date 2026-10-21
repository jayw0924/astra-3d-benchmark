import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArguments(argv) {
  const id = argv[0];
  if (!id) throw new Error('Usage: fetch-asset.mjs <asset-id> [--root <path>]');
  const rootIndex = argv.indexOf('--root');
  const root = rootIndex >= 0 ? path.resolve(argv[rootIndex + 1]) : process.cwd();
  return { id, root };
}

function safeProjectPath(root, relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  const relative = path.relative(root, absolutePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Asset path escapes project root: ${relativePath}`);
  }
  return absolutePath;
}

async function main() {
  const { id, root } = parseArguments(process.argv.slice(2));
  const manifest = JSON.parse(
    await readFile(path.join(root, 'research', 'asset-manifest.json'), 'utf8'),
  );
  const asset = manifest.assets.find((candidate) => candidate.id === id);
  if (!asset) throw new Error(`Unknown asset id: ${id}`);

  const destination = safeProjectPath(root, asset.localPath);
  const response = await fetch(asset.immutableUrl, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${asset.immutableUrl}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== asset.sha256) {
    throw new Error(`SHA-256 mismatch for ${id}: expected ${asset.sha256}, got ${hash}`);
  }
  if (bytes.length !== asset.bytes) {
    throw new Error(`Byte count mismatch for ${id}: expected ${asset.bytes}, got ${bytes.length}`);
  }

  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp-${process.pid}`;
  try {
    await writeFile(temporary, bytes, { flag: 'wx' });
    await rename(temporary, destination);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`Fetched ${id}: ${bytes.length} bytes, sha256 ${hash}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
