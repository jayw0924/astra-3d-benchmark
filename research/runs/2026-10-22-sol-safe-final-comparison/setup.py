from pathlib import Path
import subprocess,json,hashlib,datetime,os,time
p=Path(__file__).resolve().parent; root=Path.cwd(); old=p.parent/'2026-10-21-sol-safe-correction-comparison'
h=lambda b:hashlib.sha256(b).hexdigest()
assert root==Path('/workspace') and not (p/'protected-snapshot.json').exists()
files=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')
excluded=[]; baseline=[]
for n in sorted(set(filter(None,files))):
 f=root/n
 if p in f.parents:continue
 if f.name.startswith('.env') or f.name in ['session.jsonl'] or 'private' in f.parts:excluded.append(n);continue
 if f.is_file():baseline.append({'path':n,'bytes':f.stat().st_size,'sha256':h(f.read_bytes())})
(p/'protected-snapshot.json').write_text(json.dumps(baseline,indent=2)+'\n')
(p/'initial-inventory.json').write_text(json.dumps({'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'hostProject':'/home/jay/projects/external/configurator-demo','backendProject':str(root),'mappingEvidence':'Host path absent in Docker; /workspace Git root and both exact binary pins verified before writes','runs':[str(x.relative_to(root)) for x in sorted(p.parent.iterdir())],'gitStatus':subprocess.check_output(['git','status','--short'],text=True),'scope':'tracked and nonignored untracked files outside this package','exclusions':excluded,'ignoredExclusion':'Ignored files including node_modules, caches, private authenticated session exports not content-hashed'},indent=2)+'\n')
def run(args,name,expected=0):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 with (p/name).open('w') as f:r=subprocess.run(args,stdout=f,stderr=subprocess.STDOUT)
 rec={'argv':args,'cwd':str(root),'startedAt':start,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t,'exitCode':r.returncode,'log':name}
 with (p/'commands.jsonl').open('a') as f:f.write(json.dumps(rec)+'\n')
 print(json.dumps(rec),flush=True);assert (r.returncode==0)==(expected==0),(args,r.returncode)
# Deliberately retain the old input pin first: the new test must reject it.
pin=(old/'pins.test.mjs').read_text().replace('corrected candidate pin, not prior rejected bytes','FINAL candidate pin, never prior candidate bytes').replace('2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b','2026-10-22-astra-geometry-safe-final-d0bf6e206c92').replace('9198676','9239404').replace('a30deb208c7c1c4b23859edbb57d2c9d1cb1ad828e00c9431d4ebc29a47d9bce','01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4')
(p/'pins.test.mjs').write_text(pin);(p/'plan.mjs').write_bytes((old/'plan.mjs').read_bytes())
run(['node','--test',str(p/'pins.test.mjs')],'pins-red.txt',1)
plan=(old/'plan.mjs').read_text().replace('2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b','2026-10-22-astra-geometry-safe-final-d0bf6e206c92').replace('9198676','9239404').replace('a30deb208c7c1c4b23859edbb57d2c9d1cb1ad828e00c9431d4ebc29a47d9bce','01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4')
(p/'plan.mjs').write_text(plan)
run(['node','--test',str(p/'pins.test.mjs')],'pins-green.txt')
(p/'plan.test.mjs').write_bytes((old/'plan.test.mjs').read_bytes())
# A missing silhouette cell class is the deliberate RED matrix fixture.
(p/'plan.mjs').write_text(plan.replace("['shaded','wireframe','silhouette']","['shaded','wireframe']"))
run(['node','--test',str(p/'plan.test.mjs')],'matrix-red.txt',1)
(p/'plan.mjs').write_text(plan)
run(['node','--test',str(p/'pins.test.mjs'),str(p/'plan.test.mjs')],'matrix-green.txt')
for n in ['page.js','page.html','control-spec.json','capture.mjs','execute.py','package.py','evidence.test.mjs','provenance.test.mjs']:(p/n).write_bytes((old/n).read_bytes())
# Reuse control preparation with only final input pin substitution; exact rendering harness remains unchanged.
prepare=(old/'prepare.py').read_text().replace('2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b','2026-10-22-astra-geometry-safe-final-d0bf6e206c92').replace('9198676','9239404').replace('a30deb208c7c1c4b23859edbb57d2c9d1cb1ad828e00c9431d4ebc29a47d9bce','01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4')
# Strengthen original reuse prerequisite, including pinned dependency code and original recorded harness identities.
prepare=prepare.replace('checks=[]',"checks=[]\noriginal=json.loads((o/'capture-manifest.json').read_text())\nassert original['activeCaptureErrors']==[]\nfor rec in original['harnessInputs']:\n assert h((o/rec['path']).read_bytes())==rec['sha256']\nassert original['inputPins'][0]['sha256']=='bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f'\nassert json.loads((o/'environment.json').read_text())['browser']\n")
(p/'prepare.py').write_text(prepare)
run(['python',str(p/'prepare.py')],'prepare.txt')
run(['node','--test',str(p/'evidence.test.mjs'),str(p/'provenance.test.mjs')],'evidence-red.txt',1)
print('Setup complete; exact rendering harness retained; final pins GREEN; matrix GREEN; missing final evidence RED.')
