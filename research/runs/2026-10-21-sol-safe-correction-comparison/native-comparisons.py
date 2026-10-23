from pathlib import Path
from PIL import Image,ImageDraw
import hashlib,json
p=Path(__file__).resolve().parent;old=p.parent/'2026-10-21-sol-safe-webgl-comparison'
current=json.loads((p/'capture-manifest.json').read_text());prior=json.loads((old/'capture-manifest.json').read_text());out=[]
(p/'native-comparisons').mkdir(exist_ok=True)
for target in ['wipers','glass-edge']:
 for finish in ['estuary','carmine']:
  sources=[];ims=[]
  for label,base,manifest,model in [('CONTROL',p,current,'control'),('PRIOR REJECTED',old,prior,'safe'),('CORRECTED',p,current,'safe')]:
   key=f'{model}--{target}--{finish}--shaded';rec=next(x for x in manifest['images'] if x['id']==key);b=(base/rec['path']).read_bytes();assert len(b)==rec['bytes'] and hashlib.sha256(b).hexdigest()==rec['sha256'];ims.append(Image.open(base/rec['path']).convert('RGB'));sources.append({'label':label,'path':str((base/rec['path']).relative_to(Path.cwd())),'sha256':rec['sha256']})
  sheet=Image.new('RGB',(1800,428),'white');d=ImageDraw.Draw(sheet)
  for i,im in enumerate(ims):sheet.paste(im,(i*600,28));d.text((i*600+8,6),sources[i]['label']+' '+finish+' '+target,fill='black')
  f=p/'native-comparisons'/f'{target}--{finish}--native-threeway.png';sheet.save(f);out.append({'path':str(f.relative_to(p)),'sources':sources,'method':'Three exact native 600x400 images side-by-side; labels outside image pixels','sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
  if target=='glass-edge':
   box=(390,290,455,355);crop=Image.new('RGB',(780,288),'white');d=ImageDraw.Draw(crop)
   for i,im in enumerate(ims):crop.paste(im.crop(box).resize((260,260),Image.Resampling.NEAREST),(i*260,28));d.text((i*260+8,6),sources[i]['label'],fill='black')
   f=p/'native-comparisons'/f'glass-edge--{finish}--seam-nearest4x.png';crop.save(f);out.append({'path':str(f.relative_to(p)),'sources':sources,'crop':box,'method':'Explicit 4x nearest-neighbor enlargement of native crop; not a new render or part of 108 matrix','sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(p/'native-comparison-manifest.json').write_text(json.dumps(out,indent=2)+'\n');print('Wrote',len(out),'explicitly labeled supplements; prior images never relabeled as corrected.')
