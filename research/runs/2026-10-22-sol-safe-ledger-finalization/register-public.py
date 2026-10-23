"""Register only exact already-existing public evidence copies; never copy or render."""
from pathlib import Path
import datetime,hashlib,json
ROOT=Path.cwd();HERE=Path(__file__).resolve().parent
assert ROOT.resolve()==HERE.parents[2]
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
manifest_path=ROOT/'research/asset-manifest.json'
manifest=json.loads(manifest_path.read_text())
base=next(a for a in manifest['assets'] if a['id']=='safe-webgl-final-d0bf6e206c92')
source_dir=ROOT/'research/runs/2026-10-22-sol-safe-final-comparison'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
records=[]
def register(a,source):
    existing=next((v for v in manifest['assets'] if v['id']==a['id']),None)
    if existing:
        assert existing['sha256']==a['sha256'] and existing['localPath']==a['localPath']
    else:manifest['assets'].append(a)
    records.append(dict(assetId=a['id'],path=a['localPath'],source=str(source.relative_to(ROOT)),bytes=a['bytes'],sha256=a['sha256'],verifiedAt=now,exactByteCopy=True))
p=ROOT/'public/assets/models/product-estuary-safe.glb'
if p.exists():
    source=ROOT/base['localPath'];assert p.read_bytes()==source.read_bytes()
    register(dict(base,id='web-product-estuary-safe',title='Public exact FINAL Safe WebGL copy — integration acceptance separate',localPath=str(p.relative_to(ROOT)),retrievedAt=now,notes='Exact byte copy of safe-webgl-final-d0bf6e206c92; mixed source/Astra geometry authorship, non-Astra public copying. Registration proves byte identity only, not completed app tests or deployment. Original public Estuary control is preserved.'),source)
sources={}
comparison_dirs=[source_dir,ROOT/'research/runs/2026-10-21-sol-safe-webgl-comparison',ROOT/'research/runs/2026-10-21-sol-safe-correction-comparison']
for directory in comparison_dirs:
    for f in directory.rglob('*.png'):sources.setdefault(sha(f),[]).append(f)
for p in sorted((ROOT/'public/assets/study/safe-final').glob('*.png')):
    h=sha(p);assert h in sources,'No exact accepted evidence source: '+str(p)
    source=sources[h][0];assert p.read_bytes()==source.read_bytes()
    comparison=source.relative_to(ROOT/'research/runs').parts[0]
    label='Rejected original attempt' if comparison=='2026-10-21-sol-safe-webgl-comparison' else 'FINAL research'
    register(dict(base,id='safe-final-image-'+p.stem,title=label+' evidence: '+p.stem,kind='image',sourceUrl='urn:run:'+comparison,immutableUrl='urn:sha256:'+h,author='Browser capture and public copying by Sol; source CarConcept contributors and Astra-directed materials/geometry retained',retrievedAt=now,bytes=p.stat().st_size,sha256=h,localPath=str(p.relative_to(ROOT)),notes=label+'; exact unretouched evidence copy of '+str(source.relative_to(ROOT))+'. Inherited CC-BY-4.0; source contributors and project sanitization retained. Identity registration only, not app image/browser acceptance.'),source)
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
out=HERE/'public-copy-registration.json'
if out.exists():
    prior=json.loads(out.read_text())
    history=prior.get('snapshots',[])
else:history=[]
history.append(dict(verifiedAt=now,publicCopies=records,imagesAwaiting=not any('/study/safe-final/' in r['path'] for r in records)))
out.write_text(json.dumps(dict(authorship='gpt-6.1-sol registration only; no app acceptance claim',snapshots=history),indent=2)+'\n')
print(json.dumps(history[-1],indent=2))
