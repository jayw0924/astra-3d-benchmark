"""One-time Sol ledger finalization. Never replays authors or evidence inventory writers."""
from pathlib import Path
import datetime as dt, hashlib, json, os, subprocess, email.utils
ROOT = Path.cwd()
HERE = Path(__file__).resolve().parent
assert ROOT.resolve() == HERE.parents[2]
now = lambda: dt.datetime.now(dt.timezone.utc).isoformat()
started = now()
changes = []
def read(p): return json.loads(Path(p).read_text())
def save(p, value):
    p = Path(p)
    p.write_text(json.dumps(value, indent=2) + '\n')
    changes.append(str(p.relative_to(ROOT)) if p.is_absolute() else str(p))
def text(p, value):
    p = Path(p); p.write_text(value); changes.append(str(p.relative_to(ROOT)) if p.is_absolute() else str(p))
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def command(argv):
    t = now(); result = subprocess.run(argv, capture_output=True, text=True)
    with (HERE/'commands.jsonl').open('a') as f:
        f.write(json.dumps(dict(argv=argv,cwd=str(ROOT),startedAt=t,endedAt=now(),exitCode=result.returncode,stdout=result.stdout,stderr=result.stderr))+'\n')
    assert result.returncode == 0, result.stderr
    return result.stdout
assert not (HERE/'verification.json').exists(), 'Finalizer is one-time; do not overwrite evidence'
runs = ROOT/'research/runs'
author_ids = ['2026-10-21-astra-geometry-safe-d8fc14b866ab','2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b','2026-10-22-astra-geometry-safe-final-d0bf6e206c92']
comparison_ids = ['2026-10-21-sol-safe-webgl-comparison','2026-10-21-sol-safe-correction-comparison','2026-10-22-sol-safe-final-comparison']
asset_ids = ['safe-webgl-d8fc14b866ab','safe-webgl-correction-7f2d11f494a5-b','safe-webgl-final-d0bf6e206c92']
statuses = [
 ('Original Safe WebGL geometry — rejected for promotion','fail','Static/reproduction and authentic private attribution pass; fixed-view visual acceptance fails: irregular/scalloped highlights in both finishes. Original rejected candidate retained, not promoted.'),
 ('Safe WebGL correction — not promoted','partial','Authentic private attribution, static/reproduction and targeted repair pass; full matrix exposes residual rectangular seam deviation. Not promoted; superseded by FINAL. No runtime speedup established.'),
 ('FINAL Safe WebGL geometry — accepted research artifact','pass_with_intervention','Authentic private attribution, independent static/reproduction and frozen fixed-view research gates pass. FINAL accepted research artifact only; separate application integration acceptance required. Runtime speedup not established; first-correct-frame unavailable. Correction budget exhausted.')]
# Read all editable records before transformation and pin protected historical evidence.
authors = [read(runs/n/'run.json') for n in author_ids]
manifest_path=ROOT/'research/asset-manifest.json'
manifest=read(manifest_path)
preserved={}
for n in author_ids+comparison_ids:
    p=runs/n
    for f in p.rglob('*'):
        if f.is_file() and f.name not in ['run.json','notes.md','session.jsonl']:
            preserved[str(f.relative_to(ROOT))]=digest(f)
for p in [ROOT/'research/assets/upstream/CarConcept.glb',ROOT/'public/assets/models/product.glb',ROOT/'public/assets/models/product-estuary.glb']:
    preserved[str(p.relative_to(ROOT))]=digest(p)
