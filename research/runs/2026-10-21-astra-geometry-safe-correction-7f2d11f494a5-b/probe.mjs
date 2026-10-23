import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const run='research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page=await browser.newPage({viewport:{width:600,height:400},deviceScaleFactor:1}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:8765/${run}/page.html?model=/public/assets/models/product-estuary.glb`);
await page.waitForFunction(()=>document.body.dataset.ready==='true',null,{timeout:180000});
const points={wipers:[[65,282],[86,313],[160,350],[202,369],[280,336],[342,305],[90,250],[200,330],[400,290],[547,237]],'glass-edge':[[24,324],[46,352],[90,371],[143,357],[338,111],[371,137],[427,149],[492,153],[438,302],[409,312],[302,333]]};
const results={};for(const [target,pixels] of Object.entries(points)) results[target]=await page.evaluate(({target,pixels})=>window.harness.probe(target,pixels),{target,pixels});
const data={browser:browser.version(),gpu:await page.evaluate(()=>window.harness.metrics.gpu),errors,results};writeFileSync(`${run}/source-pixel-probe.json`,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({browser:data.browser,errors,nearest:Object.fromEntries(Object.entries(results).map(([k,v])=>[k,v.map(x=>({pixel:x.pixel,hit:x.hits[0]}))]))},null,2));
}finally{await browser.close();}
