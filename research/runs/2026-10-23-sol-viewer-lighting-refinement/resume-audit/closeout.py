"""Generate closeout inventories from audited on-disk artifacts."""
from pathlib import Path
import json,hashlib,subprocess
root=Path.cwd();run=root/'research/runs/2026-10-23-sol-viewer-lighting-refinement';out=run/'resume-audit'
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
save=lambda p,v:p.write_text(json.dumps(v,indent=2)+'\n')
before=json.loads((out/'before.json').read_text())['files']
changed=[p for p,d in before.items() if not (root/p).is_file() or h(root/p)!=d]
paths=[x.decode() for x in subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).split(b'\0') if x]
new=sorted(set(paths)-set(before));outside=[p for p in new if not p.startswith(str(run.relative_to(root))+'/')]
assert not changed and not outside,(changed,outside)
save(out/'preservation.json',{'preexistingFilesChecked':len(before),'preexistingChangedOrMissing':changed,'newOutOfScopePaths':outside,'scope':'Tracked plus nonignored untracked files; excluded ignored build/cache outputs. All new recovery files are within refinement directory.'})
a=json.loads((out/'independent-evidence.json').read_text());m=json.loads((run/'capture-manifest.json').read_text());lint=json.loads((out/'lint-execution.json').read_text())
assert lint['exitCode']==0
v={'status':'evidence complete; human preference pending; no promotion','captures':a['captures'],'pairs':a['pairs'],'dimensions':a['dimensions'],'source':a['source'],'pins':a['pinsVerified'],'pairedCamerasTransformsAssignments':True,'completedCaptureSessions':a['sessions'],'modelRequestsPerSession':1,'finishAssignmentTransitionsPerSession':16,'sourceAndServedResponsePinsVerified':True,'historicalFilesVerifiedByPublishedChecksums':a['historicalFilesVerified'],'baselineParity':{'compared':16,'exactByteMatches':a['baselineExactBytes'],'nonidenticalFrames':6,'differingPixelsEach':5,'maxChannelDelta':12,'cause':'unisolated','detail':'resume-audit/independent-evidence.json'},'visualInspection':{'finishSheets':4,'nativePairSheets':7,'galleryPreviews':2,'parityNeighborhoods':30,'assessment':'notes.md; author inspection, not human preference'},'tests':{'unit':{'passed':27,'files':5,'evidence':'raw/unit-final.log','rerunOnRecovery':False},'plan':{'passed':2,'evidence':'raw/plan-final.log','rerunOnRecovery':False},'lint':{'exitCode':0,'evidence':'resume-audit/lint-execution.json','rerunOnRecovery':True},'build:app':{'result':'TypeScript and Vite build success in retained log','evidence':'raw/build-final.log','warning':'chunk >500 kB','rerunOnRecovery':False},'liveAppE2E':{'run':False,'scope':'pending until selecting default'}},'recovery':{'captureReplay':False,'sourceEdits':False,'interruptedOwnerExitStatus':None,'interruptionCause':None,'failureDisclosure':'notes.md','preservation':'resume-audit/preservation.json','newAuditWarning':'Pillow getdata deprecation, nonfatal'},'originalDefaultRetained':True,'promotion':False,'runJsonCreated':False,'blockers':[],'pending':['Human preference/default selection','Live-app E2E if proposing default change']}
save(run/'verification.json',v)
# Inventory excludes only itself and SHA256SUMS to avoid recursive hashes.
files=sorted(p for p in run.rglob('*') if p.is_file() and p.name not in ['artifact-inventory.json','SHA256SUMS'])
entries=[{'path':str(p.relative_to(run)),'bytes':p.stat().st_size,'sha256':h(p)} for p in files]
counts={'nativeCaptures':len(list((run/'rendered').glob('*.png'))),'contactSheets':len(list((run/'sheets').glob('finish-*.png'))),'nativePairSheets':len(list((run/'sheets').glob('native-*.png'))),'galleryPreviews':len(list(run.glob('gallery-*.png'))),'resumeInspectionImages':len(list(out.glob('*.png'))),'inventoryEntries':len(entries)}
save(run/'artifact-inventory.json',{'counts':counts,'scope':'All regular run files except this inventory and SHA256SUMS; excludes no historical run files. SHA256SUMS includes the inventory.','files':entries})
checksumfiles=files+[run/'artifact-inventory.json']
(run/'SHA256SUMS').write_text(''.join(f'{h(p)}  {p.relative_to(run)}\n' for p in sorted(checksumfiles)))
print(json.dumps({'counts':counts,'preservedFiles':len(before),'changedPreexisting':changed,'outOfScope':outside,'checksumEntries':len(checksumfiles)},indent=2))