text(HERE/'prompt.md', '# Ledger finalization request\n\nFinalize research records without rewriting original prompts, logs, provisional reports, private transcripts or binaries. Audit all declared outputs and provenance; retain original rejected / correction not-promoted / FINAL accepted research distinctions. Register immutable correction and FINAL assets, independently regenerate canonical geometry reports, and register exact public copies only if present. Create Sol comparison records from actual evidence times, keep private evidence ignored/0600, run strict validation and public generation. This is registration, not completed app acceptance, commit, push or deployment.\n')
text(HERE/'notes.md', '# Sol ledger registration/finalization\n\nAuthored by gpt-6.1-sol via openai-codex. This package registers and reconciles research evidence, not application-test or deployment acceptance. Original command logs, prompts, images, provisional reports and binaries are preserved; appended current gate notes supersede historical pending statements. Sol copied render harnesses remain non-Astra authored or mixed when adapted. Digest files disclose integrity only, not transcripts or session IDs. Public reproducibility cannot independently authenticate private sessions. Canonical geometry reports are independently rerun against pinned assets; provisional reports remain untouched.\n\nComparison run intervals begin at the first retained timestamped command (or original HTTP Date evidence) and end at ledger finalization; elapsed is an evidence-package interval, never model runtime or active browser acquisition time. Subject run intervals end at the authentic persisted last message, not the later export or session-close time.\n\nNo artifact inventory regenerator was run. Existing inventories describe their historical snapshots; finalization additions/edits are separately recorded here. No public copy exists is never interpreted as permission to fabricate one. Parent owns final integration acceptance.\n')
private=[]
for n,r,(title,outcome,summary) in zip(author_ids,authors,statuses):
    p=runs/n; ep=p/'session.jsonl'; s=read(ep)
    assert s['id']==r['sessionEvidence']['sessionId'] and s['model']==r['model']=='gpt-6-astra' and s['billing_provider']==r['provider']=='openai-codex'
    assert subprocess.run(['git','check-ignore','-q',str(ep.relative_to(ROOT))]).returncode==0
    os.chmod(ep,0o600)
    h=digest(ep)
    expected={'2026-10-21-astra-geometry-safe-d8fc14b866ab':'81ebf424bb939e097174a036af0527e1670d61515d3fa1048f9e767e092bffa3','2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b':'7425ced1408961244e4629f92b0ead3c542817bc8b1eefa89e50529ac64918a2','2026-10-22-astra-geometry-safe-final-d0bf6e206c92':'848db3788eb1a7c451ed027ceb550810f1782f55c83ac9cb5f20d515fdd5b598'}[n]
    assert h==expected
    text(p/'session-evidence.sha256',h+'  session.jsonl\n')
    command(['sha256sum','--check',str((p/'session-evidence.sha256').relative_to(ROOT))]) if False else None
    # Verify digest with the required relative filename resolution, without printing metadata.
    check=subprocess.run(['sha256sum','-c','session-evidence.sha256'],cwd=p,capture_output=True,text=True)
    assert check.returncode==0
    last=max(m['timestamp'] for m in s['messages'] if isinstance(m.get('timestamp'),(float,int)))
    r['endedAt']=dt.datetime.fromtimestamp(last,dt.timezone.utc).isoformat()
    r['elapsedSeconds']=(dt.datetime.fromisoformat(r['endedAt'])-dt.datetime.fromisoformat(r['startedAt'].replace('Z','+00:00'))).total_seconds()
    r.update(title=title,outcome=outcome,publicSummary=summary,failureNotes=summary+' Private attribution is not fully reproducible from a public checkout. Canonical reports in Sol finalization package; provisional author reports preserved.',reviewer='gpt-6.1-sol independent research acceptance; see Sol comparison decision/current gates')
    if 'cost' in r: r['cost']['basis']='Actual billing amount unavailable; no estimate substituted'
    text(p/'notes.md',(p/'notes.md').read_text()+'\n\n## Current gates — Sol ledger finalization '+started+'\n\n'+summary+'\nAuthentic final private export verified locally; earlier pending-persistence statements above are historical and superseded. The private export remains ignored and mode 0600; session-evidence.sha256 publishes its digest only. No fourth correction is authorized. Canonical evaluator reports are separate, not overwritten author reports.\n')
    files=sorted(str(f.relative_to(ROOT)) for f in p.rglob('*') if f.is_file() and f.name not in ['run.json','session.jsonl'])
    old={o['path']:o for o in r['provenance']['outputs']}
    missing=[f for f in files if f not in old]
    entries=[]
    for f in files:
        base=Path(f).name
        non=base in ['prompt.md','handoff-input.md','session-evidence.sha256','page.html','page.js','control-spec.json']
        # Mixed conservatively retains subject/source/tooling contributions without inventing sole authorship.
        entries.append(dict(path=f,lane='non_astra_authored_baseline' if non else 'mixed',sourceAssets=['web-product-estuary']))
    r['outputPaths']=files; r['provenance']=dict(lane='mixed',outputs=entries)
    save(p/'run.json',r)
    private.append(dict(run=n,sha256=h,messages=len(s['messages']),mode=oct(ep.stat().st_mode & 0o777),ignored=True,identityVerified=True,missingProvenanceBefore=missing,persistedFinalMessageAt=r['endedAt']))
