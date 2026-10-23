import json,hashlib,datetime
from pathlib import Path
from PIL import Image,ImageChops,ImageDraw
run=Path(__file__).parent
manifest=json.loads((run/'capture-manifest.json').read_text())
assert len(manifest['images'])==len({i['id'] for i in manifest['images']})==108
assert not manifest['errors']
records=[];diffs=[]
for im in manifest['images']:
 p=run/im['path'];b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==im['sha256'] and len(b)==im['bytes']
 image=Image.open(p);assert image.size==(600,400)
 assert im['changedPixels']>=200 and im['counts']['calls']>0
 assert len(im['assignments'])==25 and all(x['verified'] for x in im['assignments'])
 records.append({'id':im['id'],'dimensions':list(image.size),'sha256':im['sha256'],'bytes':len(b),'changedPixels':im['changedPixels'],'drawCalls':im['counts']['calls']})
 if im['model']=='mobile':
  ctrl=Image.open(run/im['path'].replace('mobile--','control--')).convert('RGB');cand=image.convert('RGB');d=ImageChops.difference(ctrl,cand);pixels=list(d.getdata());diffs.append({'target':im['target'],'variant':im['variant'],'mode':im['mode'],'changedPixels':sum(any(p) for p in pixels),'meanAbsoluteChannelDifference':sum(sum(p) for p in pixels)/(600*400*3),'maxChannelDifference':max(max(p) for p in pixels),'changedBoundingBox':d.getbbox()})
with (run/'image-verification.json').open('x') as f:json.dump({'allPassed':True,'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'count':len(records),'records':records,'differences':diffs,'interpretation':'Pixel diagnostics only; not human visual acceptance. No post-hoc quality threshold.'},f,indent=2)
(run/'sheets').mkdir(exist_ok=False)
targets=list(dict.fromkeys(i['target'] for i in manifest['images']));sheetRecords=[]
for target in targets:
 sheet=Image.new('RGB',(1200,660),'white');draw=ImageDraw.Draw(sheet)
 for row,mode in enumerate(['shaded','wireframe','silhouette']):
  for col,(variant,model) in enumerate([('estuary','control'),('estuary','mobile'),('carmine','control'),('carmine','mobile')]):
   p=run/'rendered'/f'{model}--{target}--{variant}--{mode}.png';im=Image.open(p).convert('RGB');sheet.paste(im.resize((300,200)),(col*300,row*220+20));draw.text((col*300+3,row*220+3),f'{target} {variant} {model} {mode}',fill='black')
 p=run/'sheets'/f'{target}.png';sheet.save(p);sheetRecords.append({'path':str(p.relative_to(run)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'dimensions':[1200,660],'thumbnailPanels':[300,200]})
with (run/'sheet-manifest.json').open('x') as f:json.dump({'sheets':sheetRecords,'limitations':'Contact sheets are downscaled convenience images; scored originals remain native 600x400. No visual inspection claimed.'},f,indent=2)
seams=[]
for v in ['estuary','carmine']:
 a=Image.open(run/'rendered'/f'control--glass-edge--{v}--shaded.png').convert('RGB');b=Image.open(run/'rendered'/f'mobile--glass-edge--{v}--shaded.png').convert('RGB')
 for box in [(415,320,425,342),(418,323,424,340)]:
  d=ImageChops.difference(a.crop(box),b.crop(box));seams.append({'variant':v,'box':box,'changedPixels':sum(any(p) for p in d.getdata())})
with (run/'seam-diagnostic.json').open('x') as f:json.dump(seams,f,indent=2)
print(json.dumps({'images':len(records),'sheets':len(sheetRecords),'shadedDifferences':[d for d in diffs if d['mode']=='shaded'],'silhouetteDifferences':[d for d in diffs if d['mode']=='silhouette' and d['variant']=='Estuary Enamel'],'seams':seams},indent=2))
