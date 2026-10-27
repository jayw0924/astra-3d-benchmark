from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil, subprocess, time
from PIL import Image

base=Path(__file__).resolve().parent
root=base.parents[2]
assert (root/'package.json').exists()
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def dump(path,value):
    path.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
# All checks are local; no generation, capture matrix, installation or publishing.
checks=[]
commands=[('test',['npm','test']),('lint',['npm','run','lint']),('case-index',['node','scripts/validate-case-studies.mjs']),('research-validate',['npm','run','research:validate']),('strict-build',['npm','run','build']),('public-app-build',['npm','run','build:app']),('public-e2e',['npm','run','test:e2e','--','tests/e2e/ai-imagery.spec.ts','tests/e2e/release-assets.spec.ts'])]
for label,cmd in commands:
    start=datetime.now(timezone.utc).isoformat()
    clock=time.monotonic()
    result=subprocess.run(cmd,cwd=root,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    (base/f'{label}.log').write_text(result.stdout)
    checks.append({'label':label,'command':cmd,'startedAt':start,'endedAt':datetime.now(timezone.utc).isoformat(),'wallSeconds':time.monotonic()-clock,'exitCode':result.returncode,'log':str((base/f'{label}.log').relative_to(root))})
    print(label,result.returncode,flush=True)
    dump(base/'verification.json',{'checks':checks})
    assert result.returncode==0, result.stdout[-3000:]
# Strict and app-only builds must retain public PNG identity and decodability.
for name in ['after-Carmine-side.png','Qwen_image_2.1_00001.png']:
    archive=base/name
    for path in [root/'public/assets/study/ai-imagery'/name,root/'dist/assets/study/ai-imagery'/name]:
        assert digest(archive)==digest(path),str(path)
        with Image.open(path) as image:
            image.load()
            assert image.size==Image.open(archive).size
snapshot=json.loads((base/'before.json').read_text())
changed=[]
for relative,expected in snapshot['files'].items():
    path=root/relative
    if not path.exists() or digest(path)!=expected:
        changed.append(relative)
allowed={'research/asset-manifest.json','research/case-studies/index.json','research/case-studies/case01/README.md','src/App.tsx','src/App.test.tsx','src/styles.css','src/generated/study-data.json'}
assert set(changed)<=allowed,changed
# Exact model and old evidence files remain byte-identical; unrelated dirty work is preserved.
projection=json.loads((root/'src/generated/study-data.json').read_text())
index=json.loads((root/'research/case-studies/index.json').read_text())
assert len(index['cases'])==2
assert index['cases'][1]['status']=='pending_asset'
assert index['cases'][1]['runIds']==[]
summary={'verifiedAt':datetime.now(timezone.utc).isoformat(),'checks':checks,'publicCopiesAndDistDecode':'pass','historicalSnapshotCount':len(snapshot['files']),'changedExistingPaths':changed,'unexpectedChangedPaths':[],'historicalRunFilesChanged':sum(p.startswith('research/runs/') for p in changed),'caseCount':len(index['cases']),'pendingCase02RunCount':len(index['cases'][1]['runIds']),'ledger':projection['summary'],'limitations':['No new image generation; two additional manual generations remain unexecuted.','Original generation time, runtime, job ID and cost unknown.','Browser smoke/PNG checks only, no new WebGL quality capture matrix.','Embedded graph corroborates settings but is not independently authenticated cloud execution.','Standalone file-tool E2E type checking emits pre-existing dependency/target diagnostics; actual repository lint/build/Playwright checks recorded here are authoritative.']}
dump(base/'verification.json',summary)
# Retain script and exact initial RED/GREEN logs as additive evidence.
shutil.copyfile(root/'work/archive-ai-imagery.py',base/'archive.py')
for name in ['app','archive','e2e']:
    shutil.copyfile(root/f'work/ai-green-{name}.log',base/f'green-{name}.log')
# Inventory excludes self and run.json to avoid circular hashes; run is schema validated.
paths=sorted(p for p in base.iterdir() if p.is_file() and p.name not in ['run.json','output-inventory.json'])
dump(base/'output-inventory.json',{'basis':'Actual local archive bytes; excludes this inventory and mutable run.json to avoid circular hashes. No generation timestamps inferred.','files':[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':digest(p)} for p in paths]})
run_path=base/'run.json'
run=json.loads(run_path.read_text())
run['outputPaths']=sorted(set(run['outputPaths'])|{str(p.relative_to(root)) for p in base.iterdir() if p.is_file() and p.name!='run.json'})
run['provenance']['outputs']=[{'path':p,'lane':'non_astra_authored_baseline','sourceAssets':['web-product-estuary-safe','qwen-imagery-source']} for p in run['outputPaths']]
dump(run_path,run)
print(json.dumps({k:v for k,v in summary.items() if k!='checks'},indent=2))
