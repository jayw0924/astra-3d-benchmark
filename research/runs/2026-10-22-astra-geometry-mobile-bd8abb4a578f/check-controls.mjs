import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const run='research/runs/2026-10-22-astra-geometry-mobile-bd8abb4a578f',accepted='research/runs/2026-10-22-sol-safe-final-comparison';
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(readFileSync(`${run}/capture-manifest.json`)),records=[];
for(const im of manifest.images.filter(i=>i.model==='control')){const a=readFileSync(`${run}/${im.path}`),b=readFileSync(`${accepted}/${im.path}`);assert(a.equals(b),im.id);records.push({id:im.id,sha256:hash(a),acceptedSha256:hash(b),exact:true});}
assert.equal(records.length,54);assert.equal(manifest.errors.length,0);
writeFileSync(`${run}/control-replay.json`,JSON.stringify({allPassed:true,checkedAt:new Date().toISOString(),count:records.length,records},null,2)+'\n',{flag:'wx'});
const exe=chromium.executablePath();const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
writeFileSync(`${run}/browser-environment.json`,JSON.stringify({capturedAt:new Date().toISOString(),version:browser.version(),executable:exe,executableSha256:hash(readFileSync(exe)),headless:true,viewport:[600,400],dpr:1},null,2)+'\n',{flag:'wx'});await browser.close();console.log('All 54 fresh control PNGs match accepted controls byte-for-byte.');
