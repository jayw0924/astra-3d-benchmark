from pathlib import Path
import json,hashlib,copy
p=Path(__file__).resolve().parent;o=p.parent/'2026-10-21-sol-safe-webgl-comparison'
# Initial preparation only. Never reset a completed/checkpointed package.
assert not (p/'capture-manifest.json').exists(), 'Existing manifest: resume/reconcile it, do not re-prepare or overwrite evidence.'
h=lambda b:hashlib.sha256(b).hexdigest()
checks=[]
for n in ['page.js','page.html','control-spec.json']:
 a=(o/n).read_bytes();b=(p/n).read_bytes();assert a==b;checks.append({'path':n,'sha256':h(b),'identicalOriginalHarness':True})
old=json.loads((o/'capture-manifest.json').read_text());m=copy.deepcopy(old)
(p/'rendered').mkdir(exist_ok=True);(p/'raw').mkdir(exist_ok=True)
ims=[]
for x in old['images']:
 if x['model']!='control':continue
 b=(o/x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256'];(p/x['path']).write_bytes(b)
 y=copy.deepcopy(x);y['reuse']={'source':str((o/x['path']).relative_to(Path.cwd())),'sourceSha256':h(b),'reason':'Identical pinned control, exact page.js/page.html/control-spec; no candidate evidence reused'};ims.append(y)
assert len(ims)==54
m.update(images=ims,remaining=54,sessions=[],errors=[],historicalErrors=[],activeCaptureErrors=[],supersededSessions=[])
# Matrix candidate cases retain identifiers but pins change, material/camera contract unchanged.
m['inputPins']=[{'id':'control','path':'public/assets/models/product-estuary.glb','bytes':10191496,'sha256':'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'},{'id':'safe','path':'research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b/candidate.glb','bytes':9198676,'sha256':'a30deb208c7c1c4b23859edbb57d2c9d1cb1ad828e00c9431d4ebc29a47d9bce'}]
for x in m['inputPins']:
 b=Path(x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256']
m['harnessInputs']=[{'path':n,'sha256':h((p/n).read_bytes())} for n in ['page.js','page.html','control-spec.json','plan.mjs']]
(p/'capture-manifest.json').write_text(json.dumps(m,indent=2)+'\n')
(p/'reuse-verification.json').write_text(json.dumps({'controlImages':54,'candidateImagesReused':0,'checks':checks,'sourceManifestSha256':h((o/'capture-manifest.json').read_bytes()),'copiedImages':ims},indent=2)+'\n')
print('Verified/copied 54 unchanged controls; 0 prior candidates reused.')
