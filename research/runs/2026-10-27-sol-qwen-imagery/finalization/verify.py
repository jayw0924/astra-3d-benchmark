from pathlib import Path
from datetime import datetime,timezone
from PIL import Image
import hashlib,json,subprocess,time,os
root=Path(__file__).resolve().parents[4]; b=root/'research/runs/2026-10-27-sol-qwen-imagery'; out=b/'finalization'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,x): p.write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
commands=[('unit',['npm','run','test:unit']),('scripts',['npm','run','test:scripts']),('render-plan',['npm','run','test:render-plan']),('lint',['npm','run','lint']),('case-index',['node','scripts/validate-case-studies.mjs']),('validate',['npm','run','research:validate']),('strict-build',['npm','run','build']),('public-build',['npm','run','build:app']),('e2e',['npm','run','test:e2e','--','tests/e2e/ai-imagery.spec.ts','tests/e2e/release-assets.spec.ts','--timeout=30000']),('public-e2e',['npm','run','test:e2e','--','tests/e2e/ai-imagery.spec.ts','tests/e2e/release-assets.spec.ts','--timeout=30000'])]
for name,_ in commands: (out/(name+'.log')).touch()
(out/'verification.json').touch()
def inventory():
 paths=sorted(p for p in b.rglob('*') if p.is_file() and p not in [b/'run.json',out/'output-inventory.json'])
 dump(out/'output-inventory.json',{'basis':'Additive current archive inventory; original root inventory retained unchanged. Excludes mutable run.json and self to avoid circular hashes.','displayedImageCount':4,'successfulGeneratedImageCount':3,'reportedFailedAttemptCount':1,'files':[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in paths]})
inventory()
r=json.loads((b/'run.json').read_text()); r['outputPaths']=sorted(set(r['outputPaths'])|{str(p.relative_to(root)) for p in b.rglob('*') if p.is_file() and p!=b/'run.json'})
r['provenance']['outputs']=[{'path':p,'lane':'non_astra_authored_baseline','sourceAssets':['web-product-estuary-safe','qwen-imagery-source']} for p in r['outputPaths']]; dump(b/'run.json',r)
checks=[]
for label,cmd in commands:
 start=datetime.now(timezone.utc).isoformat(); clock=time.monotonic()
 env=os.environ.copy(); server=None
 if label=='public-e2e':
  import urllib.request
  server=subprocess.Popen([str(root/'node_modules/.bin/vite'),'preview','--host','127.0.0.1','--port','5189','--strictPort'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
  for attempt in range(50):
   if server.poll() is not None: raise RuntimeError('Preview server failed, port may be occupied')
   try:
    with urllib.request.urlopen('http://127.0.0.1:5189/') as response: body=response.read()
    assert body==(root/'dist/index.html').read_bytes(); break
   except OSError: time.sleep(0.1)
  else: raise RuntimeError('Preview did not become ready')
  env['BASE_URL']='http://127.0.0.1:5189'
 try: result=subprocess.run(cmd,cwd=root,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 finally:
  if server is not None: server.terminate(); server.wait(timeout=10)
 (out/(label+'.log')).write_text(result.stdout)
 checks.append({'label':label,'command':cmd,'startedAt':start,'endedAt':datetime.now(timezone.utc).isoformat(),'wallSeconds':time.monotonic()-clock,'exitCode':result.returncode,'log':str((out/(label+'.log')).relative_to(root))}); dump(out/'verification.json',{'checks':checks}); print(label,result.returncode,flush=True)
 if result.returncode: print(result.stdout[-5000:]); raise SystemExit(result.returncode)
before=json.loads((out/'before.json').read_text())['files']; changed=[p for p,h in before.items() if not (root/p).is_file() or sha(root/p)!=h]
allowed={str((b/p).relative_to(root)) for p in ['continuation.json','continuation.md','run.json']}; assert set(changed)<=allowed,changed
original_snapshot=json.loads((b/'before.json').read_text())['files']; historical_changes=[p for p,h in original_snapshot.items() if p.startswith('research/runs/') and (not (root/p).is_file() or sha(root/p)!=h)]; assert not historical_changes,historical_changes
for p in [b/'after-Carmine-side.png',b/'Qwen_image_2.1_00001.png',*b.glob('followup*/*.png')]:
 for dest in [root/'public/assets/study/ai-imagery'/p.name,root/'dist/assets/study/ai-imagery'/p.name]:
  assert sha(p)==sha(dest)
  with Image.open(dest) as im: im.load(); assert im.size==Image.open(p).size
projection=json.loads((root/'src/generated/study-data.json').read_text()); cases=json.loads((root/'research/case-studies/index.json').read_text()); assert cases['cases'][1]['runIds']==[]
assert sha(b/'output-inventory.json')==sha(out/'previous-output-inventory.json'); assert sha(b/'notes.md')==sha(out/'previous-notes.md')
assert sha(b/'Qwen_image_2.1_00001.png')=='a8276bf9432f8d8d3b4fdfee189a7801333749608a9f2ab3a8c7647f796f9e03'
summary={'verifiedAt':datetime.now(timezone.utc).isoformat(),'checks':checks,'preFinalizationSnapshotCount':len(before),'changedExistingArchivePaths':changed,'unexpectedChangedPaths':[],'originalHistoricalSnapshotRunFilesChanged':len(historical_changes),'publicAndDistPngs':'4 exact native archive matches; all decoded','firstArchiveAndPublicPngPreserved':True,'modelGlbHashes':{str(p.relative_to(root)):sha(p) for p in (root/'public/assets/models').glob('*.glb')},'case02RunCount':0,'ledger':projection['summary'],'limitations':['No cloud execution/billing history recovered: runtime/job IDs/cost unknown, including failed attempt.','Four attempts inferred from user sequence, not authenticated history.','Native source+3 visual inspection and narrow asset E2E only; no heavy recapture.','No winner selected by Jay.','Standalone file-tool TypeScript lint produced dependency/target diagnostics; an automatic wrapper registry lookup failed EACCES without installing; native repository checks above passed.']}
dump(out/'verification.json',summary); inventory()
uid=root.stat().st_uid; gid=root.stat().st_gid
# Correct only task-added/changed target files and verification outputs, not unrelated repository files.
paths=[p for p in out.rglob('*')]+[out,root/'work/finalize-qwen-preflight.py',b/'continuation.json',b/'continuation.md',b/'run.json',root/'src/App.tsx',root/'src/App.test.tsx',root/'scripts/ai-imagery.test.mjs',root/'tests/e2e/ai-imagery.spec.ts',root/'research/asset-manifest.json',root/'research/case-studies/index.json',root/'research/case-studies/case01/README.md',root/'src/generated/study-data.json']+[root/'public/assets/study/ai-imagery'/p.name for p in b.glob('followup*/*.png')]
for p in paths:
 if p.exists() and os.geteuid()==0: os.chown(p,uid,gid)
print(json.dumps({k:v for k,v in summary.items() if k!='checks'},indent=2))
