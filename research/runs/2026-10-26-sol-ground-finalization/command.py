"""Run a named verification command, retaining its real output and timing."""
from pathlib import Path
import datetime, json, os, subprocess, sys, time
out = Path(__file__).parent
root = out.resolve().parents[2]
label, *command = sys.argv[1:]
assert label and command
assert not (out / f'{label}.log').exists(), 'Use a new label; logs are append-only artifacts'
start = datetime.datetime.now(datetime.timezone.utc).isoformat()
t0 = time.monotonic()
env = dict(os.environ, PLAYWRIGHT_BROWSERS_PATH='.cache/ms-playwright')
with (out / f'{label}.log').open('w') as log:
    result = subprocess.run(command, cwd=root, env=env, stdout=log, stderr=subprocess.STDOUT)
record = dict(command=command, startedAt=start, endedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), elapsedSeconds=time.monotonic()-t0, exitCode=result.returncode)
(out / f'{label}-execution.json').write_text(json.dumps(record, indent=2)+'\n')
print(json.dumps({'label':label, **record}))
print((out / f'{label}.log').read_text()[-1400:])
sys.exit(result.returncode)
