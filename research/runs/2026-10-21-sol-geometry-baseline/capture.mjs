import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { buildGeometryBaselinePlan } from './render-plan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const renderedDirectory = path.join(here, 'rendered');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const relative = (target) => path.relative(root, target).split(path.sep).join('/');

async function atomicWrite(target, contents) {
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, contents, { flag: 'wx' });
  try {
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

const assetManifest = JSON.parse(
  await readFile(path.join(root, 'research', 'asset-manifest.json'), 'utf8'),
);
const assetsById = new Map(assetManifest.assets.map((asset) => [asset.id, asset]));
const plan = buildGeometryBaselinePlan();
for (const item of plan) {
  const asset = assetsById.get(item.assetId);
  if (!asset || asset.status !== 'available') throw new Error(`Unavailable asset: ${item.assetId}`);
  const expectedUrl = asset.localPath.startsWith('public/')
    ? `/${asset.localPath.slice('public/'.length)}`
    : `/${asset.localPath}`;
  if (item.model !== expectedUrl) {
    throw new Error(`Render plan URL does not match manifest asset ${item.assetId}`);
  }
  const assetBytes = await readFile(path.join(root, asset.localPath));
  if (assetBytes.length !== asset.bytes || hash(assetBytes) !== asset.sha256) {
    throw new Error(`Asset pin mismatch: ${item.assetId}`);
  }
}

await rm(renderedDirectory, { recursive: true, force: true });
await mkdir(renderedDirectory, { recursive: true });
const server = await createServer({
  root,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, strictPort: false },
});
await server.listen();
const baseUrl = server.resolvedUrls?.local?.[0];
if (!baseUrl) throw new Error('Vite did not expose a local URL');

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
});
const context = await browser.newContext({
  viewport: { width: 600, height: 400 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const images = [];
const errors = [];

try {
  for (const item of plan) {
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${item.id}: ${error.message}`));
    page.on('requestfailed', (request) =>
      errors.push(`${item.id}: ${request.method()} ${request.url()}`));
    const query = new URLSearchParams({
      model: item.model,
      variant: item.variant,
      mode: item.mode,
      view: item.view,
    });
    await page.goto(
      `${baseUrl}research/runs/2026-10-21-sol-geometry-baseline/render-page.html?${query}`,
    );
    await page.waitForFunction(
      () => document.body.dataset.ready === 'true',
      undefined,
      { timeout: 180_000 },
    );
    const capture = () => page.evaluate(() =>
      document.querySelector('#render').toDataURL('image/png'));
    const firstDataUrl = await capture();
    const secondDataUrl = await capture();
    const first = Buffer.from(firstDataUrl.slice(firstDataUrl.indexOf(',') + 1), 'base64');
    const second = Buffer.from(secondDataUrl.slice(secondDataUrl.indexOf(',') + 1), 'base64');
    if (!first.equals(second)) throw new Error(`Repeated readback differs: ${item.filename}`);
    const target = path.join(renderedDirectory, item.filename);
    await atomicWrite(target, first);
    const metrics = await page.evaluate(() => window.__geometryHarness.metrics);
    if (item.mode === 'wireframe' && metrics.rendererInfo.calls === 0) {
      throw new Error(`Wireframe target did not render: ${item.view}`);
    }
    const asset = assetsById.get(item.assetId);
    images.push({
      id: item.id,
      assetId: item.assetId,
      modelPath: asset.localPath,
      modelBytes: asset.bytes,
      modelSha256: asset.sha256,
      variant: item.variant,
      mode: item.mode,
      view: item.view,
      path: relative(target),
      bytes: first.length,
      sha256: hash(first),
      width: item.width,
      height: item.height,
      repeatReadbackIdentical: true,
      metrics,
    });
    await page.evaluate(() => window.__geometryHarness.dispose());
    await page.close();
  }
} finally {
  await context.close();
  await browser.close();
  await server.close();
}

if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
await atomicWrite(
  path.join(here, 'render-manifest.json'),
  `${JSON.stringify({
    protocolVersion: 1,
    rendererScope: 'Headless Chromium with SwiftShader; compatibility evidence, not production-GPU performance',
    camera: {
      view: 'front-three-quarter',
      position: [6.4, 3.25, 7.2],
      target: [0, 0.55, 0.1],
      fov: 32,
    },
    resolution: { width: 600, height: 400, devicePixelRatio: 1 },
    images,
  }, null, 2)}\n`,
);
console.log(`Captured ${images.length} hash-pinned geometry baseline renders`);
