import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('release images and licenses retain exact bytes and native dimensions', async ({ page, request }) => {
  // No GLB load or heavy shader/control matrix for this public-copy check.
  await page.route('**/assets/models/*.glb', (route) => route.abort());
  await page.goto('/');
  const historical = page.locator('.historical-material-evidence img');
  await expect(historical).toHaveCount(3);
  for (const image of await historical.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth === 600 && node.naturalHeight === 400)).toBe(true);
  }
  const preview = page.getByRole('img', { name: 'Pre-ground-correction refined viewer: Estuary Enamel' });
  await expect(page.getByText(/This retained preview predates the ground-contact correction/)).toBeVisible();
  await preview.scrollIntoViewIfNeeded();
  await expect.poll(() => preview.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth === 850 && node.naturalHeight === 778)).toBe(true);
  expect(await preview.evaluate((node) => getComputedStyle(node).aspectRatio)).toBe('850 / 778');
  const response = await request.get('/assets/viewer/refined-estuary-native.png');
  expect(response.ok()).toBe(true);
  const body = await response.body();
  expect(body.byteLength).toBe(244385);
  expect(createHash('sha256').update(body).digest('hex')).toBe('81679125d519c638705adbf02d860da1f1fbc1c0bb56d979bdffbed48f0991f6');
  for (const name of ['Basis-Universal-APACHE-2.0.txt', 'Basis-Universal-NOTICE.md']) {
    const link = page.locator(`.credits-section a[href="/licenses/${name}"]`);
    await expect(link).toHaveCount(1);
    const licenseResponse = await request.get(`/licenses/${name}`);
    expect(licenseResponse.ok()).toBe(true);
    expect(await licenseResponse.body()).toEqual(await readFile(`licenses/upstream/${name}`));
  }
});
