"""Narrow lighting-ledger closeout. No capture replay or historical inventory rewrite.
Run prepare once; run checks read-only; run records after evidence collection.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
import sys
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[4]
FINAL = Path(__file__).resolve().parent
PACKAGES = [ROOT / 'research/runs' / n for n in [
    '2026-10-23-sol-viewer-lighting',
    '2026-10-23-sol-viewer-lighting-refinement',
    '2026-10-26-sol-lighting-integration',
]]
ASSET = 'web-product-estuary-safe'
LANE = 'non_astra_authored_baseline'

def now():
    return datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')

def read(p):
    return json.loads(p.read_text())

def write(p, value):
    p.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def relative(p):
    return str(p.relative_to(ROOT))

def prepare():
    assert not (FINAL / 'current-acceptance.json').exists(), 'Prepare is one-shot'
    for d in PACKAGES:
        (FINAL / (d.name + '-historical-notes.md')).write_bytes((d / 'notes.md').read_bytes())
    acceptance = {
        'recordedAt': now(),
        'feedbackSource': 'Exact user-provided finalization context; occurrence timestamps unavailable, not reconstructed.',
        'reviewer': 'Jay',
        'selectedRecipe': 'grounded-studio-refined',
        'verbatimFeedbackInOrder': [
            "holy shit! now we're getting somehwere. still some issues but we have made some major progress, nice work!",
            'i’m happy with this as a published checkpoint.',
        ],
        'decision': 'Subjective acceptance of integrated lighting as a published checkpoint, with residual issues explicitly retained.',
        'doesNotCertify': ['geometry fidelity', 'material realism', 'objective physical realism', 'mobile-device quality', 'production-GPU performance', 'exhaustive transition or arbitrary-angle correctness'],
        'technicalEvidence': 'Separate historical verification.json files plus read-only closeout checks; technical attestation is not Jay approval.',
        'historicalPreference': relative(PACKAGES[1] / 'preference.json'),
        'historicalState': 'Preserved, including earlier pending labels in frozen manifests, verification, gallery and logs; this record supersedes only their current approval status.',
        'publication': 'Approved checkpoint intent. No commit, push or deployment performed by this finalizer; operational authorization/execution remains with parent/user.',
        'remainingReleaseGates': [
            'Parent confirms explicit operational authorization and final reviewed publication file set before staging/commit/push/deploy.',
            'Parent runs joined final-tree release checks (including app build and desired browser acceptance) and reviews generated projection/current public copy.',
            'After authorized push/deployment, verify remote commit/deployment and served asset/application behavior; local approval does not prove remote publication.',
        ],
        'separateFutureQualityGatesNotClaimedForCheckpoint': ['Physical mobile-device/gesture testing', 'Exhaustive ordered live finish transitions', 'Production-GPU timing', 'Geometry/material diagnosis under frozen accepted lighting'],
        'authorship': 'Sol gpt-6.1-sol / openai-codex research closeout with verbatim human feedback; declared runtime identity, not authenticated single-model session-export evidence.',
    }
    write(FINAL / 'current-acceptance.json', acceptance)
    (FINAL / 'notes.md').write_text('''# Lighting checkpoint — current evaluator closeout

This directory is an additive finalization package inside the integration run, not a fourth experiment. `before.json` inventories all three packages before writes. Original notes are copied byte-for-byte here before append-only status updates. Historical SHA256SUMS, artifact inventories, manifests, preferences, verification, logs and galleries are not rewritten. Their “pending/original default/no run.json” statements describe their historical boundary, not current acceptance. Do not rerun historical package writers to make those claims current.

`current-acceptance.json` contains Jay’s exact feedback and its deliberately limited scope. Technical checks are evaluator attestations, distinct from Jay’s subjective approval. Software Chromium mobile emulation is not physical-mobile certification. Geometry/material concerns remain unresolved; no model bytes, source recipe or application code are changed by finalization.

All three run records attribute Sol `gpt-6.1-sol` / `openai-codex` from declared runtime/task context, not an authenticated exported transcript. The schema’s `non_astra_authored_baseline` lane means non-Astra research/tooling/human work; it does not mean no AI authored it. Rendered model images are `mixed` because the accepted sourced/model-assisted asset contributes content. Human prompts/preferences and post-run finalization are separately scoped; no Astra authorship is claimed for lighting.

Timing: startedAt is an explicitly identified retained evidence boundary (first capture timestamp for comparison packages, pre-edit inventory time for integration), not a reconstructed launch time. endedAt is the actual record-finalization boundary. elapsedSeconds is their calendar interval, including interruption, idle and later closeout; it is NOT active model runtime or billed time. Historical folder dates do not establish execution dates (refinement captures occurred October 25 UTC). Full original runtime, token usage and cost are unavailable. No invented cost or performance score.

Historical verifier caveats: comparison verify.mjs pins now-superseded application sources; rerunning it against the integrated tree is expected to fail those source pins, not establish corrupt historical images. Current checks call its existing validateEvidence API, independently decode/hash retained captures and verify retained telemetry; they disclose changed source pins. Integration verify.py writes images/verification/gallery and asserts the old whole-tree boundary, so it is intentionally NOT rerun. Reconciliation uses read-only checks instead. Raw/session-*.json are browser-render telemetry, NOT private Hermes session exports. No transcript is introduced.

Release gates and non-gates are in current-acceptance.json. Publishing checkpoint intent is not evidence of remote commit/deployment. This task never stages, commits, pushes or deploys. New test logs carry actual start/end and exit records. Full live capture rerenders are not required merely to record already retained evidence, and were not repeated here.
''')
    for d in PACKAGES:
        with (d / 'notes.md').open('a') as handle:
            handle.write('\n\n## Current finalization status — ' + acceptance['recordedAt'] + '\n\n'
                'The preceding text is preserved historical evidence. It is superseded for current status by '
                '`../2026-10-26-sol-lighting-integration/finalization-2026-10-26/current-acceptance.json` '
                '(from this package directory). Jay accepted `grounded-studio-refined`, now integrated locally, '
                'as a published checkpoint with residual issues. This is not geometry/material realism, objective realism '
                'or physical-mobile certification. Complete Sol run records and additive evaluator checks now exist; '
                'historical inventories, captures, preferences and verification bytes remain unchanged. '
                'Earlier pending/default/no-run statements above and in frozen artifacts describe their original boundary. '
                'No staging, commit, push or deployment is performed by this finalization. '
                'The new run timing extends only an observed retained-evidence boundary through record finalization, '
                'not measured active runtime; cost is unavailable.\n')
    print('Prepared separate current acceptance; appended status to three notes only.')

def checks():
    from collections import Counter
    before = read(FINAL / 'before.json')
    changes = []
    for name, old in before['files'].items():
        p = ROOT / name
        if not p.exists() or digest(p) != old['sha256']:
            assert p.name == 'notes.md' and p.parent in PACKAGES, name
            historical = FINAL / (p.parent.name + '-historical-notes.md')
            assert digest(historical) == old['sha256']
            assert p.read_bytes().startswith(historical.read_bytes())
            changes.append(name)
    assert len(changes) == 3
    assert all(digest(ROOT / p) == h for p, h in before['protected'].items()), 'Protected source changed'
    model = ROOT / 'public/assets/models/product-estuary-safe.glb'
    assert digest(model) == '01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'
    assert model.stat().st_size == 9239404
    matrices = []
    for d, expected in zip(PACKAGES[:2], [72, 32]):
        manifest = read(d / 'capture-manifest.json')
        assert len(manifest['images']) == expected
        assert len({x['id'] for x in manifest['images']}) == expected
        for image in manifest['images']:
            p = d / image['path']
            assert digest(p) == image['sha256'] and p.stat().st_size == image['bytes']
            with Image.open(p) as img:
                img.load()
                assert img.size == (600, 400)
            assert image['changedPixels'] > 200
            assert len(image['assignments']) == 25 and all(x['verified'] for x in image['assignments'])
        for name in manifest['sessions']:
            s = read(d / name)
            assert not s['errors'] and not any(x['type'] == 'error' for x in s['consoleMessages'])
            assert s['modelRequests'] == 1 and s['transitions'] == 16
            assert s['metrics']['servedHash'] == digest(model)
            assert s['disposal']['environmentRestored'] and s['disposal']['shadowFlagsRestored']
        matrices.append({'package': d.name, 'captures': expected, 'sessions': len(manifest['sessions']),
            'supersededSourcePins': [p for p,h in manifest['pins'].items() if digest(ROOT / p) != h]})
    original = read(PACKAGES[0] / 'capture-manifest.json')
    refined = read(PACKAGES[1] / 'capture-manifest.json')
    parity = []
    for im in refined['images']:
        if im['rig'] != 'grounded-studio':
            continue
        old = next(x for x in original['images'] if x['id'] == im['id'])
        with Image.open(PACKAGES[0] / old['path']) as a, Image.open(PACKAGES[1] / im['path']) as b:
            diff = ImageChops.difference(a.convert('RGB'), b.convert('RGB'))
            count = sum(any(pixel) for pixel in diff.getdata())
            maximum = max(v[1] for v in diff.getextrema())
        parity.append({'id': im['id'], 'exactPNG': im['sha256'] == old['sha256'], 'differingPixels': count, 'maxChannelDelta': maximum})
    assert Counter(x['differingPixels'] for x in parity) == {0:10, 5:6}
    d = PACKAGES[2]
    verification = read(d / 'verification.json')
    assert len(verification['initialFinishCases']) == 8
    for case in verification['initialFinishCases']:
        data = read(d / (case['label'] + '-inspection.json'))
        assert not data['errors'] and data['served']['sha256'] == digest(model)
        for state in [data['initial'],data['final']]:
            assert state['recipe'] == 'grounded-studio-refined' and state['environment']
            assert state['shadows']['enabled'] and not state['shadows']['autoUpdate']
            assert abs(state['floorY'] - state['bounds']['min'][1] + .003) < 1e-8
            assert len(state['meshes']) == 107
            mapped = [m for m in state['meshes'] if 'expectedMaterial' in m]
            assert len(mapped) == 25
            for mesh in state['meshes']:
                assert mesh['castShadow'] == all(not m['transparent'] for m in mesh['materials'])
            assert all([m['index'] for m in mesh['materials']] == [mesh['expectedMaterial']] for mesh in mapped)
    for name in verification['passingCaseLogs']:
        assert '1 passed' in (d / name).read_text()
    for project in ['chromium','mobile-chromium']:
        trans = read(d / (project + '-carmine-candy-transitions.json'))
        assert [x['finish'] for x in trans] == ['Estuary Enamel','Carmine Candy']
        assert trans[1]['shadowUpdates'] > trans[0]['shadowUpdates']
    for im in read(d / 'images.json'):
        p = d / im['path']
        assert digest(p) == im['sha256'] and p.stat().st_size == im['bytes']
        with Image.open(p) as img:
            img.load()
            assert img.size == (im['width'],im['height'])
    assert all(digest(ROOT / p) == h for p,h in verification['sourceHashes'].items())
    tracked = subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
    tracked = [p for p in tracked if p]
    private = [p for p in tracked if (p.endswith('.jsonl') and Path(p).name != 'commands.jsonl') or re.search(r'(^|/)(\.env(?:\.[^/]+)?|[^/]*\.(?:pem|key)|credentials[^/]*)$',p) and not p.endswith('.env.example')]
    # Public command ledgers are JSONL but not private session exports. Validate their shape.
    command_ledgers = []
    allowed_keys = {'command','argv','cwd','elapsedSeconds','endedAt','finishedAt','exitCode','exitStatus','startedAt','stderr','stdout','log','event','executionId','stderrPath','stdoutPath','timestamp'}
    for name in tracked:
        if name.endswith('/commands.jsonl'):
            rows = [json.loads(line) for line in (ROOT / name).read_text().splitlines() if line.strip()]
            assert rows and all(isinstance(row,dict) and set(row) <= allowed_keys for row in rows), name
            command_ledgers.append({'path':name,'rows':len(rows),'allowlistedCommandRecordShape':True})
    assert not private, private
    candidates = {ROOT / p for p in tracked} | {p for d in PACKAGES for p in d.rglob('*') if p.is_file()}
    patterns = [re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
        re.compile(rb'\b(?:sk-[A-Za-z0-9_-]{32,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16})\b'),
        re.compile(rb'(?i)(?:api[_-]?key|access[_-]?token|password)\s*[=:]\s*[\"\x27][A-Za-z0-9_+/=-]{20,}[\"\x27]')]
    findings=[]
    for p in candidates:
        if p.suffix.lower() not in {'.json','.md','.txt','.log','.jsonl','.js','.mjs','.ts','.tsx','.py','.html','.yaml','.yml','.toml'}:
            continue
        data=p.read_bytes()
        if any(pattern.search(data) for pattern in patterns): findings.append(relative(p))
    assert not findings, findings
    result={'checkedAt':now(),'scope':'Independent read-only retained-evidence checks; not new browser execution or image aesthetic review.',
        'preexistingFilesChecked':len(before['files']),'appendOnlyNotes':changes,'allOtherHistoricalBytesPreserved':True,
        'protectedSourceHashesUnchanged':True,'matrices':matrices,'baselineParity':parity,
        'integrationFinishCases':8,'integrationNativeAfterImages':len(list(d.glob('after-refined-*-native.png'))),
        'allRetainedPNGsDecoded':sum(1 for d in PACKAGES for p in d.rglob('*.png')),
        'privacy':{'trackedFilesScanned':len(tracked),'candidateFiles':len(candidates),'trackedPrivatePaths':private,'credentialPatternFindings':findings,'publicCommandLedgers':command_ledgers,
        'scopeLimit':'Pattern/path scan is not a proof of absence of all possible secrets; no matching credential values printed. Raw session JSON is browser telemetry, not session export.'}}
    # Decode every PNG including rejected and supplementary images, not only canonical captures.
    for d in PACKAGES:
        for p in d.rglob('*.png'):
            with Image.open(p) as img: img.load()
    print(json.dumps(result,indent=2))

def records():
    boundary=now()
    start_sources=[]
    for d in PACKAGES[:2]:
        manifest=read(d/'capture-manifest.json')
        first=min(manifest['images'],key=lambda im: im['timestamp'])
        start_sources.append((first['timestamp'],{'path':relative(d/'capture-manifest.json'),'field':'images timestamp','id':first['id']}))
    epoch=read(PACKAGES[2]/'inventory.json')['time']
    start_sources.append((datetime.fromtimestamp(epoch,timezone.utc).isoformat().replace('+00:00','Z'),{'path':relative(PACKAGES[2]/'inventory.json'),'field':'time','unixSeconds':epoch}))
    timing={'finalizedAt':boundary,'scope':'Observed retained-evidence boundaries through this record finalization; NOT full original or active runtime. Original launch times and cost unavailable.','runs':{}}
    for d,(start,source) in zip(PACKAGES,start_sources):
        timing['runs'][d.name]={'startedAt':start,'source':source,'endedAt':boundary,'endBoundary':'Actual records finalization clock, not historical execution completion'}
    write(FINAL/'timing-boundaries.json',timing)
    for i,(d,(start,source)) in enumerate(zip(PACKAGES,start_sources)):
        outputs=sorted(relative(p) for p in d.rglob('*') if p.is_file() and p.name!='run.json' and p.suffix!='.jsonl')
        if i==2:
            outputs += ['README.md','src/lib/threeViewer.ts','src/lib/viewerLighting.ts','src/lib/viewerLighting.test.ts','src/lib/threeViewer.integration.test.ts','tests/e2e/lighting.spec.ts','src/generated/study-data.json']
            outputs=sorted(set(outputs))
        elapsed=(datetime.fromisoformat(boundary.replace('Z','+00:00'))-datetime.fromisoformat(start.replace('Z','+00:00'))).total_seconds()
        summary=[
            '72 fixed-lighting captures across three rigs and four finishes; retained negative glass/shadow observations. Historical original-default boundary superseded by later refined integration, accepted by Jay only as a lighting checkpoint.',
            '32 refinement captures / 16 pairs. Baseline replay: 10 exact PNGs; six frames differ at five pixels each, maximum channel delta 12, cause unisolated. Jay selected refined lighting; residual geometry/material concerns remain.',
            'Refined lighting integrated locally. Eight retained isolated desktop/emulated-mobile finish cases verify served GLB and actual mapped materials; bounded round trips and controls verified. Jay accepts published lighting checkpoint; no geometry/material realism, physical-mobile or performance certification. No remote publication performed.',
        ][i]
        run={'id':d.name,'title':['Sol controlled viewer lighting — preserved 72-case experiment','Sol bounded studio refinement — selected lighting, preserved 32-case evidence','Sol refined lighting integration — Jay-approved publication checkpoint'][i],
            'startedAt':start,'endedAt':boundary,'model':'gpt-6.1-sol','provider':'openai-codex','interface':'Hermes Agent with Docker terminal backend; declared runtime attribution, not authenticated session export',
            'reasoningMode':'not exposed by interface','tools':['terminal','file','browser','vision'],'workPackage':'integrate' if i==2 else 'render',
            'inputAssets':[ASSET],'promptPath':relative(d/'prompt.md'),'outputPaths':outputs,
            'provenance':{'lane':LANE,'outputs':[{'path':p,'lane':'mixed' if Path(p).suffix=='.png' or Path(p).name in {'notes.md','prompt.md','brief.md','preference.json','current-acceptance.json'} else LANE,'sourceAssets':[ASSET] if Path(p).suffix=='.png' else []} for p in outputs]},
            'elapsedSeconds':elapsed,'cost':{'amount':None,'currency':'USD','basis':'Not exposed/retained. Calendar evidence-to-finalization interval is not active runtime or billed time.'},
            'interventionLevel':2,'outcome':'pass_with_intervention',
            'failureNotes':'Original launch/full active runtime and billing unavailable. startedAt is first retained capture timestamp (comparison) or pre-edit inventory timestamp (integration); endedAt is later ledger finalization. Interval includes idle/interruption. Declared Sol attribution only; no private transcript fabricated. Historical pending labels intentionally preserved and superseded by current-acceptance.json. Original exit-137 causes unknown. Static historical source pins were superseded by integration; see separate checks. No physical-device, exhaustive live-transition, geometry/material realism or production-performance claim. See notes and finalization-2026-10-26 release gates.',
            'reviewer':'Sol additive evaluator reconciliation; existing technical evidence retained; Jay subjective checkpoint approval separately quoted in current-acceptance.json. No new independent human technical certification.',
            'publicSummary':summary}
        write(d/'run.json',run)
    print(json.dumps({'finalizationBoundary':boundary,'runs':[{'id':d.name,'outputs':len(read(d/'run.json')['outputPaths'])} for d in PACKAGES]},indent=2))

if __name__=='__main__':
    assert len(sys.argv)==2 and sys.argv[1] in {'prepare','checks','records'}
    {'prepare':prepare,'checks':checks,'records':records}[sys.argv[1]]()
