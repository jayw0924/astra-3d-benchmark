import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const out = new URL('./', import.meta.url);
// Archived capture procedure: never mislabel the now-integrated app as original.
const baseline=JSON.parse(await readFile(new URL('inventory.json',out),'utf8'));
const source=await readFile('src/lib/threeViewer.ts');
if(createHash('sha256').update(source).digest('hex')!==baseline.files['src/lib/threeViewer.ts']) throw Error('Before capture requires the exact pre-integration viewer source; evidence is already retained.');
const browser = await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const records=[];
try {
 for (const [layout,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:393,height:851}]]) {
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  await page.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = cb => window.setTimeout(() => raf(cb), 200); });
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('status').filter({hasText:'3D model ready'}).waitFor({timeout:180000});
  const canvas=page.getByTestId('configurator-canvas'); await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const image=await page.screenshot({clip:await canvas.boundingBox(),path:new URL(`before-original-${layout}-native.png`,out).pathname,timeout:120000});
  records.push({layout,viewport,dpr:1,recipe:'original',camera:'unmodified application default',sha256:createHash('sha256').update(image).digest('hex'),errors});
  await page.screenshot({path:new URL(`before-original-${layout}-page.png`,out).pathname,timeout:120000});
  await page.close();
 }
} finally {await browser.close(); await writeFile(new URL('before-captures.json',out),JSON.stringify(records,null,2));}
