"""Close only new registration records; preserve all preexisting evidence files."""
from pathlib import Path
import datetime, hashlib, json, sys
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).parent

def write(path,data): path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
def inventory():
    files=sorted(p for p in OUT.iterdir() if p.is_file() and p.name!='output-inventory.json')
    extra=['research/runs/2026-10-26-sol-ground-contact/run.json','research/runs/2026-10-26-sol-ground-contact/FINAL_STATUS.md','research/runs/2026-10-26-sol-material-diagnosis/run.json','research/runs/2026-10-26-sol-material-diagnosis/notes.md','research/runs/2026-10-26-sol-material-diagnosis/prompt.md','research/asset-manifest.json','research/protocol.md','src/App.tsx','src/App.test.tsx','src/generated/study-data.json','tests/e2e/release-assets.spec.ts']
    files += [ROOT/p for p in extra]
    write(OUT/'output-inventory.json',{'scope':'Finalization artifacts and edited/new registration/public files; self excluded to avoid circular hash. Earlier inventories remain unchanged.','files':[{'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]})
if '--inventory-only' in sys.argv:
    inventory()
else:
    path=ROOT/'research/runs/2026-10-26-sol-ground-contact/run.json'
    run=json.loads(path.read_text())
    status='research/runs/2026-10-26-sol-ground-contact/FINAL_STATUS.md'
    if status not in run['outputPaths']:
        run['outputPaths'].append(status); run['outputPaths'].sort()
        run['provenance']['outputs'].append({'path':status,'lane':'non_astra_authored_baseline','sourceAssets':[]})
        run['provenance']['outputs'].sort(key=lambda x:x['path'])
    run['failureNotes']=run['failureNotes'].replace('See finalization/notes.md','See research/runs/2026-10-26-sol-ground-finalization/notes.md')
    write(path,run)
    inventory()
    path=OUT/'run.json'
    run=json.loads(path.read_text())
    paths=set(run['outputPaths']) | {str(p.relative_to(ROOT)) for p in OUT.iterdir() if p.is_file() and p.name!='run.json'}
    paths.add(status)
    run['outputPaths']=sorted(paths)
    run['provenance']['outputs']=[{'path':p,'lane':'non_astra_authored_baseline','sourceAssets':[]} for p in run['outputPaths']]
    run['endedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    run['elapsedSeconds']=(datetime.datetime.fromisoformat(run['endedAt'])-datetime.datetime.fromisoformat(run['startedAt'])).total_seconds()
    run['failureNotes']='Historical desktop-before telemetry is unavailable, original mobile composition is cropped, and sparse off-receiver differences remain unexplained. No new captures or material comparisons. The public-label regression was observed red; first green attempt had an ambiguous text matcher after the ledger also exposed the approval quote, then was scoped to Methods and passed. Existing default-compiler E2E file-tool diagnostics and Vite chunk advisory remain; repository lint/build and actual desktop/mobile release tests passed. This interval closes registration/check work; later final verification commands retain their own timestamps and runtime logs, not active or billed time.'
    write(path,run)
    inventory()
print('Closed additive records/inventory; historical evidence untouched.')
