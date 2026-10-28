import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Content/interaction checks only: do not spend a software-renderer run on this page edit.
test('workflow explanation and six-stage index remain readable and linked', async ({ page }) => {
  await page.route('**/assets/models/*.glb', (route) => route.abort());
  await page.goto('/');
  const workflow = page.getByRole('group', { name: 'How the image was made' });
  await workflow.scrollIntoViewIfNeeded();
  await expect(workflow).toBeVisible();
  await expect(workflow).toContainText('one existing image-edit template');
  await expect(workflow).toContainText('prompt refinement off');
  await expect(workflow).toContainText('not five independently designed workflows');
  const image = workflow.getByRole('img', { name: 'Actual Comfy Cloud rear three-quarter workflow: load image, Qwen edit, save and compare' });
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((node: HTMLImageElement) => node.decode());
  expect(await image.evaluate((node: HTMLImageElement) => [node.naturalWidth, node.naturalHeight])).toEqual([2400, 1200]);
  const native = workflow.getByRole('link', { name: 'Open native workflow screenshot (2400 × 1200)' });
  const href = await native.getAttribute('href');
  expect(href).toBe('/assets/study/ai-imagery/workflow/comfy-cloud-rear-workflow.png');
  await expect(image.locator('..')).toHaveAttribute('href', href!);
  const response = await page.request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  const body = await response.body();
  expect(createHash('sha256').update(body).digest('hex')).toBe('c0917674942eee257e079beb3ce7729b747c8ea43cb9c3d55e2bda569dea388e');
  expect(body.equals(readFileSync('public' + href))).toBe(true);
  const bounds = await image.boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(bounds!.width / bounds!.height).toBeCloseTo(2, 1);
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  await image.scrollIntoViewIfNeeded();
  await image.locator('..').locator('..').screenshot({ path: `${process.env.WORKFLOW_EVIDENCE_DIR ?? test.info().outputDir}/screenshot-${process.env.BASE_URL ? 'production-' : ''}${test.info().project.name}.png` });
  const technical = page.locator('details').filter({ has: page.getByText('Technical settings, cloud failure and provenance limits', { exact: true }) });
  await expect(technical).not.toHaveAttribute('open');
  await technical.locator('summary').click();
  await expect(technical).toContainText('memfd_create');
  await expect(technical.locator('p').first()).toBeVisible();
  const index = page.getByRole('group', { name: 'Study-wide workflow index' });
  await index.scrollIntoViewIfNeeded();
  await expect(index.getByRole('listitem')).toHaveCount(6);
  for (const stage of await index.getByRole('listitem').all()) {
    const details = stage.locator('details');
    await expect(details).not.toHaveAttribute('open');
    await details.locator('summary').click();
    await expect(stage.getByText('Input → output', { exact: true })).toBeVisible();
    await expect(stage.getByText('Tools & roles', { exact: true })).toBeVisible();
    const link = stage.getByRole('link');
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^#/);
    await expect(page.locator(href!)).toHaveCount(1);
    await details.locator('summary').click();
  }
  await index.getByRole('link', { name: 'Image workflow & limits' }).click();
  await expect(page).toHaveURL(/#image-workflow-title$/);
  await expect(workflow.getByRole('heading')).toBeInViewport();
  for (const block of [workflow, index]) {
    const bounds = await block.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(await block.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