# Immutable research asset registration.
base=next(a for a in manifest['assets'] if a['id']=='web-product-estuary')
for i in [1,2]:
    n=author_ids[i]; p=runs/n/'candidate.glb'; b=p.read_bytes(); h=digest(p)
    asset=dict(base,id=asset_ids[i],title=['','Safe WebGL correction — research only, not promoted','FINAL Safe WebGL — accepted research artifact'][i],sourceUrl='urn:run:'+n,immutableUrl='urn:sha256:'+h,author='Source CarConcept contributors and Astra Estuary materials retained; evidence-verified Astra-directed geometry correction; Sol independent registration and review',retrievedAt=authors[i]['endedAt'],bytes=len(b),sha256=h,localPath=str(p.relative_to(ROOT)),notes=statuses[i][2]+' Source asset: web-product-estuary; mixed source/model authorship. Independently rebuilt from immutable control, not prior simplified bytes.')
    assert not any(a['id']==asset['id'] for a in manifest['assets']);manifest['assets'].append(asset)
manifest['assets'][next(i for i,a in enumerate(manifest['assets']) if a['id']==asset_ids[0])]['notes']=statuses[0][2]+' Source asset: web-product-estuary. Private attribution verified; keep immutable historical candidate.'
# Canonical reports go in separate Sol subdirectories, never provisional author paths.
reports=[]
for i in [1,2]:
    a=next(a for a in manifest['assets'] if a['id']==asset_ids[i])
    d=HERE/('correction' if i==1 else 'final'); d.mkdir()
    output=command(['node','scripts/report-geometry.mjs','--asset-id',a['id'],'--role','safe-webgl',a['localPath']])
    report=json.loads(output);save(d/'geometry-report.json',report)
    provisional=read(runs/author_ids[i]/'candidate-geometry-report.pending.json')
    diff=[k for k in report if report[k]!=provisional.get(k)]
    # Asset IDs are provisional by design. All measured geometry fields must agree.
    semantic=[k for k in diff if k not in ['id','assetId','role']]
    assert not semantic, semantic
    reports.append(dict(assetId=a['id'],reportPath=str((d/'geometry-report.json').relative_to(ROOT)),provisionalDifferences=diff,measuredFieldsEqual=True))
# Public model/images are exact copies only; read but never write other worker's tree.
public=[]; absent=[]
public_glb=ROOT/'public/assets/models/product-estuary-safe.glb'
if public_glb.exists():
    a=next(a for a in manifest['assets'] if a['id']==asset_ids[2]);assert public_glb.read_bytes()==(ROOT/a['localPath']).read_bytes()
    copied=dict(a,id='web-product-estuary-safe',title='Public exact FINAL Safe WebGL copy — integration acceptance separate',localPath=str(public_glb.relative_to(ROOT)),retrievedAt=now(),notes='Exact byte copy of safe-webgl-final-d0bf6e206c92; registration proves identity, not completed application acceptance. Source asset: safe-webgl-final-d0bf6e206c92.')
    manifest['assets'].append(copied);public.append(dict(path=copied['localPath'],source=a['localPath'],sha256=a['sha256'],bytes=a['bytes']))
