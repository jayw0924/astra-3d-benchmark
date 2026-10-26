// One-shot, bounded correction: preserve rejected shadows, keep all unaffected frames.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('./',import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex');
const prior=JSON.parse(await readFile(new URL('attempts/grounded-v1/capture-manifest-last.json',dir)));
const retained=prior.images.filter(x=>x.rig!=='grounded-studio');if(retained.length!==48)throw Error('need 48 retained');
for(const im of retained)if(hash(await readFile(new URL(im.path,dir)))!==im.sha256)throw Error('retained hash');
const currentSource=await readFile('src/lib/viewerLighting.ts');const sourcePin=hash(currentSource);
const repair={reason:'Native review: default-radius PCF cast shadow too hard/polygonal. Three r186 removed PCFSoftShadowMap. Replace deprecated constant with supported PCFShadowMap, radius6, opacity0.18. No light/camera/material/environment changes.',retainedCount:48,rejectedCount:prior.images.length-48,rejectedIds:prior.images.filter(x=>x.rig==='grounded-studio').map(x=>x.id),oldPins:prior.pins,newLightingSourceHash:sourcePin,parityRequired:['original-0-front-three-quarter','environment-only-0-front-three-quarter'],scope:'Parity probes establish these exact two frames only; static diff limits changed behavior to grounded shadows.'};
await writeFile(new URL('shadow-repair.json',dir),JSON.stringify(repair,null,2)+'\n',{flag:'wx'});
prior.images=retained;prior.pins['src/lib/viewerLighting.ts']=sourcePin;prior.actual=48;prior.repair='shadow-repair.json';
await writeFile(new URL('capture-manifest.json',dir),JSON.stringify(prior,null,2)+'\n');
console.log(JSON.stringify({retained:48,rejected:repair.rejectedCount}));
