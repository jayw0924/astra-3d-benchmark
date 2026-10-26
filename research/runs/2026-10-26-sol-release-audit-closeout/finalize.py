"""Finalize only this release record; never rewrite old evidence."""
import datetime
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[3]
run = Path(__file__).resolve().parent

def save(path, data):
    path.write_text(json.dumps(data, indent=2) + "\n")

def identity(path):
    body = path.read_bytes()
    return {"bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()}

before = json.loads((run / 'before.json').read_text())
changed = [name for name, value in before['files'].items() if not (root / name).is_file() or identity(root / name) != value]
allowed = ['research/asset-manifest.json', 'research/protocol.md', 'research/ASTRA_HANDOFF.md', 'research/ASTRA_MOBILE_LOD_HANDOFF.md', 'research/SAFE_WEBGL_INTEGRATION.md', 'licenses/THIRD_PARTY_ASSETS.md']
unexpected = sorted(set(changed) - set(allowed))
save(run / 'integrity.json', {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'preexistingFileCount': len(before['files']), 'changed': changed, 'unexpectedChanges': unexpected, 'allHistoricalRunFilesUnchanged': not any(name.startswith('research/runs/') for name in changed)})
assert not unexpected, unexpected
copies = {
    'public/assets/viewer/refined-estuary-native.png': 'research/runs/2026-10-26-sol-lighting-integration/after-refined-chromium-estuary-enamel-native.png',
    'public/licenses/Basis-Universal-APACHE-2.0.txt': 'licenses/upstream/Basis-Universal-APACHE-2.0.txt',
    'public/licenses/Basis-Universal-NOTICE.md': 'licenses/upstream/Basis-Universal-NOTICE.md',
}
for destination, source in copies.items():
    assert (root / destination).read_bytes() == (root / source).read_bytes()
outputs = allowed + ['package.json', 'src/App.tsx', 'src/App.test.tsx', 'src/styles.css', 'tests/e2e/showcase.spec.ts', 'tests/e2e/release-assets.spec.ts', 'scripts/release-audit.test.mjs', 'scripts/release-status.test.mjs'] + list(copies)
save(run / 'output-inventory.json', {'recordedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': {name: {**identity(root / name), **({'exactSourceCopy': copies[name]} if name in copies else {})} for name in outputs}})
outputs += ['src/generated/study-data.json']
outputs += sorted(str(p.relative_to(root)) for p in run.iterdir() if p.is_file() and p.name != 'run.json')
end = datetime.datetime.now(datetime.timezone.utc)
record = {
    'id': run.name, 'title': 'Sol narrow release audit closeout — public copies and historical labels',
    'startedAt': before['startedAt'], 'endedAt': end.isoformat(),
    'model': 'gpt-6.1-sol', 'provider': 'openai-codex',
    'interface': 'Hermes subagent Docker terminal; declared runtime attribution, no authenticated session export',
    'reasoningMode': 'not exposed by interface', 'tools': ['terminal', 'file'],
    'workPackage': 'integrate', 'inputAssets': ['primary-product', 'web-product-estuary-safe', 'refined-viewer-preview'],
    'promptPath': str((run / 'prompt.md').relative_to(root)), 'outputPaths': outputs,
    'provenance': {'lane': 'non_astra_authored_baseline', 'outputs': [
        {'path': name, 'lane': 'mixed' if name.startswith('public/assets/viewer/') else 'sourced_baseline' if name.startswith('public/licenses/') else 'non_astra_authored_baseline',
         'sourceAssets': ['primary-product', 'web-product-estuary-safe'] if name.startswith('public/assets/viewer/') else []} for name in outputs]},
    'elapsedSeconds': (end - datetime.datetime.fromisoformat(before['startedAt'])).total_seconds(),
    'cost': {'amount': None, 'currency': 'USD', 'basis': 'Unavailable; not reconstructed. elapsedSeconds is actual baseline-to-closeout wall interval, not active model or billed time.'},
    'interventionLevel': 2, 'outcome': 'pass_with_intervention',
    'failureNotes': 'TDD failures retained; existing standalone E2E TypeScript file-tool diagnostics reflect default compiler/dependency context, not repository build failure. Heavy full control matrix not rerun for documentation/copy-only edits. No new captures, legal certification, performance or physical-device claim.',
    'reviewer': 'Sol release implementation and automated checks; not new independent human certification',
    'publicSummary': 'Public license copies and exact native refined-viewer preview added separately from historical evidence. Lighting authorship, missing timing/cost, subjective approval and stopped Mobile boundary clarified; Safe GLB/materials unchanged. No deployment.'
}
save(run / 'run.json', record)
print(json.dumps({'outputs': len(outputs), 'changedPreexisting': changed, 'endedAt': end.isoformat()}))
