"""Register received evidence only. Refuses overwrites of image/archive copies."""
from register import ROOT, RUN, OLD, sha, write
from datetime import datetime, timezone
import copy
import json
import re
from shutil import copyfile
from PIL import Image

started = datetime.now(timezone.utc)
source = ROOT / 'work/ai-imagery-followup/source-captures/2026-10-27-current-carmine-two-angles'
receipt_root = OLD / 'angle-followup'
images = []
transfers = []
privacy = []

def retain(src, dest):
    assert not dest.exists(), dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    copyfile(src, dest)
    assert sha(src) == sha(dest)
    transfers.append({'from': str(src.relative_to(ROOT)), 'to': str(dest.relative_to(ROOT)), 'sha256': sha(dest), 'bytes': dest.stat().st_size})

# Retain original capture metadata/logs, including failed command, without rewriting history.
for src in sorted(source.iterdir()):
    if src.is_file():
        retain(src, RUN / 'source-capture' / src.name)
# Inspect key names rather than publishing secret values; hashes and change tokens are evidence, not credentials.
sensitive = re.compile(r'password|authorization|api[_-]?key|access[_-]?token|client[_-]?secret|cookie', re.I)
def inspect(value, location=''):
    if isinstance(value, dict):
        for key, val in value.items():
            assert not sensitive.search(key), f'Sensitive key at {location}/{key}'
            inspect(val, location + '/' + key)
    elif isinstance(value, list):
        for i, val in enumerate(value): inspect(val, location + f'/{i}')

side = json.loads((OLD / 'followup-seed42/prompt.json').read_text())
comparison = {'baseline': str((OLD / 'followup-seed42/prompt.json').relative_to(ROOT)), 'angles': {}, 'interpretation': 'Submitted graphs differ only at LoadImage: filename and is_changed token; selected effective prompt, branches, models and sampling/sizing policy match. This is input-angle variation, not proof of geometric camera preservation.'}
for angle in ['front', 'rear']:
    received = receipt_root / (angle + '-three-quarter')
    retain(received / 'receipt.json', RUN / f'{angle}-receipt.json')
    for kind, original in [('source', 'source.png'), ('generated-seed42', 'generated-seed42.png')]:
        dest = RUN / f'{angle}-{kind}.png'
        retain(received / original, dest)
        with Image.open(dest) as im:
            im.load()
            inspect(im.info)
            dims = list(im.size)
            privacy.append({'file': dest.name, 'metadataKeys': list(im.info), 'sensitiveKeyScan': 'pass; manual review of metadata/cloud opaque IDs and retained capture harness found no credentials', 'metadataPreserved': True})
            if kind == 'generated-seed42':
                for key in ['prompt', 'workflow']:
                    embedded = json.loads(im.info[key]); inspect(embedded)
                    assert embedded == json.loads((received / (key + '.json')).read_text())
                    write(f'{angle}-{key}.json', embedded)
        if kind == 'source':
            assert sha(dest) == sha(source / f'{angle}.png')
        public = ROOT / 'public/assets/study/ai-imagery/angles' / dest.name
        retain(dest, public)
        images.append({'angle': angle, 'role': kind, 'archivePath': str(dest.relative_to(ROOT)), 'publicPath': str(public.relative_to(ROOT)), 'sha256': sha(dest), 'bytes': dest.stat().st_size, 'dimensions': dims})
    graph = json.loads((RUN / f'{angle}-prompt.json').read_text())
    differences = []
    def diff(a, b, path=''):
        if isinstance(a, dict) and isinstance(b, dict):
            for key in sorted(a.keys() | b.keys()):
                if key not in a or key not in b: differences.append({'path': path + '/' + key, 'before': a.get(key), 'after': b.get(key)})
                else: diff(a[key], b[key], path + '/' + key)
        elif a != b: differences.append({'path': path, 'before': a, 'after': b})
    diff(side, graph)
    assert {d['path'] for d in differences} == {'/470/inputs/image', '/470/is_changed'}
    load = graph['470']; source_hash = sha(RUN / f'{angle}-source.png')
    assert load['is_changed'] == [source_hash]
    assert load['inputs']['image'].removesuffix('.png') != source_hash
    comparison['angles'][angle] = {
        'allSubmittedGraphDifferencesVsSide42': differences,
        'localSourceSha256': source_hash, 'cloudFilename': load['inputs']['image'],
        'isChangedMatchesLocalSource': True, 'filenameMatchesLocalSourceHash': False,
        'inputIdentityLimit': 'Corroborating embedded evidence plus supervised UI source instruction/receipt; not independent authentication of cloud bytes.',
        'effectivePositivePrompt': graph['459:484']['inputs']['on_false'],
        'promptRefinement': graph['459:484']['inputs']['switch'],
        'negativePrompt': graph['459:474']['inputs']['negative_prompt'],
        'sampler': graph['459:458']['inputs'],
        'models': {k: graph[k]['inputs'] for k in ['459:451', '459:453', '459:454']},
        'sizing': {'textEncodeResolution': graph['459:474']['inputs']['resolution'], 'selectedLatentBranch': graph['459:468']['inputs'], 'nativeInput': [850,778], 'nativeOutput': [864,768]},
    }