else: absent.append(str(public_glb.relative_to(ROOT)))
source_images={}
for f in (runs/comparison_ids[2]).rglob('*.png'): source_images.setdefault(digest(f),[]).append(f)
for f in sorted((ROOT/'public/assets/study/safe-final').glob('*.png')):
    h=digest(f); assert h in source_images,'Public image has no exact FINAL evidence source: '+str(f)
    src=source_images[h][0];assert src.read_bytes()==f.read_bytes()
    a=dict(base,id='safe-final-image-'+f.stem,title='FINAL research evidence: '+f.stem,kind='image',sourceUrl='urn:run:'+comparison_ids[2],immutableUrl='urn:sha256:'+h,author='Browser capture and public copying by Sol; sourced CarConcept contributors and Astra-directed materials/geometry retained',retrievedAt=now(),bytes=f.stat().st_size,sha256=h,localPath=str(f.relative_to(ROOT)),notes='Exact unretouched evidence copy. Source: '+str(src.relative_to(ROOT))+'; inherited source-model CC-BY-4.0. Registration is not app/browser publication acceptance.')
    manifest['assets'].append(a);public.append(dict(path=a['localPath'],source=str(src.relative_to(ROOT)),sha256=h,bytes=a['bytes']))
if not any('/study/safe-final/' in p['path'] for p in public): absent.append('public/assets/study/safe-final/*.png')
save(manifest_path,manifest)
def sol_record(p,title,inputs,outcome,summary,start):
    end=now(); paths=sorted(str(f.relative_to(ROOT)) for f in p.rglob('*') if f.is_file() and f.name!='run.json')
    record=dict(id=p.name,title=title,startedAt=start,endedAt=end,model='gpt-6.1-sol',provider='openai-codex',interface='Hermes delegated research evaluator; Docker tools',reasoningMode='not independently recorded',tools=['terminal','Node.js','Python','Playwright Chromium'],workPackage='render' if p.name in comparison_ids else 'integrate',inputAssets=inputs,promptPath=str((p/'prompt.md').relative_to(ROOT)),outputPaths=paths,provenance=dict(lane='non_astra_authored_baseline',outputs=[dict(path=f,lane='non_astra_authored_baseline',sourceAssets=inputs) for f in paths]),elapsedSeconds=(dt.datetime.fromisoformat(end)-dt.datetime.fromisoformat(start.replace('Z','+00:00'))).total_seconds(),cost=dict(amount=None,currency='USD',basis='Actual billing unavailable; not estimated'),interventionLevel=0,outcome=outcome,failureNotes=summary,reviewer='gpt-6.1-sol; independent findings recorded by parent',publicSummary=summary)
    save(p/'run.json',record)
