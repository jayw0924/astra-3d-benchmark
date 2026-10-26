"""Package real refinement captures; Pillow is evidence tooling only."""
from pathlib import Path
import json, hashlib, html, statistics
from PIL import Image, ImageDraw
here = Path(__file__).resolve().parent
m=json.loads((here/'capture-manifest.json').read_text())
rigs=['grounded-studio','grounded-studio-refined']
finishes=['Carmine Candy','Pearly Swirly','Torched Graphite','Estuary Enamel']
targets=['front-three-quarter','side','rear-three-quarter','glass']
images={x['id']:x for x in m['images']}
assert len(images)==32
(here/'sheets').mkdir(exist_ok=True)
for im in m['images']:
 b=(here/im['path']).read_bytes();assert hashlib.sha256(b).hexdigest()==im['sha256']
 with Image.open(here/im['path']) as p:p.load();assert p.size==(600,400)
for f,finish in enumerate(finishes):
 sheet=Image.new('RGB',(800,4*294),(240,238,232));d=ImageDraw.Draw(sheet)
 for row,target in enumerate(targets):
  for col,rig in enumerate(rigs):
   x,y=col*400,row*294;d.text((x+4,y+4),f'{rig} | {finish}',fill='black');d.text((x+4,y+16),target,fill='black')
   with Image.open(here/images[f'{rig}-{f}-{target}']['path']) as p:sheet.paste(p.resize((400,266)),(x,y+28))
 sheet.save(here/f'sheets/finish-{f}.png')
 for target in targets:
  if target!='glass' and f!=1:continue
  native=Image.new('RGB',(1200,428),(240,238,232));dd=ImageDraw.Draw(native)
  for col,rig in enumerate(rigs):
   dd.text((col*600+4,8),f'{rig} | {finish} | {target} | native 600x400',fill='black')
   with Image.open(here/images[f'{rig}-{f}-{target}']['path']) as p:native.paste(p,(col*600,28))
  native.save(here/f'sheets/native-{f}-{target}.png')
style='body{font:16px system-ui;background:#eeeae1;color:#242724;margin:24px}.row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}img{width:100%;height:auto}figure{margin:0}figcaption{padding:8px 0}@media(max-width:800px){.row{grid-template-columns:1fr}}'
parts=[f'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Bounded studio refinement</title><style>{style}</style></head><body><h1>Bounded studio refinement</h1><p>32 native images / 16 pairs. Left: accepted research grounded recipe. Right: one optional refined bundle. ORIGINAL LIVE DEFAULT UNCHANGED. Sol presentation experiment; not Astra work. Preference pending. No objective realism claim.</p><p>Unchanged model/material/camera/exposure1.05. 600x400 DPR1. Environment orientation/panel/light and floor-shadow bundle, not an isolated causal test. Click images for native pixels.</p><p><a href="notes.md">Observed tradeoffs and limitations</a> · <a href="brief.md">Preregistered brief</a></p>']
for f,finish in enumerate(finishes):
 parts.append(f'<section><h2>{finish}</h2>')
 for target in targets:
  parts.append(f'<h3>{target}</h3><div class="row">')
  for rig in rigs:
   src=images[f'{rig}-{f}-{target}']['path'];label=html.escape(f'{rig} — {finish} — {target}')
   parts.append(f'<figure><a href="{src}"><img src="{src}" width="600" height="400" alt="{label}"></a><figcaption>{label}</figcaption></figure>')
  parts.append('</div>')
 parts.append('</section>')
parts.append('</body></html>');(here/'index.html').write_text('\n'.join(parts))
summary={}
for rig in rigs:
 frames=[x for x in m['images'] if x['rig']==rig]
 summary[rig]={'captures':len(frames),'warmSamples':len(frames),'medianWarmSubmitFinishMs':statistics.median(x['warmSubmitFinishMs'] for x in frames),'rendererCountsDistinct':[dict(t) for t in sorted({tuple(sorted(x['counts'].items())) for x in frames})]}
(here/'diagnostics-summary.json').write_text(json.dumps({'scope':'16 image-associated warm synchronous submit+finish samples per rig; cumulative program caches; transmission passes counted; SwiftShader diagnostics only, no performance ranking. Each fresh context captures 2 cases per rig then switches once, one shared model load.','rigs':summary},indent=2)+'\n')
print('packaged',len(images),'native images; 4 contact sheets + 7 native-pair sheets')
