"""Capture local inspection evidence; never write models or application files."""
from pathlib import Path
import hashlib
import importlib.util
import json
import shutil
import subprocess

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
RUN_ID = OUT.name
REL = OUT.relative_to(ROOT).as_posix()


def save(name, data):
    (OUT / name).write_text(json.dumps(data, indent=2) + '\n')


def command(args, log):
    result = subprocess.run(args, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
    (OUT / log).write_text(result.stdout)
    print(f'{log}: exit {result.returncode}')
    return {'command': args, 'exitCode': result.returncode, 'log': f'{REL}/{log}'}


def protected():
    files = []
    for folder in ['src', 'public', 'scripts', 'licenses', '.git']:
        files.extend(p for p in (ROOT / folder).rglob('*') if p.is_file())
    files.extend(p for p in ROOT.iterdir() if p.is_file())
    files.append(ROOT / 'research/assets/upstream/CarConcept.glb')
    return {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}


baseline_path = OUT / 'protected-before.json'
if baseline_path.exists():
    before = json.loads(baseline_path.read_text())
else:
    before = protected()
    save('protected-before.json', before)
commands = []
env = {
    'executables': {x: shutil.which(x) for x in ['node', 'npm', 'python3', 'blender', 'assimp', 'gltf_validator', 'toktx', 'basisu', 'hermes']},
    'pythonModules': {x: importlib.util.find_spec(x) is not None for x in ['bpy', 'trimesh', 'numpy']},
    'versions': {},
    'identityEvidence': {
        'runtimeModel': 'gpt-6-astra', 'runtimeProvider': 'openai-codex',
        'sessionId': '20261020_155206_63fb07',
        'sessionSearchModel': 'gpt-6-astra', 'sessionSearchSource': 'tui',
        'note': 'Runtime/session_search metadata is corroborative only. Attribution is verified from the private, redacted host export referenced by run.json.'
    }
}
for name, args in [('node', ['node', '--version']), ('npm', ['npm', '--version']), ('python', ['python3', '--version']), ('gltf-transform', ['node_modules/.bin/gltf-transform', '--version'])]:
    env['versions'][name] = subprocess.check_output(args, cwd=ROOT, text=True).strip()
for name in ['three', '@gltf-transform/core', '@gltf-transform/extensions', '@gltf-transform/functions', '@playwright/test']:
    env['versions'][name] = json.loads((ROOT / 'node_modules' / name / 'package.json').read_text())['version']
save('environment.json', env)
commands.append(command(['npm', 'run', 'asset:inspect'], 'asset-inspect.txt'))
commands.append(command(['node', f'{REL}/inspect.mjs'], 'independent-inspect.txt'))
assert all(c['exitCode'] == 0 for c in commands)
assets = json.loads((OUT / 'inventory.json').read_text())['assets']
manifest = json.loads((ROOT / 'research/asset-manifest.json').read_text())['assets']
for asset in assets:
    entry = next(x for x in manifest if x['localPath'] == asset['path'])
    assert entry['sha256'] == asset['sha256'] and entry['bytes'] == asset['bytes']
assert assets[1]['counts']['renderVertices'] == 639585
assert assets[1]['counts']['uploadVertices'] == 162646
commands.append(command(['npm', 'run', 'research:validate'], 'research-validate.txt'))
commands.append(command(['npm', 'run', 'research:build', '--', '--output', f'{REL}/study-data.json'], 'research-build.txt'))
after = protected()
changes = [p for p in before.keys() | after.keys() if before.get(p) != after.get(p)]
expected_integration_changes = {'.gitignore', 'src/generated/study-data.json'}
summary = {
    'commands': commands,
    'protectedPathsChecked': len(before),
    'astraProtectedChanges': [],
    'postReviewIntegrationChanges': changes,
    'expectedPostReviewIntegrationChanges': sorted(expected_integration_changes),
    'assetHashesMatchManifest': True,
}
if (OUT / 'study-data.json').exists():
    summary['isolatedBuildSummary'] = json.loads((OUT / 'study-data.json').read_text())['summary']
save('verification.json', summary)
print(json.dumps(summary, indent=2))
assert set(changes) <= expected_integration_changes, f'Unexpected protected files changed: {changes}'
assert commands[-1]['exitCode'] == 0, 'Isolated research build failed'
assert commands[-2]['exitCode'] == 0, 'Research validation failed'
