import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const executablePath = chromium.executablePath();
const executableSha256 = createHash('sha256')
  .update(await readFile(executablePath))
  .digest('hex');
const revision = executablePath.match(/chromium-(\d+)/)?.[1] ?? null;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const gpu = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  const extension = gl?.getExtension('WEBGL_debug_renderer_info');
  return {
    vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : null,
    renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : null,
  };
});
const result = {
  version: browser.version(),
  revision,
  executablePath,
  executableSha256,
  gpu,
};
await browser.close();
process.stdout.write(`${JSON.stringify(result)}\n`);
