from pathlib import Path
from datetime import datetime, timezone
from PIL import Image
import copy, hashlib, json, re, shutil
root=Path(__file__).resolve().parents[4]; b=root/'research/runs/2026-10-27-sol-qwen-imagery'; out=b/'finalization'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,x): p.write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
def diff(a,b,path=''):
 if type(a)!=type(b): return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):
  return [v for k in sorted(set(a)|set(b)) for v in diff(a.get(k),b.get(k),path+'/'+k)]
 if isinstance(a,list):
  if len(a)!=len(b): return [{'path':path,'before':a,'after':b}]
  return [v for i,(x,y) in enumerate(zip(a,b)) for v in diff(x,y,path+'/'+str(i))]
 return [] if a==b else [{'path':path,'before':a,'after':b}]
now=datetime.now(timezone.utc).isoformat()
original=b/'Qwen_image_2.1_00001.png'; ref=json.loads(Image.open(original).info['prompt']); refw=json.loads(Image.open(original).info['workflow'])
metadata=json.loads((b/'metadata.json').read_text()); manifest=json.loads((root/'research/asset-manifest.json').read_text()); casepath=root/'research/case-studies/index.json'; cases=json.loads(casepath.read_text()); records=[]
for seed,expected in [(42,'2aa56bf1c84163a1c0b39e9584d7b1d69413a1dff63298fac5b0a081e76492dd'),(12345,'e83966d523d0036451dfd7dcd3d7c5755dca38bc9fb3348e78b42721c83c0597')]:
 folder=b/f'followup-seed{seed}'; png=folder/f'Qwen_image_2.1_seed{seed}.png'; im=Image.open(png); im.load(); assert im.size==(864,768); assert sha(png)==expected
 g=json.loads(im.info['prompt']); w=json.loads(im.info['workflow']); assert g==json.loads((folder/'prompt.json').read_text()); assert w==json.loads((folder/'workflow.json').read_text())
 differences=diff(ref,g); assert {x['path'] for x in differences}=={'/459:458/inputs/seed','/459:500/inputs/sampling_mode.seed'}
 assert all(x['after']==seed for x in differences)
 assert g['470']==ref['470']; assert g['470']['is_changed']==[metadata['input']['sha256']]
 assert g['459:484']['inputs']['switch'] is False
 # Review native metadata before lossless public copying. No credentials/account paths are expected in this template.
 text=json.dumps(im.info)
 assert not re.search(r'Bearer\s+[A-Za-z0-9._-]+|sk-[A-Za-z0-9_-]{12,}|(?:api_key|access_token|password)\s*[\"\s:]+[A-Za-z0-9_-]{12,}',text,re.I)
 dest=root/'public/assets/study/ai-imagery'/png.name; shutil.copyfile(png,dest)
 asset=copy.deepcopy(next(x for x in manifest['assets'] if x['id']=='qwen-imagery-first-result'))
 asset.update(id=f'qwen-imagery-seed{seed}',title=f'Qwen Image 2.1 interpretation — seed {seed}, not improved 3D',retrievedAt=now,bytes=png.stat().st_size,sha256=expected,immutableUrl='urn:sha256:'+expected,localPath=str(dest.relative_to(root)),notes=f'Exact native PNG copy of {png.relative_to(root)}. Dimensions [864, 768]. Local finalization/copy timestamp, not generation time. Complete bounded comparison; no winner selected by Jay. Inherited source attribution retained, cloud terms/output rights not independently audited; no legal guarantee. Reviewed embedded metadata retains cloud opaque input filename and editor graph ID, no credential found. Separate graph exports remain research-only.')
 assert not any(x['id']==asset['id'] for x in manifest['assets']); manifest['assets'].append(asset); cases['cases'][0]['assetIds'].append(asset['id'])
 records.append({'seed':seed,'path':str(png.relative_to(root)),'publicPath':str(dest.relative_to(root)),'bytes':png.stat().st_size,'sha256':expected,'dimensions':list(im.size),'promptDifferencesFromFirst':differences,'editorWorkflowDifferencesFromFirst':diff(refw,w),'cloudInput':g['470'],'models':metadata['models'],'sampler':{k:g['459:458']['inputs'][k] for k in metadata['sampler']},'effectivePositivePrompt':g['459:484']['inputs']['on_false'],'refinePrompt':False,'generation':{'jobId':None,'runtimeSeconds':None,'cost':None}})
