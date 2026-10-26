"""Read-only evidence revalidation; writes only this additive closeout report."""
from pathlib import Path
import hashlib, json, re, subprocess
from PIL import Image, ImageChops, ImageStat
ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).parent
G = ROOT/'research/runs/2026-10-26-sol-ground-contact'
F = G/'followup-runtime-pairs'
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
before = json.loads((OUT/'before.json').read_text())
changed = [r['path'] for r in before['files'] if not (ROOT/r['path']).is_file() or digest(ROOT/r['path']) != r['sha256']]
assert not changed, changed
historical = json.loads((F/'historical-files-before.json').read_text())
assert len(historical)==65
assert all(digest(G/name)==sha for name, sha in historical.items())
assert (G/'before-captures.json').read_bytes()==b'[]'
follow_inventory = json.loads((F/'inventory.json').read_text())
for name, row in follow_inventory.items():
    assert digest(F/name)==row['sha256'] and (F/name).stat().st_size==row['bytes'], name
assert digest(ROOT/'src/lib/viewerLighting.ts')==digest(F/'current-viewerLighting.ts.txt')
baseline = subprocess.check_output(['git','show',before['head']+':src/lib/viewerLighting.ts'],cwd=ROOT)
assert hashlib.sha256(baseline).hexdigest()==digest(F/'baseline-viewerLighting.ts.txt')
records=json.loads((F/'captures.json').read_text())
assert len(records)==12
verification=json.loads((F/'verification.json').read_text())
rechecked=[]
for pair in verification['pairs']:
    a,b=[next(r for r in records if r['phase']==phase and r['finish']==pair['finish'] and r['view']==pair['view']) for phase in ['before','after']]
    for key in ['camera','model','shadow','renderer']:
        assert a['telemetry'][key]==b['telemetry'][key], key
    assert a['telemetry']['inspection']['meshes']==b['telemetry']['inspection']['meshes']
    assert a['telemetry']['floor']['position'][1]==-.003
    assert b['telemetry']['floor']['position'][1]==.1585579729696714
    for r in [a,b]:
        per=json.loads((F/Path(r['filename']).with_suffix('.json')).read_text())
        assert per['telemetry']==r['telemetry'] and not per['errors']
        assert digest(F/r['filename'])==r['sha256']
        assert per['modelSha256']==digest(ROOT/'public/assets/models/product-estuary-safe.glb')
    images=[Image.open(F/r['filename']).convert('RGB') for r in [a,b]]
    assert all(im.size==(850,778) and max(ImageStat.Stat(im).stddev)>5 for im in images)
    diff=ImageChops.difference(*images)
    pixels=list(diff.getdata())
    assert sum(any(px) for px in pixels)==pair['changedPixels']
    assert max(max(px) for px in pixels)==pair['maxChannelDelta']
    roi=list(diff.crop(pair['bodyInteriorROI']['box']).getdata())
    assert sum(any(px) for px in roi)==pair['bodyInteriorROI']['changedPixels']
    assert max(max(px) for px in roi)==pair['bodyInteriorROI']['maxChannelDelta']
    rechecked.append({'finish':pair['finish'],'view':pair['view'],'pixelMetricsAndTelemetryEqual':True})
paths=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=ROOT).decode().split('\0')
paths=sorted(set(p for p in paths if p and (ROOT/p).is_file()))
private=[p for p in paths if re.search(r'(^|/)(?:sessions?|transcripts?)(/|\.)|(?:session-export|session\.jsonl|transcript\.json)',p,re.I)]
assert not private, private
allow={'command','argv','cwd','startedAt','endedAt','finishedAt','elapsedSeconds','exitCode','exitStatus','stdout','stderr','log','executionId','event','timestamp','stdoutPath','stderrPath'}
command_rows=0
for p in paths:
    if p.endswith('commands.jsonl'):
        for line in (ROOT/p).read_text().splitlines():
            if line.strip():
                row=json.loads(line); assert set(row)<=allow, p; command_rows+=1
signatures=[re.compile(s) for s in [r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----',r'\bsk-[A-Za-z0-9]{32,}',r'\bgh[pousr]_[A-Za-z0-9]{30,}']]
scan=[p for p in paths if (p.startswith('public/') or p.startswith('research/runs/2026-10-26-sol-ground') or p.startswith('research/runs/2026-10-26-sol-material-diagnosis') or p=='src/generated/study-data.json') and Path(p).suffix in ['.json','.jsonl','.md','.txt','.html','.log','.ts','.py','.mjs']]
hits=[p for p in scan if any(rx.search((ROOT/p).read_text(errors='replace')) for rx in signatures)]
assert not hits,hits
built_text=[p for p in (ROOT/'dist').rglob('*') if p.is_file() and p.suffix in ['.js','.json','.html','.md','.txt','.css']]
built_hits=[str(p.relative_to(ROOT)) for p in built_text if any(rx.search(p.read_text(errors='replace')) for rx in signatures)]
assert not built_hits,built_hits
projection=json.loads((ROOT/'src/generated/study-data.json').read_text())
assert all('sessionEvidence' not in r for r in projection['runs'])
assert projection['summary']['runCount']==len(list((ROOT/'research/runs').glob('*/run.json')))==30
approval=json.loads((G/'user-approval.json').read_text())
assert approval['statement']=='yes tires feel planted' and approval['publicationAuthorized'] is False
model=ROOT/'public/assets/models/product-estuary-safe.glb'
assert model.stat().st_size==9239404 and digest(model)=='01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'
report={'baseline':before['head'],'unchangedBaselineFiles':len(before['files']),'historicalGroundFiles':len(historical),'historicalGroundPngs':sum(n.endswith('.png') for n in historical),'followupFilesPreserved':len([p for p in before['files'] if '/followup-runtime-pairs/' in p['path']]),'nativeImagesRechecked':len(records),'pairs':rechecked,'safeGlb':{'bytes':model.stat().st_size,'sha256':digest(model)},'approvalUnchangedAndGroundOnly':True,'frozenParentCheckpointUnchanged':True,'allPublicBytesUnchanged':True,'productionGroundSourceAndTestsUnchangedByFinalizer':True,'projectionSummary':projection['summary'],'privacy':{'trackedAndNonignoredFilenameCandidates':private,'allowlistedCommandRows':command_rows,'textFilesSignatureScanned':len(scan),'credentialSignatureCandidates':hits,'builtTextFilesScanned':len(built_text),'builtCredentialSignatureCandidates':built_hits,'sessionEvidenceRemovedFromProjection':True,'scope':'Filename/schema checks and limited credential signatures; not a comprehensive privacy/security certification.'}}
(OUT/'integrity.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
