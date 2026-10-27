from pathlib import Path
from PIL import Image
import json, hashlib, shutil
from datetime import datetime, timezone

root=Path.cwd()
run_id='2026-10-27-sol-qwen-imagery'
base=Path('research/runs')/run_id
assert not base.exists(), 'Refuse to overwrite archive'
started=datetime.now(timezone.utc)
base.mkdir()
def write(name,value):
    (base/name).write_text(value)
def dump(name,value):
    write(name,json.dumps(value,indent=2,ensure_ascii=False)+'\n')
def inspect(path):
    data=path.read_bytes()
    with Image.open(path) as im:
        im.load()
        dims=list(im.size)
    return {'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'dimensions':dims}
source=Path('research/runs/2026-10-26-sol-ground-contact/followup-runtime-pairs/after-Carmine-side.png')
output=Path('work/Qwen_image_2.1_00001.png')
info=Image.open(output).info
prompt=json.loads(info['prompt'])
workflow=json.loads(info['workflow'])
positive=prompt['459:484']['inputs']['on_false']
assert prompt['459:484']['inputs']['switch'] is False
for path in [source,output]:
    shutil.copyfile(path,base/path.name)
    public=Path('public/assets/study/ai-imagery')/path.name
    public.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(path,public)
write('prompt.json',info['prompt'])
write('workflow.json',info['workflow'])
write('effective-positive.txt',positive)
dump('embedded-metadata.json',info)
input_meta=inspect(source)
output_meta=inspect(output)
sampler={k:v for k,v in prompt['459:458']['inputs'].items() if not isinstance(v,list)}
metadata={
 'caseId':'case01','observedAt':started.isoformat(),
 'observationBasis':'Local retrospective inspection/registration; not original generation or cloud download time. No EXIF/mtime-derived execution claims.',
 'input':input_meta,'output':output_meta,
 'cloudInputFilename':prompt['470']['inputs']['image'],
 'cloudInputChangeToken':prompt['470'].get('is_changed'),
 'inputLinkBasis':'Jay UI operation and reviewed workflow screenshot associate the uploaded original Carmine side image with this run. Local source copy/hash verified. Cloud hashed filename differs from the local SHA-256. The embedded is_changed token DOES equal the local source SHA-256; this is corroborating embedded metadata, not independent retrieval/authentication of remote uploaded bytes.',
 'effectivePositivePrompt':positive,
 'effectivePromptTrace':['459:474 TextEncodeQwenImage21.prompt','459:480 PreviewAny.source','459:484 ComfySwitchNode switch=false on_false'],
 'negativePrompt':prompt['459:474']['inputs']['negative_prompt'],
 'models':{key:prompt[node]['inputs'][field] for key,node,field in [('diffusion','459:451','unet_name'),('textEncoder','459:453','clip_name'),('vae','459:454','vae_name')]},
 'sampler':sampler,
 'inputTrace':'459:474 images.image_1 -> 470 LoadImage; only one connected image; SaveImageAdvanced 461 -> VAEDecode 459:457 -> KSampler 459:458',
 'sizing':{'resolution':prompt['459:474']['inputs']['resolution'],'latentSwitch':prompt['459:468']['inputs']['switch'],'basis':'Qwen conditioning latent selected, not disconnected EmptyLatentImage 1024x1024. Actual PNG dimensions are authoritative.'},
 'unusedEnhancer':'459:479 system prompt / 459:500 TextGenerate branch is not the effective positive prompt: 459:484 switch=false. Thinking false on unused branch is not evidence of enhancer execution.',
 'interpretation':'Generative image editing, not GLB or material mutation. Denoise 1.0 inside this Qwen reference-conditioning graph is not generic img2img preservation semantics.',
 'generation':{'startedAt':None,'endedAt':None,'runtimeSeconds':None,'cost':None,'jobId':None,'basis':'Unknown; embedded settings are not authenticated execution/billing history or a reproducibility guarantee.'},
 'authorship':{'image':'Qwen Image 2.1','promptAndGuidance':'Sol','cloudUIExecutionAndReview':'Jay','archiveAndTechnicalReview':'Sol (declared gpt-6.1-sol runtime)','astra':'Not AI-image author; historical source geometry attribution retained.'}
}
dump('metadata.json',metadata)
write('prompt.md','# Retrospective registration request\n\nArchive the actual first Qwen image, embedded graph/workflow, exact original source copy and technical review. Register a separate interpretive case01 render study; preserve the accepted 3D checkpoint and all history. Include the first image in the local report with clear fidelity limits. No generation, installation, purchase, commit, push or deployment. Two further manual generations are authorized as a maximum, not performed.\n\nThe effective image-edit instruction is preserved byte-for-byte in effective-positive.txt and traced in metadata.json.\n')
write('notes.md', '''# First AI-enhanced imagery — retrospective technical review

## Decision and attribution
Include this actual first image as interpretive research, not as faithful product photography certification or improved 3D geometry/materials. Qwen Image 2.1 generated the image; Sol supplied the prompt and UI guidance; Jay operated Comfy Cloud and reviewed it. Astra did not author this image. Historical CarConcept source/derivative attribution remains intact. The accepted GLB, material parameters and lighting implementation are unchanged.

Jay's exact feedback: 'it does feel substantial and only minor "halucinating". i tihnk it's worthy to put in our report. could we maybe try running a couple more? and let's keep track of all oyur technical notes as well as the workflow'. This approves report inclusion of the first image and a bounded continuation; it is not blanket fidelity, publication or spending approval.

## Visual review of actual native PNGs
Sol viewed both original files directly. The generated version has a more convincing studio floor transition and broad contact shadow; tire rubber and paint/glass reflections read more photographically. The broad red coupe identity and side-oriented view remain recognizable, without establishing exact silhouette/proportion/camera equality. Output is 864×768 versus source 850×778, so this is not an aligned pixel comparison. Neither native file has been resized, retouched or cropped in the archive/public copies.

Fidelity regressions: wheel spoke/hub detail and tire tread are reconstructed rather than exactly preserved; the lower side trim is reshaped and a diagonal seam near the rear wheel is introduced. Door/panel and roof/window boundaries differ; visible grain/highlight structure is synthesized and must not be called physically accurate metallic flake. Glazing is darker/reinterpreted and original fine interior detail is not independently preserved. The source's rear roof/deck bright detail changes. These are image-level observations, not measured geometry changes. Physical material accuracy and unseen views are unknown. Suitable for labelled concept/editorial exploration; faithful product imagery remains unproven. Preserve this result including defects rather than selecting only flattering regions.

## Recovered workflow
The original PNG retains prompt, workflow and aspect strings. prompt.json and workflow.json are exact embedded JSON strings extracted without PNG rewriting; embedded-metadata.json preserves all string values. Follow TextEncodeQwenImage21 459:474 → PreviewAny 459:480 → ComfySwitchNode 459:484, switch=false, on_false. Do not confuse the large inactive enhancer system prompt with the submitted studio instruction. The encoder has one image connection to node 470; negative prompt is empty. The KSampler has seed 891836227295375, euler/simple, 25 steps, CFG 1.0 and denoise 1.0. Exact models and connections are in metadata.json and prompt.json. This is Qwen reference-conditioned generation, not a claim that generic img2img denoise=1 preserves pixels. Automatic conditioning sizing produced the observed dimensions; the inactive 1024 square latent is not output evidence.

## Provenance limits and time
The input link rests on Jay's UI operation and workflow screenshot reported during the supervised flow, not independent verification of cloud-upload bytes. No standalone screenshot file is supplied in this archive. The cloud filename is a hash-shaped opaque name, not the locally verified input hash; The embedded is_changed token equals the locally measured input SHA-256, a useful corroboration; it still does not independently authenticate uploaded cloud bytes. Local source/output identities, bytes and dimensions are measured in metadata.json and output-inventory.json.

Original generation timestamps, duration, cloud job ID and credits/cost are unknown. The run schema's startedAt/endedAt/elapsedSeconds cover only the actually observed retrospective registration interval; they are NOT original generation runtime or billed model time. Manifest retrievedAt denotes local retrospective verification/copy, not original retrieval. No missing execution fields are inferred from mtime or invented. Embedded workflow/settings alone do not authenticate cloud execution or ensure exact reproducibility. See continuation.md for the frozen, not-yet-executed plan.
''')
continuation={'caseId':'case01','status':'frozen_not_executed','maxAdditionalGenerations':2,'executedAdditionalGenerations':0,'actualAdditionalOutputs':[],'inputSha256':input_meta['sha256'],'effectivePositivePrompt':positive,'settings':sampler,'varyOnly':'seed','plannedSeeds':None,'cost':None,'runtimeSeconds':None,'noAutomaticExecution':True}
dump('continuation.json',continuation)
write('continuation.md','''# Frozen continuation — maximum two additional manual generations

Status: NOT EXECUTED. No additional output, seed, job ID, time, cost or result is registered. This is still case01, not a case02 asset study.

1. Jay manually uses the same original after-Carmine-side.png (verify the SHA-256 in metadata.json), not the enhanced output as a new input. Reopen the archived workflow and verify the single input connection. Keep the exact effective-positive.txt, empty negative prompt, model files, reference-conditioned automatic sizing, disabled enhancer branch and every sampler setting unchanged except seed. Run count/batch stays one per manual action; stop after at most two additional generations.
2. Choose a fresh seed for each attempt; no prospective seed is claimed as executed. Record the actual executed seed from the downloaded PNG/history, because a displayed randomized seed can advance after execution. No automatic paid calls are authorized; Jay must inspect costs/entitlement before each manual execution. Cost/runtime remain unknown until actual history supplies them; subscription does not establish free execution.
3. Download each original Save Image (Advanced) PNG before another run; export the workflow before changing anything. Retain all results and failures, including unattractive or drifting ones. Do not overwrite the first result. Archive actual prompt/workflow metadata, input identity, models, sampler settings, native dimensions/hash/bytes and available history/job/timing/credits. If execution fails retain the actual failure rather than fabricating an image or a completed record.
4. Review each against the immutable original: photographic appeal separately from wheels/tread, silhouette/proportions, lights, glass, seams, trim and invented grain/details. Label side-by-side unequal-size images, not pixel-aligned evidence. Report the complete bounded set; do not silently cherry-pick or expand the batch. New report inclusion is a separate decision; first-image approval does not imply acceptance of future results.
''')
shutil.copyfile('work/ai-archive-before.json',base/'before.json')
for name in ['app','e2e','archive']:
    shutil.copyfile(f'work/ai-red-{name}.log',base/f'red-{name}.log')
manifest_path=Path('research/asset-manifest.json')
manifest=json.loads(manifest_path.read_text())
license_url=next(a for a in manifest['assets'] if a['id']=='web-product-estuary-safe')['licenseUrl']
ids=['qwen-imagery-source','qwen-imagery-first-result']
for id_,file,title,author in [
(ids[0],source.name,'Original Carmine viewer input for Qwen imagery','Sol browser capture; Unity Fan, DGG and Eric Chadwick source credits and Astra-directed Safe geometry retained'),
(ids[1],output.name,'First Qwen Image 2.1 interpretation — not improved 3D','Qwen Image 2.1 image generation; Sol prompt/guidance and technical review; Jay Comfy Cloud UI execution/review; Unity Fan, DGG, Eric Chadwick and historical source derivative credits retained')]:
    m=inspect(base/file)
    assert not any(a['id']==id_ for a in manifest['assets'])
    manifest['assets'].append({'id':id_,'title':title,'kind':'image','sourceUrl':f'urn:run:{run_id}','immutableUrl':'urn:sha256:'+m['sha256'],'author':author,'license':'CC-BY-4.0 inherited from CarConcept; AI interpretation and source/derivative credits disclosed','licenseUrl':license_url,'retrievedAt':started.isoformat(),'bytes':m['bytes'],'sha256':m['sha256'],'localPath':f'public/assets/study/ai-imagery/{file}','status':'available','notes':f'Exact native PNG copy of {base/file}. Dimensions {m["dimensions"]}. Local retrospective verification/copy timestamp, not original generation/retrieval. '+('Original input; cloud name does not authenticate uploaded bytes.' if id_==ids[0] else 'Interpretive generated image, not mesh/material improvement or faithful design certification. Jay approved first-image report inclusion. Cloud terms/output-rights not independently audited; this records inherited source attribution, not a new legal guarantee.')})
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
# Keep the existing two cases and frozen accepted 3D checkpoint, adding navigation only.
index_path=Path('research/case-studies/index.json')
index=json.loads(index_path.read_text())
case=next(c for c in index['cases'] if c['id']=='case01')
case['assetIds'].extend(ids)
case['runIds'].append(run_id)
index_path.write_text(json.dumps(index,indent=2)+'\n')
overview=Path('research/case-studies/case01/README.md')
overview.write_text(overview.read_text()+f'\n\n## Separate interpretive imagery addendum\n\n[First Qwen image archive](../../runs/{run_id}/notes.md): actual native source/result and embedded workflow; Qwen generation, Sol prompt/guidance, Jay UI execution. First-image report inclusion approved; fidelity remains qualified. [Frozen continuation](../../runs/{run_id}/continuation.md) permits at most two additional manual generations, neither executed. This addendum does not change the frozen accepted 3D checkpoint or open case02.\n')
ended=datetime.now(timezone.utc)
outputs=[str(p) for p in sorted(base.iterdir()) if p.is_file()]+[f'public/assets/study/ai-imagery/{p.name}' for p in [source,output]]
run={'id':run_id,'title':'First Qwen AI-enhanced imagery — interpretive case01 retrospective registration','startedAt':started.isoformat(),'endedAt':ended.isoformat(),'model':'Qwen Image 2.1 (embedded settings); Sol gpt-6.1-sol registration','provider':'Comfy Cloud (Jay manual UI); Sol openai-codex registration','interface':'Jay-operated Comfy Cloud; Sol prompt/guidance and local retrospective review','reasoningMode':'Not applicable to image diffusion; enhancer branch not selected','tools':['Comfy Cloud UI (Jay)','Pillow metadata inspection','terminal','file','native image visual review'],'workPackage':'render','inputAssets':['primary-product','web-product-estuary-safe',ids[0]],'promptPath':str(base/'prompt.md'),'outputPaths':outputs,'provenance':{'lane':'non_astra_authored_baseline','outputs':[{'path':p,'lane':'non_astra_authored_baseline','sourceAssets':['web-product-estuary-safe',ids[0]]} for p in outputs]},'elapsedSeconds':(ended-started).total_seconds(),'cost':{'amount':None,'currency':'USD','basis':'Unknown original cloud generation cost/runtime. Schema interval measures retrospective archival registration only, not original generation or active/billed time.'},'interventionLevel':3,'outcome':'partial','failureNotes':'Photographic improvement is subjective; wheel/tread reconstruction, trim/seam changes and synthesized grain limit fidelity. Input/output dimensions differ. Cloud input link is supervised UI/screenshot evidence, not independent upload-byte verification. Original execution time/job ID/cost unknown. Two additional manual generations are not executed.','reviewer':'Sol native-image technical review; Jay subjective approval of first-image report inclusion','publicSummary':'Case01 interpretive AI-enhanced imagery: Qwen generated the first image from the supervised original-input flow; Sol prompt/guidance, Jay manual UI execution. Not Astra image authorship or mesh/material improvement. Photographic appeal improves but wheels/tread, trim/seams and grain drift. Native 850×778 input and 864×768 output are not pixel aligned. Dates/elapsed interval denote retrospective registration only; original runtime/cost unknown. First image approved for report inclusion; two further manual generations planned, not executed.'}
dump('run.json',run)
print(json.dumps({'registered':run_id,'input':input_meta,'output':output_meta,'interval':run['elapsedSeconds']},indent=2))