for i,n in enumerate(comparison_ids):
    p=runs/n
    if (p/'commands.jsonl').exists():
        rows=[json.loads(l) for l in (p/'commands.jsonl').read_text().splitlines() if l.strip()]
        start=min(r['startedAt'] for r in rows)
        basis='first retained commands.jsonl startedAt'
    else:
        dates=[]
        for f in (p/'raw').glob('*.json'):
            for request in read(f).get('network',[]):
                value=request.get('headers',{}).get('Date')
                if value: dates.append(email.utils.parsedate_to_datetime(value))
        assert dates
        start=min(dates).isoformat();basis='earliest recorded HTTP response Date among retained raw browser records; pre-capture preparation start unavailable'
    summary=statuses[i][2]+' 108 matrix cases, 64 actual browser transitions and 120 warmed diagnostic samples. Fixed-view research decision is separate from application acceptance.'
    text(p/'notes.md',(p/'notes.md').read_text()+'\n\n## Current gate status — Sol finalization '+started+'\n\n'+summary+'\nEarlier no-final-verdict/run.json and pending-review statements describe the original evidence-production boundary and are superseded by this appended status and finalized run record. Existing artifact-inventory.json is historical: do not regenerate it to erase the boundary. Record start uses '+basis+'; end includes ledger finalization, not an active-render timing claim. All harness work is Sol-authored over mixed source assets.\n')
    if i==1:
        save(p/'decision.json',dict(status='not-promoted-residual-seam',promotionApproved=False,authorship='gpt-6.1-sol ledger attestation of parent independent findings',candidate=asset_ids[i],staticAndTargetedRepair='pass',fullVisualGate='fail: residual rectangular seam patch observed in full matrix',runtimeSpeedup='not-established',firstCorrectFrame='unavailable',supersededBy=asset_ids[2],evidence=['visual-review.md','seam-diagnostic.json','native-comparison-manifest.json'],correctionBudget='exhausted after FINAL; no new correction authorized'))
    sol_record(p,['Original Safe WebGL comparison — rejected for promotion','Correction comparison — residual seam, not promoted','FINAL Safe WebGL comparison — accepted research artifact'][i],['web-product-estuary',asset_ids[i]],['fail','partial','pass_with_intervention'][i],summary,start)
# Preserve the abandoned same-session diagnostic folder as unscored setup evidence, not another scored Astra run.
p=runs/'2026-10-21-astra-geometry-safe-correction-7f2d11f494a5'
rows=[json.loads(l) for l in (p/'commands.jsonl').read_text().splitlines() if l.strip()]
text(p/'prompt.md','# Retrospective Sol registration brief\n\nRegister the pre-existing same-session diagnostic folder as unscored infrastructure evidence. This is not a reconstruction of the original user prompt or a separate model-authenticated correction. The actual correction is the preserved -b package. Original command logs and copied harness files remain unchanged.\n')
text(p/'notes.md','# Unscored diagnostic evidence registration\n\nThis Sol-authored registration describes earlier Astra-session diagnostic preparation, not Sol authorship of the original commands or another scored Astra result. Existing command logs and probes retain mixed historical subject/tooling contributions; copied page.js/page.html/control-spec.json are Sol harness work. Original prompt was not captured here; prompt.md is explicitly retrospective. No candidate was produced in this folder. See the -b package for the actual attributable correction and private export.\n')
sol_record(p,'Unscored correction diagnostic evidence — retrospective Sol registration',['web-product-estuary'],'blocked','Infrastructure/diagnostic evidence only, no candidate and no separately scored model run. Original commands belong to the correction session; registration by gpt-6.1-sol, not a new Astra attribution.',rows[0]['startedAt'])
r=read(p/'run.json');r['provenance']['lane']='mixed'
for o in r['provenance']['outputs']:
    if Path(o['path']).name not in ['prompt.md','notes.md','page.html','page.js','control-spec.json']:o['lane']='mixed'
save(p/'run.json',r)
assert all(digest(ROOT/p)==h for p,h in preserved.items()),'Protected historical evidence changed'
save(HERE/'verification.json',dict(verifiedAt=now(),author='gpt-6.1-sol',privateEvidence=private,canonicalReports=reports,publicCopies=public,awaitingPublicCopies=absent,preservedHistoricalFiles=len(preserved),historicalDigests=preserved,scope='Ledger registration only. No application acceptance, deployment, commit or push. Public copy verification is identity only.',changedPaths=changes))
sol_record(HERE,'Safe WebGL ledger finalization — registration only',['web-product-estuary']+asset_ids,'pass','Ledger and immutable-asset registration only; app acceptance remains with parent. Runtime speedup not established; first-correct-frame unavailable. Public copies only registered when verified present.',started)
print(json.dumps(dict(changedPaths=len(changes),privateExports=len(private),comparisonRuns=3,canonicalReports=len(reports),publicCopies=len(public),awaiting=absent,historicalFilesPreserved=len(preserved))))