front = json.loads((RUN / 'front-prompt.json').read_text())
rear = json.loads((RUN / 'rear-prompt.json').read_text())
comparison['rearVsFrontChangedNodes'] = [key for key in front if front[key] != rear[key]]
assert comparison['rearVsFrontChangedNodes'] == ['470']
write('effective-comparison.json', comparison)
write('image-inventory.json', {'registeredAt': started.isoformat(), 'images': images, 'nativeCopies': True, 'alignment': 'None; input and output dimensions/aspects differ.'})
write('copy-verification.json', {'copies': transfers, 'allHashesEqual': True})
write('metadata-privacy-review.json', {'images': privacy, 'scope': 'Native PNG metadata (including parsed embedded prompt/workflow), reviewed opaque cloud filenames and graph ID; local telemetry/logs remain research-only. No credentials identified. Provider output rights not independently audited.'})
write('generation-status.json', {'successfulReceivedOutputs': 2, 'originalCloudStartedAt': None, 'originalCloudEndedAt': None, 'jobIds': None, 'durationSeconds': None, 'cost': None, 'submittedJobCount': None, 'additionalGenerationsDuringRegistration': 0, 'plannedNotExecuted': ['masked-background compositing', 'original-seed repeatability', 'second-model comparison', 'location imagery'], 'userPreference': None, 'protocolPath': 'research/protocols/car-ai-imagery-followup-v1.md'})

manifest_path = ROOT / 'research/asset-manifest.json'
manifest = json.loads(manifest_path.read_text())
source_template = next(a for a in manifest['assets'] if a['id'] == 'qwen-imagery-source')
generated_template = next(a for a in manifest['assets'] if a['id'] == 'qwen-imagery-seed42')
asset_ids = []
for im in images:
    asset = copy.deepcopy(source_template if im['role'] == 'source' else generated_template)
    asset['id'] = f"qwen-angle-{im['angle']}-{im['role']}"; asset_ids.append(asset['id'])
    asset['title'] = f"{im['angle'].title()} three-quarter {'viewer source' if im['role']=='source' else 'Qwen seed-42 interpretation — not improved 3D'}"
    asset['sourceUrl'] = 'urn:run:2026-10-27-sol-qwen-angle-comparison'
    asset['immutableUrl'] = 'urn:sha256:' + im['sha256']
    asset['retrievedAt'] = started.isoformat()
    asset['bytes'] = im['bytes']; asset['sha256'] = im['sha256']; asset['localPath'] = im['publicPath']
    asset['notes'] = f"Exact native copy of {im['archivePath']}; dimensions {im['dimensions']}. Retrospective registration/copy time, not original generation time. Current grounded source; interpretive output, not improved GLB or certified fidelity. No angle preference attributed to Jay. Native embedded graphs reviewed; cloud opaque input filenames/graph ID retained, no credentials identified. Cloud terms/output rights not independently audited; inherited attribution is not a legal guarantee."
    assert all(a['id'] != asset['id'] for a in manifest['assets'])
    manifest['assets'].append(asset)
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
index_path = ROOT / 'research/case-studies/index.json'
index = json.loads(index_path.read_text())
case = next(c for c in index['cases'] if c['id'] == 'case01')
case['assetIds'].extend(asset_ids); case['runIds'].append(RUN.name)
index_path.write_text(json.dumps(index, indent=2) + '\n')
ended = datetime.now(timezone.utc)
run = { 'id': RUN.name, 'title': 'Two-angle Qwen comparison — Sol coordination, Jay manual execution; retrospective registration', 'startedAt': started.isoformat(), 'endedAt': ended.isoformat(), 'model': 'Qwen Image 2.1 (embedded submitted graphs); Sol gpt-6.1-sol coordination/registration', 'provider': 'Comfy Cloud (Jay manual UI); Sol openai-codex registration', 'interface': 'Jay-operated cloud UI; Sol guidance, capture harness and retrospective local evidence registration', 'reasoningMode': 'Not applicable to image diffusion; prompt refinement off', 'tools': ['Comfy Cloud UI (Jay)', 'Pillow metadata inspection', 'terminal', 'file', 'native image visual review'], 'workPackage': 'render', 'inputAssets': ['primary-product','web-product-estuary-safe'] + [a for a in asset_ids if a.endswith('-source')], 'promptPath': str((RUN / 'prompt.md').relative_to(ROOT)), 'outputPaths': [], 'provenance': {'lane': 'non_astra_authored_baseline', 'outputs': []}, 'elapsedSeconds': (ended-started).total_seconds(), 'cost': {'amount': None, 'currency': 'USD', 'basis': 'Unknown original cloud generation cost/runtime. Observed schema interval measures retrospective lossless packet registration/copy only, not generation, capture, full review/session, active time or billed time.'}, 'interventionLevel': 3, 'outcome': 'partial', 'failureNotes': 'Both images reconstruct wheels/tread, trim, glazing and paint response; geometry and multiview coherence are not established. Actual cloud job IDs/time/cost unknown. Source front capture command exited 1 after PNG/telemetry persisted due to JSON readback undefined/-0 normalization; raw logs and readback recovery retained, no recapture. Four follow-on conditions remain planned.', 'reviewer': 'Sol native-image review; Jay source-angle approval and manual execution; no angle winner or blanket fidelity approval attributed', 'publicSummary': 'Case01 two-angle follow-up: exact front/rear current-grounded sources and two independent Qwen seed-42 interpretations. Qwen generation; Sol coordination/guidance/review; Jay manual Comfy Cloud execution. More photographic studio presentation, reconstructed product details; no improved GLB/materials or coherent 3D established. Cost, runtime and job IDs unknown. Ledger timestamps cover retrospective packet registration only. Masked-background, repeatability, second-model and location conditions remain planned, not results.' }
write('run.json', run)
print('Registered', len(images), 'native images;', len(transfers), 'verified copies. Run timestamps cover observed registration only.')
