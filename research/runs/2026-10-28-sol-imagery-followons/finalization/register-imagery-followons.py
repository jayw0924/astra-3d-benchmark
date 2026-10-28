from pathlib import Path
import json,hashlib,shutil,datetime,re
from PIL import Image
root=Path('/workspace'); src=root/'work/ai-imagery-followup'; run=root/'research/runs/2026-10-28-sol-imagery-followons'; run.mkdir(exist_ok=False)
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
def dump(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
def ident(p):return {'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
# Immutable copies, not runnable web content. Exclude interpreter caches only.
copies=[]
for p in sorted(src.rglob('*')):
 if not p.is_file() or '__pycache__' in p.parts:continue
 dst=run/'artifacts'/p.relative_to(src);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dst)
 assert p.read_bytes()==dst.read_bytes()
 copies.append({'source':str(p.relative_to(root)),'archive':str(dst.relative_to(root)),**ident(dst)})
side=root/'research/runs/2026-10-27-sol-qwen-imagery/after-Carmine-side.png'
first=root/'research/runs/2026-10-27-sol-qwen-imagery/Qwen_image_2.1_00001.png'
for p in [side,first]:
 dst=run/'inputs'/p.name;dst.parent.mkdir(exist_ok=True);shutil.copyfile(p,dst)
 copies.append({'source':str(p.relative_to(root)),'archive':str(dst.relative_to(root)),**ident(dst)})
dump(run/'archive-inventory.json',copies)
public=root/'public/assets/study/ai-imagery/followons';public.mkdir(exist_ok=False)
items=[('location','qwen-location/original-output.png'),('flux','flux-kontext-pro/original-output.png'),('repeat','repeatability-original-seed/repeat-original-seed.png'),('protected-source','protected-background/source.png'),('composite-01','protected-background/composite-01.png'),('composite-02','protected-background/contact-shadow-02/composite-02.png'),('protection-mask','protected-background/mask.png'),('empty-plate','protected-background/received-background-01/original-qwen-background.png'),('shadow-layer','protected-background/contact-shadow-02/shadow-layer.png')]
assets=[];privacy=[]
for name,rel in items:
 p=run/'artifacts'/rel;im=Image.open(p);im.load()
 # Review embedded metadata without executing graphs; URLs are upstream docs/models, opaque image refs/graph UUIDs retained.
 strings=json.dumps(im.info)
 bad=re.findall(r'/(?:home|Users|workspace)/[^\s"<>]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|Bearer\s+[A-Za-z0-9._-]+|"(?:api_key|password|access_token|refresh_token)"\s*:',strings,re.I)
 assert not bad,(name,bad)
 dst=public/(name+'.png');shutil.copyfile(p,dst)
 item={'id':'imagery-followon-'+name,'publicPath':str(dst.relative_to(root)),'archivePath':str(p.relative_to(root)),**ident(dst),'dimensions':list(im.size)};assets.append(item)
 privacy.append({'file':item['publicPath'],'metadataKeys':list(im.info),'credentialOrPrivatePathMatches':bad,'review':'Upstream template/model documentation and opaque cloud image references/editor graph IDs retained; not authentication or privacy/rights certification. No executable public download.'})
dump(run/'public-assets.json',assets);dump(run/'privacy-review.json',privacy)
conditions={'registrationOnly':True,'registeredAt':start,'cloudJobId':None,'cloudRuntimeSeconds':None,'cloudCost':None,'freshSamplingProven':False,'conditions':[{'id':'protected-background','status':'completed','cloudOutputsReceived':1,'source':'front three-quarter, not planned side','result':'composite02 visual approval; zero protected changes; composite01 floating failure retained','approval':'artifacts/protected-background/contact-shadow-02/user-approval.json'},{'id':'original-seed-repeat','status':'completed','cloudOutputsReceived':1,'source':'original side','result':'identical decoded RGBA and execution graph; cache versus fresh sampling unknown'},{'id':'second-model','status':'completed','cloudOutputsReceived':1,'source':'original side','result':'Flux Kontext Pro; photographic gain but camera/design drift and invented emblem; not a strict model-only comparison'},{'id':'location','status':'completed','cloudOutputsReceived':1,'source':'original side','result':'Qwen concrete/glass building on dry pavement; Jay visual approval, fidelity unproven','approval':'artifacts/qwen-location/user-approval.json'}]}
dump(run/'conditions.json',conditions)
manifest=json.loads((root/'research/asset-manifest.json').read_text());template=next(a for a in manifest['assets'] if a['id']=='qwen-imagery-seed42')
for a in assets:
 entry={**template,'id':a['id'],'title':'Case01 imagery follow-on: '+a['id'].removeprefix('imagery-followon-'),'sourceUrl':'urn:run:'+run.name,'immutableUrl':'urn:sha256:'+a['sha256'],'retrievedAt':start,'bytes':a['bytes'],'sha256':a['sha256'],'localPath':a['publicPath'],'author':'Qwen/Flux generation where applicable; Sol coordination, renderer-derived mask and deterministic shadow compositing; Jay UI operation and visual review; Unity Fan, DGG and Eric Chadwick source credits; historical Astra Safe geometry retained','license':'CC-BY-4.0 inherited CarConcept attribution; disclosed AI/composite derivative; output/service/marks rights not independently certified','notes':f"Exact native copy of {a['archivePath']}; dimensions {a['dimensions']}. Timestamp is retrospective local registration/copy, not cloud generation. Embedded metadata reviewed; opaque cloud refs retained; no obvious credential found, not privacy or rights certification. Research-only scripts are not public downloads. Flux raw emblem identity unverified; no endorsement or legal certification."}
 manifest['assets'].append(entry)
dump(root/'research/asset-manifest.json',manifest)
case=json.loads((root/'research/case-studies/index.json').read_text());case['cases'][0]['assetIds'] += [a['id'] for a in assets];case['cases'][0]['runIds'].append(run.name);dump(root/'research/case-studies/index.json',case)
(run/'prompt.md').write_text('# Finalize actual car imagery follow-ons\n\nRegister existing actual native outputs and reproducibility packets; feature visually approved location with original side input, retain all four conditions, failures and historical evidence. No generation, installs, GLB change, commit, push or deployment. This registration interval is not cloud execution time.\n')
(run/'notes.md').write_text('''# Current completion record — retrospective registration only

All four conditions have one actual received cloud output each. This publication performs no new generation. Sol coordinated prompts and local deterministic compositing/documentation; Jay operated/reviewed Comfy Cloud; Qwen/Flux generated image pixels. No new Astra authorship claim. Actual cost, runtime, job IDs and failed-job billing unknown. Ledger interval measures registration only, not cloud time or complete active work.

## Decisions

- Location is the featured editorial interpretation; Jay “love the last one!” is visual approval, not product fidelity. Concrete/glass dusk building and dry pavement superseded the protocol’s proposed rain-dark coastal scene. Broad side composition is retained, but wheel/tread/glazing reconstruction and unverified rear-tire white writing remain. No mark-free guarantee.
- Protected 02 is approved visually; all 107603 mask pixels (106452 core +1151 boundary) remain exact. Front-source masking intentionally differs from planned side. Source and masks are native 850x778. Binary edge coverage preserves original backdrop spill/glass/mirror reflections, not subpixel accuracy or new light transport.
- The actual empty Qwen plate is 864x768. Background-only cover is 876x778 with [13,0,863,778] crop, LANCZOS rounding recorded. 01 floating failure retained. 02 uses real unchanged rig ShadowMaterial alpha: black only, max alpha36, 11502 exposed changes versus01, none beyond support. No opaque source floor transfer. Diagnostic rerender residual16 pixels, max channel51, protected original RGB restored last. Disposable response alpha:true instrumentation disclosed.
- Original-seed repeat: complete execution graph equal, decoded RGBA identical; file bytes differ (editor workflow metadata). Cache versus fresh sampling unknown without cloud executed-node history. This is not fresh-compute determinism.
- Flux Kontext Pro seed42 guidance3 steps50 prompt_upsampling false; requested850:778, actual1104x944. Photographic studio improvement and invented hood emblem coexist with side→front-three-quarter, lights/nose/intake redesign. Faithful-product failure; no retouch or emblem brand attribution. Different workflow/sizing prevents model-only causal claim.

## Reproducibility and boundaries

`archive-inventory.json` maps original work paths to byte-exact copies. `artifacts/` includes complete actual packets excluding interpreter bytecode caches: source captures/telemetry and command/error logs; coverage/core/edge masks; actual plate and graphs; 01/02 composites; shadow layers/capture/assembly/test scripts; red/green/failure logs and approvals; repeat comparisons/graphs; Flux and location raw PNG/graphs/receipts. `inputs/` freezes the original side input and first output. Historical scripts still name their original work paths intentionally; do not blindly rerun exclusive writers into populated directories. Reproduction of captures needs original app rig and a local server, pinned model/browser prerequisites from receipts, fresh output directories and explicit path adaptation. This is an archived recipe, not a portable authenticated cloud replay. Do not run embedded PNG graphs merely to inspect them.

Historical cloud os.memfd_create failure remains in first Qwen evidence. Local RAF polling timeout, missing Playwright browser then installed-shell retry, absent numpy then Pillow assembly retry, and 01 integration failure are retained in artifact notes/logs. No invented commands or cloud timestamps. Earlier work-packet READMEs describe their then-pending review status; `conditions.json` and actual approvals are the current authority. Protocol v1 is unchanged, linked by an additive status addendum. Existing workflow-publication notes/inventories/registration and all historical image/model bytes are preserved. Case02 remains pending asset/Blender-first with zero actual runs. No viewer preview replacement, GLB change, new creative candidate or deployment.

Public PNGs are exact native copies. Metadata review found upstream documentation/model URLs, opaque input filenames and editor graph IDs, no obvious credentials/private paths; screening is not privacy or legal certification. Executable archives are not in public. Inherited CarConcept CC-BY-4.0 attribution and marks exclusion remain; generated Flux emblem has no certified identity/clearance. Visual consent is not technical or legal acceptance.
''')
end=datetime.datetime.now(datetime.timezone.utc).isoformat()
outputs=[str(p.relative_to(root)) for p in sorted(run.rglob('*')) if p.is_file()]+[a['publicPath'] for a in assets]
record={'id':run.name,'title':'Four completed car imagery follow-ons: protected composite, exact-seed repeat, Flux and featured Qwen location','startedAt':start,'endedAt':end,'model':'gpt-6.1-sol','provider':'openai-codex','interface':'Sol retrospective local registration of Jay-operated Comfy Cloud outputs; not authenticated cloud execution history','reasoningMode':'Not independently recorded','tools':['Comfy Cloud (Jay UI)','Qwen Image 2.1','Flux Kontext Pro','Python Pillow','Three.js','terminal','file'],'workPackage':'render','inputAssets':['primary-product','web-product-estuary-safe','qwen-imagery-source','qwen-angle-front-source'],'promptPath':str((run/'prompt.md').relative_to(root)),'outputPaths':outputs,'provenance':{'lane':'non_astra_authored_baseline','outputs':[{'path':p,'lane':'non_astra_authored_baseline','sourceAssets':['primary-product','web-product-estuary-safe','qwen-imagery-source','qwen-angle-front-source']} for p in outputs]},'elapsedSeconds':(datetime.datetime.fromisoformat(end)-datetime.datetime.fromisoformat(start)).total_seconds(),'cost':{'amount':None,'currency':'USD','basis':'Cloud charges/runtime and failed-job billing unknown; ledger interval is retrospective registration only, not generation or active time.'},'interventionLevel':3,'outcome':'pass_with_intervention','failureNotes':'Visual/editorial completion, not faithful-product certification. Floating01 retained; shadow repair local only. Flux emblem and view/design drift. Repeat cache/fresh-sampling unknown. No new cloud jobs.','reviewer':'Jay visual approvals and emblem observation; Sol technical checks, separate from fidelity/legal certification','publicSummary':'Four actual follow-ons completed: visually approved Qwen location and pixel-protected composite02; Flux photographic gain with invented emblem/design drift; original-seed repeat has identical decoded pixels but fresh sampling versus cache unknown. Sol coordination/local compositing, Jay cloud UI/review, Qwen/Flux pixels. Retrospective registration only; cloud runtime/cost unknown. Case02 unperformed; GLB unchanged.'}
dump(run/'run.json',record)
print('Archived',len(copies),'public',len(assets),'run',run.name)
