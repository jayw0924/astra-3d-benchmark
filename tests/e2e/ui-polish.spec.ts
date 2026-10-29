import { expect, test } from '@playwright/test';

// UI-only acceptance: abort the unchanged model, not a renderer-health test.
for (const width of [390, 320, 1365]) {
  test(`hero content fits without overflow masking at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/assets/models/*.glb', (route) => route.abort());
    await page.goto('/');
    await expect(page).toHaveTitle('AI-assisted 3D Workflow Lab · CarConcept');
    const hero = page.locator('.hero');
    expect(await hero.evaluate((node) => {
      const viewport = window.innerWidth;
      return Array.from(node.querySelectorAll('*')).filter((child) => {
        const box = child.getBoundingClientRect();
        return box.width && (box.left < -1 || box.right > viewport + 1 || child.scrollWidth > child.clientWidth + 1);
      }).map((child) => child.tagName + '.' + child.className);
    })).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('main').evaluate((node) => getComputedStyle(node).overflowX)).toBe('visible');
  });

  test(`section navigation, findings and disclosure work by keyboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/assets/models/*.glb', (route) => route.abort());
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Study navigation' });
    const links = nav.getByRole('link');
    const targets = ['#geometry', '#configurator', '#ai-imagery', '#workflow-index-title', '#methods', '#evidence'];
    await page.getByRole('link', { name: 'AI-assisted 3D Workflow Lab home' }).focus();
    for (let i = 0; i < targets.length; i++) {
      await page.keyboard.press('Tab');
      await expect(links.nth(i)).toBeFocused();
      await expect(links.nth(i)).toBeInViewport();
      expect(await links.nth(i).evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    }
    for (let i = 0; i < targets.length; i++) {
      await links.nth(i).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp(targets[i] + '$'));
      await expect(page.locator(targets[i])).toBeInViewport();
    }
    const findings = page.getByRole('region', { name: 'What we learned' });
    for (const link of await findings.getByRole('link').all()) {
      const href = await link.getAttribute('href');
      await expect(page.locator(href!)).toHaveCount(1);
    }
    const angle = page.getByText('Angle settings & source verification', { exact: true });
    const details = angle.locator('..');
    await expect(details).not.toHaveAttribute('open');
    await angle.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open');
    await expect(details.locator('p')).toBeVisible();
    await expect(details).toContainText('25 steps, CFG 1');
    await page.keyboard.press('Enter');
    await expect(details).not.toHaveAttribute('open');
    const repeat = page.getByRole('group', { name: 'Original-seed repeatability' });
    await expect(repeat.getByText(/fresh sampling versus Comfy cache reuse is unknown/)).toBeVisible();
    if (width !== 320) {
      const dir = 'work/ui-polish/screenshots';
      await page.goto('/');
      await page.screenshot({ path: `${dir}/${width}-hero.png` });
      for (const [name, locator] of [
        ['findings', findings],
        ['location', page.getByRole('group', { name: 'Location interpretation and original source' })],
        ['protected', page.getByRole('group', { name: 'Protected product comparison' })],
        ['workflow', page.getByRole('group', { name: 'Study-wide workflow index' })],
      ] as const) {
        await locator.scrollIntoViewIfNeeded();
        // Hide only the sticky header for tall element captures, avoiding capture-overlay artifacts.
        await locator.screenshot({ path: `${dir}/${width}-${name}.png`, style: '.site-header { visibility: hidden !important; }' });
      }
    }
    await page.locator('details').evaluateAll((nodes) => nodes.forEach((node) => { node.setAttribute('open', ''); }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
