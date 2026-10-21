import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

test('loads the real configurator and changes product options', async ({ page }) => {
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const modelResponse = page.waitForResponse((response) =>
    response.url().endsWith('/assets/models/product-estuary.glb'),
  );
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push(`${request.method()} ${request.url()}`),
  );

  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Astra 3D benchmark' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('3D model ready');

  const renderImages = page.locator('.render-card img');
  await expect(renderImages).toHaveCount(3);
  await expect.poll(() => renderImages.evaluateAll((images) =>
    images.every((image) => {
      const element = image as HTMLImageElement;
      return element.complete && element.naturalWidth === 600 && element.naturalHeight === 400;
    }),
  )).toBe(true);

  const servedModel = await (await modelResponse).body();
  expect(servedModel.byteLength).toBe(10_191_496);
  expect(createHash('sha256').update(servedModel).digest('hex')).toBe(
    'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f',
  );

  await page
    .getByRole('radio', { name: 'Estuary Enamel' })
    .evaluate((element: HTMLInputElement) => element.click());
  await expect(
    page.getByRole('radio', { name: 'Estuary Enamel' }),
  ).toBeChecked();

  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('keeps the mobile page within the viewport and labels streaming honestly', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-only assertion');
  await page.goto('/');
  await expect(page.getByText('Deferred — not implemented')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
