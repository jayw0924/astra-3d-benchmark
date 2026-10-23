from pathlib import Path
import json,hashlib,copy
p=Path(__file__).resolve().parent;o=p.parent/'2026-10-21-sol-safe-webgl-comparison'
# Initial preparation only. Never reset a completed/checkpointed package.
assert not (p/'capture-manifest.json').exists(), 'Existing manifest: resume/reconcile it, do not re-prepare or overwrite evidence.'
h=lambda b:hashlib.sha256(b).hexdigest()
checks=[]
original=json.loads((o/'capture-manifest.json').read_text())
assert original['activeCaptureErrors']==[]
for rec in original['harnessInputs']:
 assert h((o/rec['path']).read_bytes())==rec['sha256']
assert original['inputPins'][0]['sha256']=='bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'
environment=json.loads((o/'environment.json').read_text())
for package,version in environment['dependencyVersions'].items():
 assert json.loads((Path('node_modules')/package/'package.json').read_text())['version']==version
for executable in environment['cachedHeadlessExecutables']:
 assert h(Path(executable['path']).read_bytes())==executable['sha256']
checks.append({'priorEnvironmentSha256':h((o/'environment.json').read_bytes()),'dependencyVersions':environment['dependencyVersions'],'browserExecutablesVerified':environment['cachedHeadlessExecutables']})

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
m['inputPins']=[{'id':'control','path':'public/assets/models/product-estuary.glb','bytes':10191496,'sha256':'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'},{'id':'safe','path':'research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/candidate.glb','bytes':9239404,'sha256':'01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'}]
for x in m['inputPins']:
 b=Path(x['path']).read_bytes();assert len(b)==x['bytes'] and h(b)==x['sha256']
m['harnessInputs']=[{'path':n,'sha256':h((p/n).read_bytes())} for n in ['page.js','page.html','control-spec.json','plan.mjs']]
(p/'capture-manifest.json').write_text(json.dumps(m,indent=2)+'\n')
(p/'reuse-verification.json').write_text(json.dumps({'controlImages':54,'candidateImagesReused':0,'checks':checks,'sourceManifestSha256':h((o/'capture-manifest.json').read_bytes()),'copiedImages':ims},indent=2)+'\n')
print('Verified/copied 54 unchanged controls; 0 prior candidates reused.')
