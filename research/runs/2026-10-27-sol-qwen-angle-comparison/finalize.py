"""Rehash immutable evidence and refresh only this additive packet's registration."""
from register import ROOT, RUN, sha, write
from datetime import datetime, timezone
import json

before = json.loads((RUN / 'before.json').read_text())
checks = [{'path': p, 'beforeSha256': digest, 'afterSha256': sha(ROOT / p), 'unchanged': sha(ROOT / p) == digest} for p, digest in before['files'].items()]
assert all(x['unchanged'] for x in checks)
pins = json.loads((RUN / 'source-capture/source-manifest.json').read_text())['sourcePins']
assert all(sha(ROOT / p) == digest for p, digest in pins.items())
images = json.loads((RUN / 'image-inventory.json').read_text())['images']
for im in images:
    assert sha(ROOT / im['archivePath']) == im['sha256'] == sha(ROOT / im['publicPath'])
for c in json.loads((RUN / 'copy-verification.json').read_text())['copies']:
    assert sha(ROOT / c['to']) == c['sha256'] == sha(ROOT / c['from'])
write('integrity.json', {'observedAt': datetime.now(timezone.utc).isoformat(), 'protectedFileCount': len(checks), 'allProtectedUnchanged': True, 'acceptedSafeSha256': sha(ROOT / 'public/assets/models/product-estuary-safe.glb'), 'sourcePinsStillMatch': True, 'verifiedNativeImages': len(images), 'verifiedCopies': len(json.loads((RUN / 'copy-verification.json').read_text())['copies']), 'files': checks})
# Execution logs/results remain authoritative; initial failures retained alongside retries.
executions = {p.stem: json.loads(p.read_text()) for p in RUN.glob('*-execution.json')}
write('verification.json', {'observedAt': datetime.now(timezone.utc).isoformat(), 'protectedFileCount': len(checks), 'allProtectedUnchanged': True, 'sourcePinCount': len(pins), 'executions': executions, 'limits': ['Cloud job IDs/runtime/cost and submitted-job total unknown.', 'No new generation or heavy source capture; GLB requests aborted in focused page tests.', 'Lint/E2E first concurrent run failed: directory-scanning race and substring locator ambiguity; separate successful retries retained.']})
public = [im['publicPath'] for im in images]
run = json.loads((RUN / 'run.json').read_text())
paths = sorted(str(p.relative_to(ROOT)) for p in RUN.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name != 'run.json')
paths = sorted(set(paths + public + [str((RUN / 'output-inventory.json').relative_to(ROOT))]))
run['outputPaths'] = paths
run['provenance']['outputs'] = [{'path': p, 'lane': 'non_astra_authored_baseline', 'sourceAssets': run['inputAssets']} for p in paths]
write('run.json', run)
files = [ROOT / p for p in paths if (ROOT / p).is_file() and not p.endswith('/output-inventory.json')]
write('output-inventory.json', {'observedAt': datetime.now(timezone.utc).isoformat(), 'exclusions': ['This inventory excludes its own digest and run.json to avoid checksum cycles; run.json is separately schema-validated. Python __pycache__ is not research evidence.'], 'files': [{'path': str(p.relative_to(ROOT)), 'bytes': p.stat().st_size, 'sha256': sha(p)} for p in files]})
print('Verified', len(checks), 'protected files,', len(pins), 'source pins,', len(images), 'native images;', len(paths), 'registered outputs.')
