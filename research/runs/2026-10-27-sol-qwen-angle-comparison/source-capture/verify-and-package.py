import json, hashlib, pathlib, subprocess, datetime
from PIL import Image, ImageChops
root=pathlib.Path.cwd()
out=root/'work/ai-imagery-followup/source-captures/2026-10-27-current-carmine-two-angles'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(name,data):
    with (out/name).open('x') as f: json.dump(data,f,indent=2)
pre=json.loads((out/'preflight.json').read_text())
assert all(sha(root/p)==h for p,h in pre['preservedFiles'].items())
assert sorted(p.name for p in out.glob('*.png'))==['front.png','rear.png']
captures=[]
for view in ['front','rear']:
    p=out/(view+'.png'); c=json.loads((out/(view+'.json')).read_text()); t=c['telemetry']
    assert sha(p)==c['sha256']; assert c['modelBytes']==9239404
    assert c['modelSha256']=='01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'
    im=Image.open(p).convert('RGB'); assert im.size==(850,778)
    diff=ImageChops.difference(im,Image.new('RGB',im.size,im.getpixel((0,0))))
    bbox=diff.getbbox(); assert bbox and bbox[0]>0 and bbox[1]>0 and bbox[2]<850 and bbox[3]<778
    assert len(im.getcolors(850*778))>1000
    assert not c['errors']
    for k in ['position','quaternion','target']:
        assert all(abs(a-b)<1e-12 for a,b in zip(c['pose']['stable'][k],t['camera'][k]))
    assert t['floor']['position'][1]==.1585579729696714
    assert t['renderer']['dpr']==1
    assert t['renderer']['width']==850 and t['renderer']['height']==778
    assert t['renderer']['environment'] and t['renderer']['drawCalls']>0
    assert t['inspection']['recipe']=='grounded-studio-refined'
    for mesh in t['model']['meshes']:
        for material in mesh['materials']:
            if material['name'] in ['Rim1','Rim2']:
                assert material['metalness']==1 and material['roughness']==.24
    captures.append({'view':view+'-three-quarter','file':view+'.png','sha256':sha(p),'bytes':p.stat().st_size,'dimensions':list(im.size),'nonbackgroundBBox':bbox,'telemetry':view+'.json','camera':t['camera'],'azimuthFromModelFrontDegrees':c['pose']['azimuthFromModelFrontDegrees'],'elevationDegrees':c['pose']['elevationDegrees'],'visualReview':{'actualNativePNGInspected':True,'correctFrontOrRear':True,'substantialSideVisible':True,'fullCarUncropped':True,'visibleNearSideTireContacts':True,'limitations':'Far-side tires are naturally occluded; no claim all four tire contacts are simultaneously visible. Existing model material/geometry appearance retained; not a photorealism certification.'}})
a,b=[json.loads((out/(v+'.json')).read_text())['telemetry'] for v in ['front','rear']]
for key in ['model','lights','floor','shadow','renderer']: assert a[key]==b[key],key
assert a['inspection']['meshes']==b['inspection']['meshes']
assert subprocess.check_output(['git','diff','--','src','public','package.json','package-lock.json'],text=True)==''
# Copies are selected only after both actual native PNGs were visually inspected.
for c,v in zip(captures,['front','rear']):
    dest=root/'work/ai-imagery-followup'/('car-'+v+'-three-quarter.png')
    assert not dest.exists()
    with dest.open('xb') as f:f.write((out/c['file']).read_bytes())
    assert sha(dest)==c['sha256'];c['convenienceCopy']=str(dest.relative_to(root));c['copyHashEquality']=True
manifest={'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Exactly two fresh unchanged-current-app framebuffer sources, private user review only; no generation, run registration or publication.','head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'hostRepositoryPath':'/home/jay/projects/external/configurator-demo','captureCount':len(captures),'captures':captures,'sourcePins':json.loads((out/'commands.jsonl').read_text().splitlines()[0])['sourcePins'],'recipe':'grounded-studio-refined','receiverY':a['floor']['position'][1],'unchangedPairAssertions':['model transforms and every applied mesh material','lights','floor','shadow','renderer','variant assignments'],'preservedHistoricalAndSourceFileCount':len(pre['preservedFiles']),'allPreservedFilesHashEqual':True,'appPublicDependencyGitDiffEmpty':True,'instrumentation':a['instrumentation'],'renderer':a['renderer'],'orientationBasis':'Transformed precise bounds centers of actual BodyHeadlights minus BodyTaillights; horizontal front axis, equal longitudinal and lateral orbit components; no model transformation changes.','damping':'Disabled and updated to drain pending deltas before setting camera; re-enabled; 12 stable controls updates plus same-frame final camera verified within 1e-12.','issue':'First front command exited 1 after successfully persisting PNG and telemetry: JSON-readback comparison encountered undefined properties and negative zero. Preserved logs, verified saved front without recapture; normalized assertion for rear. Exactly two captures, no capture retries.','limits':['SwiftShader CPU with 500ms RAF scheduling instrumentation, not production GPU performance.','Framebuffer-only PNG; no DOM overlays, resizing, cropping, image synthesis or pixel retouching.','Technical source gate passed; Jay source preference/review and public publication remain pending.','SSH hostname is not available in the isolated container; use existing verified SSH host alias, not container hostname.']}
assert len(captures)==2
save('source-manifest.json',manifest)
print(json.dumps({'captureCount':2,'historicalSourceFilesPreserved':len(pre['preservedFiles']),'copiesVerified':True,'cameraPositions':[c['camera']['position'] for c in captures],'pngHashes':[c['sha256'] for c in captures]},indent=2))
