"""Read-only independent evidence audit; writes resume-only reports, never captures."""
from pathlib import Path
import hashlib,json,subprocess
from PIL import Image,ImageChops,ImageDraw
root=Path.cwd();run=root/'research/runs/2026-10-23-sol-viewer-lighting-refinement';out=run/'resume-audit';prior=run.parent/'2026-10-23-sol-viewer-lighting'
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((run/'capture-manifest.json').read_text()); frozen=json.loads((run/'plan-frozen.json').read_text()); spec=json.loads((run/'control-spec.json').read_text())
assert m['matrix']==frozen['matrix'] and m['settings']==frozen['settings']
assert len(m['images'])==32 and {x['id'] for x in m['images']}=={x['id'] for x in m['matrix']}
for p,h in frozen['pins'].items(): assert hashfile(root/p)==h,p
source=root/spec['source']['path'];assert source.stat().st_size==spec['source']['bytes'] and hashfile(source)==spec['source']['sha256']
old={x['id']:x for x in json.loads((prior/'capture-manifest.json').read_text())['images']}
rows=[];pairs=[];diffs=[]
for im in m['images']:
 p=run/im['path'];assert hashfile(p)==im['sha256'] and p.stat().st_size==im['bytes']
 with Image.open(p) as a: a.load();assert a.size==(600,400); assert a.getextrema()!=((0,0),)*3
 assert im['camera']==spec['cameras'][im['target']] and im['transform']==spec['transform']
 partner=next(x for x in m['images'] if x['finish']==im['finish'] and x['target']==im['target'] and x['rig']!=im['rig'])
 for k in ['camera','transform','assignments']: assert im[k]==partner[k]
 rows.append({'path':im['path'],'bytes':p.stat().st_size,'sha256':hashfile(p),'dimensions':[600,400]})
 if im['rig']!='grounded-studio':continue
 a=Image.open(p).convert('RGB');b=Image.open(prior/old[im['id']]['path']).convert('RGB');d=ImageChops.difference(a,b);px=list(d.getdata());changed=[v for v in px if any(v)]
 row={'id':im['id'],'byteIdentical':hashfile(p)==hashfile(prior/old[im['id']]['path']),'differingPixels':len(changed),'maxChannelDelta':max((max(v) for v in changed),default=0),'differenceBounds':d.getbbox(),'coordinates':[[i%600,i//600,*v] for i,v in enumerate(px) if any(v)]}
 pairs.append(row)
 if changed:diffs.append((im['id'],a,b,row['coordinates']))
historical=[]
for line in (prior/'SHA256SUMS').read_text().splitlines():
 h,p=line.split('  ',1);assert hashfile(prior/p)==h,p;historical.append(p)
for p in m['sessions']:
 s=json.loads((run/p).read_text());assert s['modelRequests']==1 and s['transitions']==16 and not s['errors'];assert s['metrics']['servedHash']==spec['source']['sha256'];assert all(s['disposal'][k] for k in ['rendererShadowStateRestored','environmentRestored','shadowFlagsRestored'])
# Each tiny changed pixel gets its own 11x11 contextual crop at 4x, old then new.
canvas=Image.new('RGB',(900,len(diffs)*150),'#eeeae1');draw=ImageDraw.Draw(canvas)
for row,(name,a,b,coords) in enumerate(diffs):
 y=row*150;draw.text((5,y+3),name,fill='black')
 for col,(x,yy,*_) in enumerate(coords):
  left=col*180;draw.text((left+3,y+22),f'({x},{yy}) old / new',fill='black')
  for n,img in enumerate([b,a]):canvas.paste(img.crop((x-5,yy-5,x+6,yy+6)).resize((66,66),Image.Resampling.NEAREST),(left+3+n*76,y+43))
canvas.save(out/'parity-pixel-context.png')
result={'captures':len(rows),'pairs':len(pairs),'dimensions':[600,400],'pinsVerified':frozen['pins'],'source':spec['source'],'sessions':len(m['sessions']),'historicalFilesVerified':len(historical),'baselineExactBytes':sum(x['byteIdentical'] for x in pairs),'baselinePixelDifferences':pairs,'images':rows,'pairedCamerasTransformsAssignments':True}
(out/'independent-evidence.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['images','baselinePixelDifferences','pinsVerified']},indent=2))
