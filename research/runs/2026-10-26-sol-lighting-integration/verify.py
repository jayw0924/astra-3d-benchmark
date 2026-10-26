"""Verify local integration evidence without writing historical study data."""
import hashlib
import html
import json
import struct
import time
from pathlib import Path

root = Path.cwd()
run = root / 'research/runs/2026-10-26-sol-lighting-integration'
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

baseline = json.loads((run / 'inventory.json').read_text())['files']
changed = [name for name, pin in baseline.items() if not (root / name).is_file() or digest(root / name) != pin]
allowed = {'README.md', 'src/lib/threeViewer.ts', 'src/lib/viewerLighting.ts', 'src/lib/viewerLighting.test.ts', 'tsconfig.app.tsbuildinfo'}
assert not set(changed) - allowed, changed
model = root / 'public/assets/models/product-estuary-safe.glb'
assert model.stat().st_size == 9239404
assert digest(model) == '01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'

finishes = ['carmine-candy', 'pearly-swirly', 'torched-graphite', 'estuary-enamel']
inspections = []
for project in ['chromium', 'mobile-chromium']:
    for finish in finishes:
        label = f'{project}-{finish}'
        data = json.loads((run / f'{label}-inspection.json').read_text())
        assert data['errors'] == []
        assert data['served']['sha256'] == digest(model)
        for state in [data['initial'], data['final']]:
            assert state['recipe'] == 'grounded-studio-refined' and state['environment']
            assert state['shadows']['enabled'] and not state['shadows']['autoUpdate']
            assert abs(state['floorY'] - state['bounds']['min'][1] + .003) < 1e-8
            assert len(state['meshes']) == 107
            mapped = [mesh for mesh in state['meshes'] if 'expectedMaterial' in mesh]
            assert len(mapped) == 25
            for mesh in state['meshes']:
                assert mesh['castShadow'] == all(not m['transparent'] for m in mesh['materials'])
                if 'expectedMaterial' in mesh:
                    assert [m['index'] for m in mesh['materials']] == [mesh['expectedMaterial']]
        inspections.append({'label': label, 'meshes': 107, 'mapped': 25, 'errors': data['errors']})
    transitions = json.loads((run / f'{project}-carmine-candy-transitions.json').read_text())
    assert [x['finish'] for x in transitions] == ['Estuary Enamel', 'Carmine Candy']
    assert transitions[1]['shadowUpdates'] > transitions[0]['shadowUpdates']

images = []
for image in sorted(run.rglob('*.png')):
    width, height = struct.unpack('>II', image.read_bytes()[16:24])
    images.append({'path': str(image.relative_to(run)), 'width': width, 'height': height,
                   'bytes': image.stat().st_size, 'sha256': digest(image),
                   'accepted': 'attempts-cdp-viewport-clip' not in image.parts})
for project in ['chromium', 'mobile-chromium']:
    for finish in finishes:
        assert (run / f'after-refined-{project}-{finish}-native.png').is_file()
for layout in ['desktop', 'mobile']:
    assert (run / f'before-original-{layout}-native.png').is_file()

logs = ['e2e-desktop-reset-fixed.log', 'e2e-mobile-bounded-transitions.log',
        'e2e-desktop-pearly-retry.log', 'e2e-desktop-torched.log', 'e2e-desktop-estuary.log',
        'e2e-mobile-pearly-framebuffer.log', 'e2e-mobile-torched.log', 'e2e-mobile-estuary.log']
assert all('1 passed' in (run / name).read_text() for name in logs)
assert '36 passed' in (run / 'unit-final.log').read_text()
assert 'built in' in (run / 'build-app-final.log').read_text()
assert 'error' not in (run / 'lint-final.log').read_text().lower()
owner = root.stat().st_uid
ownership_issues = [str(p.relative_to(root)) for p in run.rglob('*') if p.stat().st_uid != owner]
assert not ownership_issues
assert all(p.stat().st_uid == owner for p in (root / '.git').rglob('*'))

