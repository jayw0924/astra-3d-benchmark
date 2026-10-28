"""Additive closeout of this new run only; never rewrites earlier run evidence."""
from pathlib import Path
import hashlib,json,shutil,subprocess
root=Path(__file__).resolve().parents[3];run=Path(__file__).resolve().parent;out=run/'finalization'
def ident(p):return {'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def dump(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
for p in (root/'work/imagery-publication-finalization').iterdir():
 if p.is_file():shutil.copyfile(p,out/p.name)
for name in ['register-imagery-followons.py','log-imagery-command.py','finalize-imagery-discovery.py']:
 shutil.copyfile(root/'work'/name,out/name)
before=json.loads((out/'before.json').read_text());history=json.loads((out/'historical-evidence-before.json').read_text())
changed=[p for p,v in before.items() if not (root/p).is_file() or ident(root/p)!=v]
allowed=['research/asset-manifest.json','research/case-studies/case01/README.md','research/case-studies/index.json','src/App.test.tsx','src/App.tsx','src/generated/study-data.json','src/styles.css','tests/e2e/ai-imagery.spec.ts']
assert set(changed)==set(allowed),changed
hchanged=[p for p,v in history.items() if not (root/p).is_file() or ident(root/p)!=v];assert not hchanged,hchanged
archive=json.loads((run/'archive-inventory.json').read_text())
for item in archive:
 assert ident(root/item['source'])==ident(root/item['archive'])=={'bytes':item['bytes'],'sha256':item['sha256']}
# All old model/PNG bytes and earlier workflow publication (including dirty files) remain pinned.
manifest=json.loads((root/'research/asset-manifest.json').read_text());cases=json.loads((root/'research/case-studies/index.json').read_text())
assert cases['cases'][1]['runIds']==[] and cases['cases'][1]['assetIds']==[]
metrics=json.loads((run/'pixel-verification.json').read_text())
verification={'status':'publish-ready locally; not committed, pushed or deployed','checks':{'unitTestsPassed':44,'scriptTestsPassed':51,'renderPlanTestsPassed':6,'productionE2ETestsPassed':10,'protectedCompositeTestsPassed':6,'shadowTestsPassed':2,'registeredAssets':len(manifest['assets']),'registeredRuns':len(list((root/'research/runs').glob('*/run.json'))),'newPublicPNGCount':9,'imagerySectionDecodedImageCount':21,'nativeArchiveCopiesVerified':len(archive),'historicalFilesUnchanged':len(history),'historicalChangedPaths':hchanged,'preexistingChangedPaths':changed,'case02ActualRuns':0},'pixels':metrics,'limits':['Visual approvals are not faithful-product, privacy or legal certification.','Cloud job IDs, time and billing including failed jobs unknown.','Cache versus fresh repeat sampling unknown.','No GLB load/heavy viewer matrix in this publication browser check.','Vite existing large-chunk warning remains; no dependency installation completed.','File-tool standalone TypeScript auto-lint attempted unrelated default settings/cache and errored; authoritative project lint/tsc/build and real browser tests passed.'],'evidence':'Actual command argv/start/exit records and logs in finalization; earlier work-packet logs unchanged. Discovery and file-tool edits are in the genuine session transcript, not reconstructed command events.','screenshots':'Initial screenshots retained. capture02 fixes inherited oversized captions after compact-red browser assertion (170px). Sticky site header hidden only via screenshot style to avoid element-capture overlay, not via an app change. Full location/protected desktop/mobile images actually inspected; all21 report images decoded with ratio/overflow checks.'}
dump(out/'verification.json',verification)
(out/'notes.md').write_text('''# Publication closeout

All four follow-ons are completed, no new generation. Location/source paired editorial hero; protected source/02/01 comparison; Flux identity failure; exact-repeat/cache limit; retained side seeds and two-angle imagery; technical details progressively disclosed. Viewer preview and current Safe GLB unchanged. Historical protocol unchanged; status addendum and Case01 navigation updated, Case02 empty. Original workflow-publication registration, notes, inventories, screenshots and all older research files unchanged.

92 native work-packet/input copies are byte-verified against their sources. Nine new public PNGs remain exact originals with native metadata reviewed, source/derivative attribution and no legal/privacy certification. Research scripts/graphs are archived outside public. `verification.json` records actual test counts; exact argv/exit output is in adjacent execution JSON/logs. The originally wrong case-validator filename is a retained failed local validation attempt; the discovered actual validator passed. Initial full unit run exposed stale title/ambiguous seed selectors; corrected scoped assertions passed. Captions inherited170px minimum; browser RED demonstrated it and a scoped CSS override passed. Initial screenshots and all prior logs retained; capture02 hides the sticky header only during element screenshot capture to prevent an overlay artifact. No paid job, creative candidate, install, commit, push or deployment was performed.

`output-inventory.json` hashes this final run's files except itself; previous historical inventories are untouched. `before.json` and `historical-evidence-before.json` were captured before editing, not reconstructed afterward. Scope records are local research evidence, not served by the production app. The only eight changed pre-existing files are explicitly listed in verification; all prior source/model/PNG/history bytes remain unchanged. New package registration timestamps are measured local retrospective registration, not synthetic generation timestamps or active/billing intervals.
''')
(out/'git-status-final.txt').write_bytes(subprocess.check_output(['git','status','--short'],cwd=root))
# Inventory exists before registration; exclude its own content hash to avoid circularity.
inv=out/'output-inventory.json';inv.touch(exist_ok=True)
record=json.loads((run/'run.json').read_text())
outputs=[str(p.relative_to(root)) for p in sorted(run.rglob('*')) if p.is_file() and p!=run/'run.json']
outputs += [a['publicPath'] for a in json.loads((run/'public-assets.json').read_text())]
record['outputPaths']=outputs
record['provenance']['outputs']=[{'path':p,'lane':'non_astra_authored_baseline','sourceAssets':record['inputAssets']} for p in outputs]
dump(run/'run.json',record)
dump(inv,{str(p.relative_to(root)):ident(p) for p in sorted(run.rglob('*')) if p.is_file() and p!=inv})
print(json.dumps(verification['checks'],indent=2))
