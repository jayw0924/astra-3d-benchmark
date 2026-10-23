"""Adapt disclosed scripts inside this run only; refuse overwrite."""
from pathlib import Path
import json,hashlib
run=Path(__file__).parent
prior=Path('research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92')
sol=Path('research/runs/2026-10-22-sol-safe-final-comparison')
protected=[1,2,3,4,30,33,34,35,36,37,38,40,41,42,43,45,50,51,52,53,54,69,70,71,72,73,87,89,91,93]
reused=[]
def put(n,text,source):
 with (run/n).open('x') as f:f.write(text)
 reused.append({'output':n,'source':str(source),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'exactCopy':text==source.read_text()})
s=(prior/'transform.mjs').read_text().replace(str(prior),str(run))
s=s.replace('const protectedMeshes=[1,2,4,30,38,40,41,42,43];','const protectedMeshes='+json.dumps(protected)+';')
start=s.index('const protectedNames=');end=s.index('\n',start)
s=s[:start]+s[end:]
old="const protectedRecords=protectedMeshes.map((mi,i)=>{assert.equal(meshes[mi].listPrimitives().length,1);assert(doc.getRoot().listNodes().some(n=>n.getMesh()===meshes[mi]&&n.getName()===protectedNames[i]));return {mesh:mi,primitive:0,nodeName:protectedNames[i],before:snapshot(meshes[mi].listPrimitives()[0])};});"
new="const protectedRecords=protectedMeshes.flatMap(mi=>meshes[mi].listPrimitives().map((p,pi)=>({mesh:mi,primitive:pi,nodeNames:doc.getRoot().listNodes().filter(n=>n.getMesh()===meshes[mi]).map(n=>n.getName()),before:snapshot(p)})));"
assert old in s;s=s.replace(old,new).replace('meshes[r.mesh].listPrimitives()[0]','meshes[r.mesh].listPrimitives()[r.primitive]')
s=s.replace('ratio:0.80,error:0.0001','ratio:[88,90,92,94].includes(mi)?0.65:0.50,error:[88,90,92,94].includes(mi)?0.00005:0.0001')
put('transform.mjs',s,prior/'transform.mjs')
s=(prior/'verify.mjs').read_text().replace(str(prior),str(run)).replace('safe-webgl-final-d0bf6e206c92','mobile-lod-bd8abb4a578f').replace("'safe-webgl'","'mobile-lod'")
s=s.replace("JSON.stringify(data,null,2)+'\\n');","JSON.stringify(data,null,2)+'\\n',{flag:'wx'});")
s=s.replace('[1,2,4,30,38,40,41,42,43]',json.dumps(protected))
s=s.replace("const p=a.json.meshes[mi].primitives[0],q=b.json.meshes[mi].primitives[0];","assert.equal(a.json.meshes[mi].primitives.length,1);const p=a.json.meshes[mi].primitives[0],q=b.json.meshes[mi].primitives[0];")
# This verifier's exact-geometry check is explicitly single-primitive. Source inspection must confirm that invariant.
put('verify.mjs',s,prior/'verify.mjs')
for name in ['page.html','page.js','control-spec.json']:
 put(name,(sol/name).read_text(),sol/name)
s=(sol/'capture.mjs').read_text().replace("await writeFile(path.join(here,filename),b);","await writeFile(path.join(here,filename),b,{flag:'wx'});")
# Plan contains two models and nine targets, three modes and two finishes = 108 images, unchanged.
put('capture.mjs',s,sol/'capture.mjs')
with (run/'reuse-provenance.json').open('x') as f:json.dump(reused,f,indent=2)
print('Prepared isolated scripts, Sol rendering page/settings unchanged.')
