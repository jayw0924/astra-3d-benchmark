from pathlib import Path
from PIL import Image,ImageDraw,ImageChops
import hashlib,json
p=Path(__file__).resolve().parent;old=p.parent/'2026-10-21-sol-safe-correction-comparison'
h=lambda b:hashlib.sha256(b).hexdigest();current=json.loads((p/'capture-manifest.json').read_text());prior=json.loads((old/'capture-manifest.json').read_text());out=[];diagnostics=[]
(p/'native-comparisons').mkdir(exist_ok=True)
def save(im,name,sources,method,**extra):
 f=p/'native-comparisons'/name;assert not f.exists();im.save(f);out.append({'path':str(f.relative_to(p)),'sources':sources,'method':method,'sha256':h(f.read_bytes()),**extra})
for target in ['wipers','glass-edge']:
 for finish in ['estuary','carmine']:
  sources=[];ims=[]
  for label,base,manifest,model in [('CONTROL',p,current,'control'),('PREVIOUS CORRECTION',old,prior,'safe'),('FINAL',p,current,'safe')]:
   key=f'{model}--{target}--{finish}--shaded';rec=next(x for x in manifest['images'] if x['id']==key);b=(base/rec['path']).read_bytes();assert len(b)==rec['bytes'] and h(b)==rec['sha256'];ims.append(Image.open(base/rec['path']).convert('RGB'));sources.append({'label':label,'path':str((base/rec['path']).relative_to(Path.cwd())),'sha256':rec['sha256']})
  sheet=Image.new('RGB',(1800,428),'white');d=ImageDraw.Draw(sheet)
  for i,im in enumerate(ims):sheet.paste(im,(i*600,28));d.text((i*600+8,6),sources[i]['label']+' '+finish+' '+target,fill='black')
  save(sheet,f'{target}--{finish}--native-threeway.png',sources,'Exact native 600x400 images side-by-side; labels outside native pixels')
  pair=Image.new('RGB',(1200,428),'white');d=ImageDraw.Draw(pair)
  for i,j in enumerate([0,2]):pair.paste(ims[j],(i*600,28));d.text((i*600+8,6),sources[j]['label']+' '+finish+' '+target,fill='black')
  save(pair,f'{target}--{finish}--native-pair.png',[sources[0],sources[2]],'Exact native control/final 600x400 pair; no resizing')
  if target=='glass-edge':
   box=(390,290,455,355);crop=Image.new('RGB',(780,288),'white');d=ImageDraw.Draw(crop)
   for i,im in enumerate(ims):crop.paste(im.crop(box).resize((260,260),Image.Resampling.NEAREST),(i*260,28));d.text((i*260+8,6),sources[i]['label'],fill='black')
   save(crop,f'glass-edge--{finish}--seam-nearest4x.png',sources,'4x nearest-neighbor enlargement, not a new render or matrix image',crop=box)
   for region in [(415,320,425,342),(418,323,424,340)]:
    diff=ImageChops.difference(ims[0].crop(region),ims[2].crop(region));pix=list(diff.get_flattened_data());diagnostics.append({'finish':finish,'box':region,'controlFinalPixelIdentical':not diff.getbbox(),'controlFinalChangedPixels':sum(any(c for c in a) for a in pix),'priorFinalPixelIdentical':ims[1].crop(region).tobytes()==ims[2].crop(region).tobytes(),'scope':'Pixel diagnostic, not sole visual acceptance'})
(p/'native-comparison-manifest.json').write_text(json.dumps(out,indent=2)+'\n');(p/'seam-diagnostic.json').write_text(json.dumps(diagnostics,indent=2)+'\n')
print('Wrote',len(out),'labeled supplemental images; no prior candidate relabeled as FINAL.');print(json.dumps(diagnostics,indent=2))
