import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

// CPU-only browser smoke coverage at DPR 1; not real-device quality certification.
test.use({ deviceScaleFactor: 1, launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

test('loads the real configurator and changes product options', async ({ page }) => {
  // SwiftShader compiles the four supplied material variants on this CPU.
  test.setTimeout(600_000);
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const modelResponse = page.waitForResponse((response) =>
    response.url().endsWith('/assets/models/product-estuary-safe.glb'),
    { timeout: 30_000 },
  );
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push(`${request.method()} ${request.url()}`),
  );

  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Astra 3D benchmark' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('3D model ready');

  const renderImages = page.locator('.output-overview .render-card img');
  await expect(renderImages).toHaveCount(3);
  await expect.poll(() => renderImages.evaluateAll((images) =>
    images.every((image) => {
      const element = image as HTMLImageElement;
      return element.complete && element.naturalWidth === 600 && element.naturalHeight === 400;
    }),
  )).toBe(true);

  const servedModel = await (await modelResponse).body();
  expect(servedModel.byteLength).toBe(9_239_404);
  expect(createHash('sha256').update(servedModel).digest('hex')).toBe(
    '01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4',
  );

  const canvas = page.getByTestId('configurator-canvas');
  await canvas.scrollIntoViewIfNeeded();
  for (const finish of ['Pearly Swirly', 'Torched Graphite', 'Estuary Enamel', 'Carmine Candy']) {
    await page.getByRole('radio', { name: finish }).evaluate((element: HTMLInputElement) => element.click());
    await expect(page.getByRole('radio', { name: finish })).toBeChecked();
    expect(new URL(page.url()).searchParams.get('finish')).toBe(finish);
    await expect(page.getByRole('status')).toHaveText('3D model ready');
  }
  for (const trim of ['Dark alloy', 'Bright alloy']) {
    await page.getByRole('radio', { name: trim }).evaluate((element: HTMLInputElement) => element.click());
    await expect(page.getByRole('radio', { name: trim })).toBeChecked();
    expect(new URL(page.url()).searchParams.get('trim')).toBe(trim === 'Dark alloy' ? 'dark' : 'bright');
    await expect(page.getByRole('status')).toHaveText('3D model ready');
  }
  for (const name of ['Rotate left', 'Rotate right', 'Zoom in', 'Zoom out']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('3D model ready');
  }
  await page.getByRole('radio', { name: 'Estuary Enamel' }).evaluate((element: HTMLInputElement) => element.click());
  await page.getByRole('radio', { name: 'Dark alloy' }).evaluate((element: HTMLInputElement) => element.click());
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('3D model ready');
  await expect(page.getByRole('radio', { name: 'Estuary Enamel' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Dark alloy' })).toBeChecked();
  await page.getByRole('button', { name: 'Reset configuration' }).click();
  await expect(page.getByRole('radio', { name: 'Carmine Candy' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Bright alloy' })).toBeChecked();
  expect(new URL(page.url()).searchParams.get('finish')).toBe('Carmine Candy');
  expect(new URL(page.url()).searchParams.get('trim')).toBe('bright');

  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('publishes decoded and hash-pinned geometry baseline images', async ({
  page,
  request,
}) => {
  await page.route('**/assets/models/product-estuary-safe.glb', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('The 3D model could not be loaded.');
  const geometryHeading = page.getByRole('heading', {
    level: 2,
    name: 'Geometry baseline',
  });
  await geometryHeading.scrollIntoViewIfNeeded();
  const geometryImages = page.locator('.geometry-card img');
  await expect(geometryImages).toHaveCount(4);
  for (let index = 0; index < await geometryImages.count(); index += 1) {
    await geometryImages.nth(index).scrollIntoViewIfNeeded();
  }
  await expect.poll(() => geometryImages.evaluateAll((images) =>
    images.every((image) => {
      const element = image as HTMLImageElement;
      return element.complete && element.naturalWidth === 600 && element.naturalHeight === 400;
    }),
  )).toBe(true);

  const safeImages = page.locator('.safe-evidence img');
  await expect(safeImages).toHaveCount(3);
  for (const image of await safeImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
      element.complete && element.naturalWidth === 600 && element.naturalHeight === 400,
    )).toBe(true);
  }
  const geometryAssets = [
    ['/assets/study/safe-final/before.png', 75_699, '6b748ef8e875704bde56cf16545efa5b33b36835c7df6e6c99c769b52dcd496d'],
    ['/assets/study/safe-final/first-attempt.png', 76_129, '1a5ab1341e01cbf4e6f5b59903101d37d87a784c67cc6abad03b97fd9cad5f73'],
    ['/assets/study/safe-final/final.png', 75_891, '71a74ec13bd2edb6594fddfbf9d0a190099b67328de1ff21025812b086d43f97'],
    ['/assets/study/geometry/source-overview.png', 79_868, '03330450dab91f75c6550a64269c87ed9de971a2c3abb381007f2251df414390'],
    ['/assets/study/geometry/sanitized-overview.png', 79_858, '28499daab9e14aff456c5046c68b1ce8638ce3f486f08935920afcf44db2da9b'],
    ['/assets/study/geometry/estuary-overview.png', 75_800, 'bc5d48be4b185f88d3637322ab12e08c10024bc9367931b3b6838a8963fbe183'],
    ['/assets/study/geometry/wireframe-wheel-detail.png', 43_450, '37b657b4bb86d9987369b53d649a9d7a46c8a0550153a98673f3eb48f8f07a79'],
  ] as const;
  for (const [url, bytes, sha256] of geometryAssets) {
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    const body = await response.body();
    expect(body.byteLength).toBe(bytes);
    expect(createHash('sha256').update(body).digest('hex')).toBe(sha256);
  }
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