(run / 'images.json').write_text(json.dumps(images, indent=2) + '\n')
verification = {'verifiedAtUnix': time.time(), 'baselineFiles': len(baseline), 'changedBaselineFiles': changed,
    'unexpectedBaselineChanges': [], 'scopeLimit': 'Content inventory excludes Git, dependencies, caches, build/report outputs and this run; tsconfig.app.tsbuildinfo is an expected build cache change.',
    'servedModelHash': digest(model), 'servedModelBytes': model.stat().st_size,
    'initialFinishCases': inspections, 'passingCaseLogs': logs, 'unitTests': 36,
    'lint': 'pass', 'buildApp': 'pass; chunk size warning', 'ownershipIssues': ownership_issues,
    'sourceHashes': {name: digest(root / name) for name in ['src/lib/threeViewer.ts','src/lib/viewerLighting.ts','src/lib/threeViewer.integration.test.ts','src/lib/viewerLighting.test.ts','tests/e2e/lighting.spec.ts']},
    'subjectiveApproval': 'pending final Jay review', 'commitPushDeployment': 'not authorized; not performed'}
(run / 'verification.json').write_text(json.dumps(verification, indent=2) + '\n')

parts = ['<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sol local lighting integration evidence</title>',
    '<style>body{font:16px system-ui;background:#202225;color:#eee;margin:24px}a{color:#a9d8ff}section{margin:40px 0}figure{margin:0 0 24px}img{display:block;max-width:100%;height:auto}h1,h2{font-weight:600}.pair{display:flex;gap:16px;flex-wrap:wrap}.pair figure{max-width:850px}figcaption{margin:10px 0;max-width:800px}</style>',
    '<h1>Sol — actual local viewer lighting integration</h1><p>Static evidence only. Final Jay approval pending; no commit, push or deployment. Not Astra geometry work.</p><p><a href="notes.md">Notes and limitations</a> · <a href="verification.json">Verification</a> · <a href="images.json">Image hashes</a></p>',
    '<p>Unchanged app default camera. DPR 1 SwiftShader; CPU animation pacing disclosed in notes. Original images contain the ready badge; refined images are actual app framebuffer exports. Open image links for native pixels. Do not infer material/geometry fidelity or subjective approval.</p>']
for layout, project in [('desktop','chromium'),('mobile','mobile-chromium')]:
    parts.append(f'<section><h2>{layout.title()} — original versus integrated refined (Carmine)</h2><div class="pair">')
    for label, filename in [('Before: original',f'before-original-{layout}-native.png'),('After: grounded-studio-refined',f'after-refined-{project}-carmine-candy-native.png')]:
        parts.append(f'<figure><figcaption>{label}</figcaption><a href="{filename}"><img src="{filename}" alt="{html.escape(label)} {layout}"></a></figure>')
    parts.append('</div></section>')
    parts.append(f'<section><h2>{layout.title()} — all four finishes, integrated refined</h2>')
    for finish in finishes:
        filename = f'after-refined-{project}-{finish}-native.png'
        parts.append(f'<figure><figcaption>{finish.replace("-", " ").title()} — native default camera</figcaption><a href="{filename}"><img src="{filename}" alt="{html.escape(finish)} {layout} refined"></a></figure>')
    parts.append('</section>')
parts.append('<section><h2>Camera orbit — fixed model and world-anchored shadow</h2><a href="after-refined-chromium-carmine-candy-orbit.png"><img src="after-refined-chromium-carmine-candy-orbit.png" alt="Carmine camera orbit"></a></section>')
(run / 'index.html').write_text('\n'.join(parts) + '\n')
print(json.dumps({'verified':True,'finishCases':len(inspections),'nativeAfterImages':len(list(run.glob('after-refined-*-native.png'))),'baselineChanged':changed,'imageRecords':len(images)},indent=2))
