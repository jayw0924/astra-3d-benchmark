import json,hashlib,time,html
from pathlib import Path
from PIL import Image,ImageChops,ImageDraw,ImageStat
p=Path(__file__).resolve().parent
started=time.time()
records=json.loads((p/'captures.json').read_text())
assert len(records)==12
results=[]
for finish in ['Carmine Candy','Estuary Enamel']:
 for view in ['side','front','wheel']:
  a,b=[next(r for r in records if r['phase']==phase and r['finish']==finish and r['view']==view) for phase in ['before','after']]
  ta,tb=[r['telemetry'] for r in [a,b]]
  for field in ['camera','model','shadow','renderer']: assert ta[field]==tb[field],field
  assert ta['inspection']['meshes']==tb['inspection']['meshes']
  assert ta['floor']['position'][1]==-.003 and tb['floor']['position'][1]==.1585579729696714
  for r in [a,b]:
   assert hashlib.sha256((p/r['filename']).read_bytes()).hexdigest()==r['sha256']
   per=json.loads((p/Path(r['filename']).with_suffix('.json')).read_text())
   assert per['telemetry']==r['telemetry']
   assert per['modelSha256']=='01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'
   assert not per['errors']
  im1,im2=[Image.open(p/r['filename']).convert('RGB') for r in [a,b]]
  assert im1.size==im2.size==(850,778)
  assert all(max(ImageStat.Stat(im).stddev)>5 for im in [im1,im2])
  diff=ImageChops.difference(im1,im2);pixels=list(diff.getdata());w,h=im1.size
  changed=sum(any(px) for px in pixels);upper=pixels[:w*int(h*.55)]
  assert changed>0
  # Hand-selected interior body ROIs avoid the floor; diagnostic, not full segmentation.
  roi={'side':(260,335,550,395),'front':(250,350,500,420),'wheel':(490,205,780,300)}[view]
  roi_pixels=list(diff.crop(roi).getdata())
  result={'finish':finish,'view':view,'dimensions':[w,h],'changedPixels':changed,'maxChannelDelta':max(max(px) for px in pixels),'changedBBox':diff.getbbox(),'bodyInteriorROI':{'box':roi,'changedPixels':sum(any(px) for px in roi_pixels),'maxChannelDelta':max(max(px) for px in roi_pixels)},'upper55Percent':{'rows':int(h*.55),'changedPixels':sum(any(px) for px in upper),'maxChannelDelta':max(max(px) for px in upper)},'runtimeCameraModelMaterialsShadowRendererEqual':True}
  results.append(result)
  pair=Image.new('RGB',(w*2,h+35),'#eeeae1');pair.paste(im1,(0,35));pair.paste(im2,(w,35));d=ImageDraw.Draw(pair);d.text((12,10),f'{finish} {view} - BEFORE pinned HEAD',fill='black');d.text((w+12,10),'AFTER current receiver correction',fill='black');pair.save(p/f'pair-{finish.split()[0]}-{view}.jpg',quality=94)
  # Amplified difference is diagnostic; not a replacement for native pixels.
  diff.point(lambda v:min(255,v*8)).save(p/f'diff8x-{finish.split()[0]}-{view}.png')
old=json.loads((p/'historical-files-before.json').read_text())
for name,digest in old.items():assert hashlib.sha256((p.parent/name).read_bytes()).hexdigest()==digest,name
assert (p.parent/'before-captures.json').read_text()=='[]'
report={'imageCount':len(records),'pairCount':len(results),'historicalFileCount':len(old),'historicalPngCount':sum(n.endswith('.png') for n in old),'historicalFilesUnchanged':True,'upperRegionCaveat':'Upper 55% is a disclosed spatial diagnostic, NOT a floor/model segmentation. Nonzero changes there are not certified floor-only; cause unknown unless isolated.','pairs':results,'verificationElapsedSeconds':time.time()-started}
(p/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
rows=[]
for r in results:
 name=f"{r['finish'].split()[0]}-{r['view']}"
 rows.append(f'<section><h2>{html.escape(r["finish"])} {r["view"]}</h2><img src="pair-{name}.jpg" style="width:100%"><p><a href="before-{name}.png">Native before</a> · <a href="after-{name}.png">Native after</a> · <a href="diff8x-{name}.png">8× difference</a> · <a href="before-{name}.json">Before telemetry</a> · <a href="after-{name}.json">After telemetry</a></p><pre>{html.escape(json.dumps(r,indent=2))}</pre></section>')
(p/'index.html').write_text('<!doctype html><meta charset="utf-8"><title>Grounding follow-up: actual runtime pairs</title><style>body{background:#eeeae1;color:#222;font:16px system-ui;margin:24px auto;max-width:1700px}section{border-top:1px solid #aaa;margin-top:30px}pre{white-space:pre-wrap}</style><h1>Grounding follow-up — 6 desktop pairs / 12 new native framebuffers</h1><p>Before: pinned ffe0a56982a0bb22c34d705b1c00f0a62d147a0f lighting module; after: snapshotted current receiver fix. Actual camera position/quaternion/projection/target, model transforms/material assignments and shadow settings are asserted equal per pair. Both arms have same-frame telemetry. 500 ms RAF pacing on software SwiftShader; not performance evidence. No mobile or full finish/trim matrix. User visual approval pending.</p><p>All prior artifacts remain historical and unchanged. These new captures do not repair missing historical camera telemetry. Pixel changes outside the obvious floor region, when present, remain disclosed and unattributed; upper-region counts are diagnostic, not a floor-only certification. See <a href="notes.md">notes</a>, <a href="verification.json">verification</a> and <a href="provenance.json">source/timing provenance</a>.</p>'+''.join(rows))
print(json.dumps(report,indent=2))