dump(root/'research/asset-manifest.json',manifest); dump(casepath,cases)
dump(out/'comparison.json',{'observedAt':now,'basis':'Actual PNG metadata, all graph leaf differences retained; not authenticated cloud execution history.','source':metadata['input'],'firstSeed':metadata['sampler']['seed'],'followups':records,'effectiveSettingsComparison':'Only active sampler seed differs. Inactive TextGenerate sampling_mode.seed also differs; editor layout/widget differences retained separately. All other submitted graph fields identical.','metadataPublicationReview':'Reviewed keys, graph values and URLs: public model/template documentation links, opaque cloud input filename, editor graph UUID/layout. No credential/account token found. No separate graph downloads were previously public or added; native PNG embedded metadata necessarily remains public unchanged.'})
p=json.loads((b/'continuation.json').read_text()); p.update(status='completed_bounded_comparison',executedAdditionalGenerations=2,actualAdditionalOutputs=[{'seed':x['seed'],'path':x['path'],'sha256':x['sha256']} for x in records],plannedSeeds=[42,12345],reportedFailedAdditionalAttempts=1,attemptedJobsFromUserSequence=4,attemptCountBasis='Three successful PNGs plus one user-reported failure; not authenticated cloud job history.',failureNotePath=str((b/'seed-42-failure-note.md').relative_to(root)),furtherGenerationAuthorized=False,preference=None,graphDifferenceNote='Active sampler seed and inactive text-enhancer seed changed; other submitted graph fields identical.',historyPath=str((out/'previous-continuation.json').relative_to(root)))
dump(b/'continuation.json',p)
(b/'continuation.md').write_text('''# Bounded continuation — completed

Two additional successful outputs are retained: seed 42 and seed 12345, both from the original source, not chained generated images. The first seed-42 attempt failed with the user-reported cloud AttributeError; the retry produced the actual seed-42 PNG. Three successes plus one reported failure imply four attempted jobs in the supplied sequence, not an authenticated cloud-history count. Original execution timestamps, runtime, job IDs and cost including failure remain unknown. No more generation is authorized.

The maximum two additional successful outputs are complete; the failed attempt and retry are not silently omitted from the attempt accounting. Compare actual embedded graphs in finalization/comparison.json: common source filename/is_changed corroboration, effective prompt, model files and all non-seed submitted parameters match. Active sampler seed and inactive text-enhancer seed differ. Refinement is false. This is corroborating embedded evidence, not independent verification of remote bytes or billing.

No winner is selected by Jay; original first-image report approval is retained separately from comparative preference. All outputs appear more photographic while reconstructing product details. See finalization/notes.md. Prior prospective plan and original run record are retained verbatim in finalization/previous-continuation.md, previous-continuation.json and previous-run.json. The original output-inventory.json and first technical notes are unchanged historical snapshots, not current inventories.
''')
r=json.loads((b/'run.json').read_text()); r['title']='Bounded three-output Qwen imagery comparison — interpretive case01 addendum'; r['failureNotes']='All three interpretations reconstruct wheel/tread, seams/trim and grain; seed 42 invents a door handle, seed 12345 shifts apparent roof/perspective/framing. One reported cloud KSampler AttributeError: missing os.memfd_create preceded successful seed-42 retry; root cause/fix unverified. Actual cloud job IDs/runtime/cost including failure unknown. Three successful PNGs, four attempted jobs inferred only from user sequence.'
r['publicSummary']='Case01 bounded interpretive comparison complete: original viewer source plus Qwen outputs with embedded seeds 891836227295375, 42 and 12345. Sol prompt/guidance and review; Jay manual Comfy Cloud execution. Two additional successful outputs and one retained reported cloud failure before retry; no winner selected by Jay. More photographic presentation does not establish design fidelity or improved mesh/materials. Original cloud runtime and cost including failure are unknown; ledger interval remains first retrospective registration only.'
r['reviewer']='Sol visual review of source and all three native PNGs; Jay first-image report approval, comparative preference pending'
r['outputPaths']=sorted(set(r['outputPaths'])|{x['publicPath'] for x in records}|{str(p.relative_to(root)) for p in b.rglob('*') if p.is_file() and p.name!='run.json'})
r['provenance']['outputs']=[{'path':p,'lane':'non_astra_authored_baseline','sourceAssets':['web-product-estuary-safe','qwen-imagery-source']} for p in r['outputPaths']]
dump(b/'run.json',r)
print('Published exactly two additional native PNG copies; updated case01/continuation/run; graph fields verified.')
