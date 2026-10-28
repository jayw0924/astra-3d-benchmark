import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('two-angle group serves four native lossless PNGs without stretching or overflow', async ({ page, request }) => {
  await page.route('**/assets/models/*.glb', (route) => route.abort());
  await page.goto('/');
  const group = page.getByRole('group', { name: 'Two-angle comparison' });
  await expect(group.getByRole('img')).toHaveCount(4);
  const inventory = JSON.parse(await readFile('research/runs/2026-10-27-sol-qwen-angle-comparison/image-inventory.json', 'utf8'));
  for (const entry of inventory.images) {
    const url = `/${entry.publicPath.replace(/^public\//, '')}`;
    const img = group.locator(`img[src="${url}"]`);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => [el.naturalWidth, el.naturalHeight])).toEqual(entry.dimensions);
    const rect = await img.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.width / rect!.height).toBeCloseTo(entry.dimensions[0] / entry.dimensions[1], 2);
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expect(group.locator(`a[href="${url}"]`)).toHaveAttribute('download', '');
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    expect(bytes).toEqual(await readFile(entry.archivePath));
    expect(bytes.length).toBe(entry.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);
  }
  await expect(group.getByText(/not evidence of coherent 3D/)).toBeVisible();
  await expect(group.getByText(/The four follow-on conditions are now completed/)).toBeVisible();
});

test('AI imagery serves exact archived PNGs at native aspect ratios', async ({ page, request }) => {
  await page.route('**/assets/models/*.glb', (route) => route.abort());
  await page.goto('/');
  const section = page.getByRole('region', { name: 'AI-enhanced imagery' });
  await expect(section).toBeVisible({ timeout: 5000 });
  const pairs = [
    ['Original Carmine viewer input', 'after-Carmine-side.png', 850, 778],
    ['First Qwen Image 2.1 interpretation', 'Qwen_image_2.1_00001.png', 864, 768],
    ['Qwen interpretation · seed 42', 'Qwen_image_2.1_seed42.png', 864, 768],
    ['Qwen interpretation · seed 12345', 'Qwen_image_2.1_seed12345.png', 864, 768],
  ] as const;
  await expect(section.getByRole('group', { name: 'Side-view seed variation' }).getByRole('img')).toHaveCount(4);
  await expect(section.getByRole('link', { name: 'Download seed 42 PNG' })).toHaveAttribute('href', '/assets/study/ai-imagery/Qwen_image_2.1_seed42.png');
  const manifest = JSON.parse(await readFile('research/asset-manifest.json', 'utf8'));
  for (const [label, file, width, height] of pairs) {
    const image = section.getByRole('group', { name: 'Side-view seed variation' }).getByRole('img', { name: label, exact: true });
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => [node.naturalWidth, node.naturalHeight])).toEqual([width, height]);
    const displayed = await image.evaluate((node) => { const rect = node.getBoundingClientRect(); return [rect.width, rect.height]; });
    expect(displayed[0] / displayed[1]).toBeCloseTo(width / height, 2);
    const relative = `assets/study/ai-imagery/${file}`;
    const response = await request.get(`/${relative}`);
    expect(response.ok()).toBe(true);
    const body = await response.body();
    const archive = file.includes('seed42') ? `followup-seed42/${file}` : file.includes('seed12345') ? `followup-seed12345/${file}` : file;
    expect(body).toEqual(await readFile(`research/runs/2026-10-27-sol-qwen-imagery/${archive}`));
    const asset = manifest.assets.find((entry: { localPath: string }) => entry.localPath === `public/${relative}`);
    expect(body.byteLength).toBe(asset.bytes);
    expect(createHash('sha256').update(body).digest('hex')).toBe(asset.sha256);
  }
  await expect(section.getByText(/not an aligned pixel comparison/)).toBeVisible();
  await expect(section.getByText(/Two additional successful outputs/)).toBeVisible();
  await section.getByText('Technical settings, cloud failure and provenance limits').click();
  await expect(section.getByText(/AttributeError.*memfd_create/)).toBeVisible();
});
