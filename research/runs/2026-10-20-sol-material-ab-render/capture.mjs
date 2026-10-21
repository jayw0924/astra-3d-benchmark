import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { buildRenderPlan, candidates } from './render-plan.mjs';
import { assertIdentityFreeText } from './blind-handoff.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const renderedDir = path.join(here, 'rendered');
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

for (const candidate of candidates) {
  const file = path.join(root, candidate.url.replace(/^\//, ''));
  const bytes = await readFile(file);
  if (bytes.length !== candidate.bytes || hash(bytes) !== candidate.sha256) {
    throw new Error(`Candidate pin mismatch: ${candidate.id}`);
  }
}

await mkdir(renderedDir, { recursive: true });
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
const repairCloseups = process.argv.includes('--repair-closeups');
const metricsOnly = process.argv.includes('--metrics-only');
if (repairCloseups && metricsOnly) throw new Error('Capture modes are mutually exclusive');
const fullPlan = buildRenderPlan();
const plan = repairCloseups
  ? fullPlan.filter(({ kind }) => kind === 'closeup')
  : fullPlan;
const previousManifest = repairCloseups || metricsOnly
  ? JSON.parse(await readFile(path.join(here, 'render-manifest.json'), 'utf8'))
  : { images: [] };
const manifest = metricsOnly
  ? [...previousManifest.images]
  : previousManifest.images.filter(({ kind }) => kind !== 'closeup');
const previousMetrics = repairCloseups
  ? JSON.parse(await readFile(path.join(here, 'metrics.json'), 'utf8'))
  : { measurements: [] };
const metrics = [...previousMetrics.measurements];
const errors = [];

try {
  for (const candidate of plan.filter((item, index, all) =>
    all.findIndex((other) =>
      other.label === item.label && other.lighting === item.lighting,
    ) === index,
  )) {
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${candidate.label}/${candidate.lighting}: ${error.message}`));
    page.on('requestfailed', (request) => errors.push(`${candidate.label}/${candidate.lighting}: ${request.method()} ${request.url()}`));
    const query = new URLSearchParams({
      model: candidate.candidate.url,
      variant: candidate.candidate.variant,
      lighting: candidate.lighting,
    });
    await page.goto(`${baseUrl}research/runs/2026-10-20-sol-material-ab-render/render-page.html?${query}`);
    await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, { timeout: 180_000 });
    if (!repairCloseups) {
      metrics.push({
        label: candidate.label,
        candidateId: candidate.candidate.id,
        candidateSha256: candidate.candidate.sha256,
        ...(await page.evaluate(() => window.__renderHarness.metrics)),
      });
    }

    const items = metricsOnly
      ? []
      : plan.filter((item) =>
          item.label === candidate.label && item.lighting === candidate.lighting,
        );
    for (const item of items) {
      await page.evaluate(
        ({ view, kind }) => window.__renderHarness.renderView(view, kind),
        { view: item.view, kind: item.kind },
      );
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const captureCanvas = () => page.evaluate(() => document.querySelector('#render').toDataURL('image/png'));
      const firstDataUrl = await captureCanvas();
      const secondDataUrl = await captureCanvas();
      const first = Buffer.from(firstDataUrl.slice(firstDataUrl.indexOf(',') + 1), 'base64');
      const second = Buffer.from(secondDataUrl.slice(secondDataUrl.indexOf(',') + 1), 'base64');
      if (!first.equals(second)) throw new Error(`Non-deterministic screenshot bytes: ${item.filename}`);
      const target = path.join(renderedDir, item.filename);
      await atomicWrite(target, first);
      manifest.push({
        label: item.label,
        kind: item.kind,
        lighting: item.lighting,
        view: item.view,
        path: relative(target),
        bytes: first.length,
        sha256: hash(first),
        repeatReadbackIdentical: true,
        width: 600,
        height: 400,
      });
    }
    await page.evaluate(() => window.__renderHarness.dispose());
    await page.close();
  }
} finally {
  await context.close();
  await browser.close();
  await server.close();
}

if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);

const planOrder = new Map(fullPlan.map(({ filename }, index) => [filename, index]));
manifest.sort((left, right) =>
  planOrder.get(path.basename(left.path)) - planOrder.get(path.basename(right.path)),
);

const reveal = buildRenderPlan()
  .filter((item, index, all) => all.findIndex((other) => other.label === item.label) === index)
  .map(({ label, candidate }) => ({
    label,
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateSha256: candidate.sha256,
  }));

const galleryGroups = [...new Set(manifest.map(({ kind, lighting, view }) => `${kind}|${lighting}|${view}`))];
const gallery = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blind material A/B review</title><style>
:root{color-scheme:light}body{font-family:system-ui,sans-serif;margin:24px;color:#242424;background:#f2f1ed}h1{margin-bottom:4px}.note{color:#555;max-width:78ch}.group{margin:32px 0}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{background:white;border:1px solid #c9c7c0;border-radius:12px;padding:12px}.card h3{margin:0 0 8px}.card img{display:block;width:100%;height:auto;border-radius:6px}@media(max-width:800px){.pair{grid-template-columns:1fr}}
</style></head><body><h1>Blind material A/B review</h1><p class="note">Candidate identities are intentionally withheld. Compare paint response, panel separation, highlight behavior, and close-up coherence. Images in each pair use identical model geometry, camera logic, lighting, exposure, tone mapping, resolution, and browser renderer.</p>
${galleryGroups.map((group) => {
  const [kind, lighting, view] = group.split('|');
  const images = manifest.filter((item) => item.kind === kind && item.lighting === lighting && item.view === view);
  const title = kind === 'closeup' ? `Neutral close-up · ${view}` : `${lighting === 'viewer' ? 'Current viewer lighting' : 'Neutral environment'} · ${view}`;
  return `<section class="group"><h2>${title}</h2><div class="pair">${images.map((image) => `<article class="card"><h3>Candidate ${image.label}</h3><img src="${path.relative(here, path.join(root, image.path)).split(path.sep).join('/')}" alt="Candidate ${image.label}, ${title}"></article>`).join('')}</div></section>`;
}).join('\n')}
</body></html>\n`;
assertIdentityFreeText(gallery);

await atomicWrite(path.join(here, 'render-manifest.json'), `${JSON.stringify({ protocolVersion: 1, images: manifest }, null, 2)}\n`);
await atomicWrite(path.join(here, 'metrics.json'), `${JSON.stringify({ protocolVersion: 1, measurements: metrics }, null, 2)}\n`);
await atomicWrite(path.join(here, 'reveal.json'), `${JSON.stringify({ protocolVersion: 1, mapping: reveal }, null, 2)}\n`);
const blindDirectory = path.join(here, 'blind');
const blindRenderedDirectory = path.join(blindDirectory, 'rendered');
await mkdir(blindRenderedDirectory, { recursive: true });
await atomicWrite(path.join(blindDirectory, 'index.html'), gallery);
for (const image of manifest) {
  await atomicWrite(
    path.join(blindRenderedDirectory, path.basename(image.path)),
    await readFile(path.join(root, image.path)),
  );
}
const action = metricsOnly
  ? 'Refreshed cold metrics; retained'
  : repairCloseups
    ? 'Repaired close-ups; retained'
    : 'Captured';
console.log(`${action} ${manifest.length} controlled blind renders across ${metrics.length} candidate/lighting sessions`);
