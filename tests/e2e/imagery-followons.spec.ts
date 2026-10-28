import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const base = 'research/runs/2026-10-28-sol-imagery-followons';
const assets = JSON.parse(readFileSync(`${base}/public-assets.json`, 'utf8')) as { publicPath: string; sha256: string; bytes: number; dimensions: number[] }[];
test('completed imagery native assets, paired location hero and retained evidence render without GLB loading', async ({ page }) => {
  await page.route('**/assets/models/*.glb', (route) => route.abort());
  await page.goto('/');
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  const report = page.getByRole('region', { name: 'AI-enhanced imagery' });
  const hero = report.getByRole('group', { name: 'Location interpretation and original source' });
  await hero.scrollIntoViewIfNeeded();
  await expect(hero.getByRole('img')).toHaveCount(2);
  await expect(hero).toContainText('visual approval, not technical fidelity');
  for (const group of ['Protected product comparison', 'Second model comparison', 'Original-seed repeatability']) {
    await expect(report.getByRole('group', { name: group })).toBeVisible();
  }
  for (const details of await report.locator('details').all()) {
    await details.evaluate((node) => { (node as HTMLDetailsElement).open = true; });
  }
  await expect(report.getByRole('img')).toHaveCount(21);
  for (const image of await report.getByRole('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((node: HTMLImageElement) => node.decode());
    expect(await image.evaluate((node: HTMLImageElement) => [node.naturalWidth, node.naturalHeight])).toEqual([Number(await image.getAttribute('width')), Number(await image.getAttribute('height'))]);
    const bounds = (await image.boundingBox())!;
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    const [width, height] = await image.evaluate((node: HTMLImageElement) => [node.naturalWidth, node.naturalHeight]);
    expect(bounds.width / bounds.height).toBeCloseTo(width / height, 2);
  }
  for (const item of assets) {
    const url = '/' + item.publicPath.replace(/^public\//, '');
    const response = await page.request.get(url);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    const bytes = await response.body();
    expect(bytes.length).toBe(item.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(item.sha256);
  }
  await expect(report.getByRole('group', { name: 'Side-view seed variation' }).getByRole('img')).toHaveCount(4);
  await expect(report.getByRole('group', { name: 'Two-angle comparison' }).getByRole('img')).toHaveCount(4);
  const index = page.getByRole('group', { name: 'Study-wide workflow index' });
  await expect(index).toContainText('Four follow-ons completed');
  await expect(index).not.toContainText('Planned / not performed');
  for (const link of await index.getByRole('link').all()) {
    const href = await link.getAttribute('href');
    await expect(page.locator(href!)).toHaveCount(1);
  }
  await expect(page.getByRole('img', { name: 'Pre-ground-correction refined viewer: Estuary Enamel' })).toHaveAttribute('src', '/assets/viewer/refined-estuary-native.png');
  for (const details of await report.locator('details').all()) await details.evaluate((node) => { (node as HTMLDetailsElement).open = false; });
  await hero.scrollIntoViewIfNeeded();
  expect(await hero.locator('figcaption').first().evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(140);
  await hero.screenshot({ path: `${base}/finalization/capture02/location-${test.info().project.name}.png`, style: '.site-header { visibility: hidden !important; }' });
  const protectedResult = report.getByRole('group', { name: 'Protected product comparison' });
  await protectedResult.screenshot({ path: `${base}/finalization/capture02/protected-${test.info().project.name}.png`, style: '.site-header { visibility: hidden !important; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
