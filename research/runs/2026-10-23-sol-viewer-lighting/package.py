"""Local evidence packaging only; uses already-installed Pillow, not an app dependency."""
from pathlib import Path
import json, hashlib, html, statistics
from PIL import Image, ImageDraw
here = Path(__file__).resolve().parent
m = json.loads((here/'capture-manifest.json').read_text())
rigs = ['original', 'environment-only', 'grounded-studio']
finishes = ['Carmine Candy','Pearly Swirly','Torched Graphite','Estuary Enamel']
targets = ['front-three-quarter','side','rear-three-quarter','paint','glass','wheel']
images = {x['id']:x for x in m['images']}
(here/'sheets').mkdir(exist_ok=True)
for im in m['images']:
    b = (here/im['path']).read_bytes()
    assert hashlib.sha256(b).hexdigest()==im['sha256']
    with Image.open(here/im['path']) as p:
        p.load(); assert p.size==(600,400)
# Preview partial sheets are explicitly labelled incomplete; replace after full evidence exists.
for f,finish in enumerate(finishes):
    sheet=Image.new('RGB',(900,6*228),(240,238,232));d=ImageDraw.Draw(sheet)
    for row,target in enumerate(targets):
        for col,rig in enumerate(rigs):
            id=f'{rig}-{f}-{target}';x,y=col*300,row*228
            d.text((x+4,y+4),f'{rig} | {finish}',fill='black');d.text((x+4,y+15),target,fill='black')
            if id in images:
                with Image.open(here/images[id]['path']) as p: sheet.paste(p.resize((300,200)),(x,y+28))
            else:d.text((x+20,y+100),'NOT YET CAPTURED',fill='red')
    sheet.save(here/f'sheets/finish-{f}.png')
    # Native-detail rows preserve 600x400 pixels per panel, no image retouching.
    for target in ['paint','glass','wheel']:
        if not all(f'{rig}-{f}-{target}' in images for rig in rigs):continue
        detail=Image.new('RGB',(1800,428),(240,238,232));dd=ImageDraw.Draw(detail)
        for col,rig in enumerate(rigs):
            dd.text((col*600+5,7),f'{rig} | {finish} | {target} | native 600x400',fill='black')
            with Image.open(here/images[f'{rig}-{f}-{target}']['path']) as p:detail.paste(p,(col*600,28))
        detail.save(here/f'sheets/native-{f}-{target}.png')
        crop=Image.new('RGB',(900,328),(240,238,232));cd=ImageDraw.Draw(crop)
        for col,rig in enumerate(rigs):
            cd.text((col*300+3,7),f'{rig} | native center crop 300x300',fill='black')
            with Image.open(here/images[f'{rig}-{f}-{target}']['path']) as p:crop.paste(p.crop((150,50,450,350)),(col*300,28))
        crop.save(here/f'sheets/native-crop-{f}-{target}.png')
style='body{font:16px system-ui;background:#eeeae1;color:#242724;margin:24px}section{margin:32px 0}.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}img{width:100%;height:auto}figure{margin:0}figcaption{padding:8px 0}a{color:#164b62}@media(max-width:800px){.row{grid-template-columns:1fr}}'
parts=[f'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sol viewer lighting comparison</title><style>{style}</style></head><body><h1>Sol viewer lighting comparison</h1><p>{len(images)}/72 captured. Original remains default. Presentation experiment, not Astra geometry work. No preference selected. 600x400, DPR1, ACES exposure1.05; unchanged accepted GLB and paired cameras/materials.</p><p>Columns: original / environment-only / grounded studio. Click any image for native pixels. Broad reflections may obscure windshield/interior; inspect paint and wheel details before choosing.</p><nav>']
parts += [f'<a href="#finish-{f}">{html.escape(name)}</a> · ' for f,name in enumerate(finishes)]
parts+=['</nav>']
for f,finish in enumerate(finishes):
    parts.append(f'<section id="finish-{f}"><h2>{finish}</h2>')
    for target in targets:
        parts.append(f'<h3>{target}</h3><div class="row">')
        for rig in rigs:
            id=f'{rig}-{f}-{target}'
            if id not in images:continue
            src=images[id]['path'];label=f'{rig} — {finish} — {target}'
            parts.append(f'<figure><a href="{src}"><img src="{src}" width="600" height="400" alt="{label}"></a><figcaption>{label}</figcaption></figure>')
        parts.append('</div>')
    parts.append('</section>')
parts.append('</body></html>');(here/'index.html').write_text('\n'.join(parts))
if len(images)==72:
    summary={}
    for rig in rigs:
        frames=[x for x in m['images'] if x['rig']==rig]
        summary[rig]={'captures':len(frames),'warmSamples':len(frames),'warmSubmitFinishMs':{'min':min(x['warmSubmitFinishMs'] for x in frames),'median':statistics.median(x['warmSubmitFinishMs'] for x in frames),'max':max(x['warmSubmitFinishMs'] for x in frames)},'rendererCountsDistinct':[dict(t) for t in sorted({tuple(sorted(x['counts'].items())) for x in frames})]}
    (here/'diagnostics-summary.json').write_text(json.dumps({'scope':'24 image-associated warmed samples per rig; single frame each. Cache histories and host scheduling uncontrolled; synchronous submit+finish software-renderer diagnostics, no GPU ranking. Render calls/triangles include renderer-managed transmission passes. Shadow warm counts exclude cached shadow creation.','rigs':summary},indent=2)+'\n')
print('packaged',len(images),'frames')
