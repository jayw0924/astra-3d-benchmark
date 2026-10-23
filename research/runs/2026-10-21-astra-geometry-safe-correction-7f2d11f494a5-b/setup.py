from pathlib import Path
import shutil
here=Path(__file__).resolve().parent
old=Path('research/runs/2026-10-21-sol-safe-webgl-comparison')
for name in ['page.html','page.js','control-spec.json','capture.mjs','plan.mjs']:
 assert not (here/name).exists();shutil.copyfile(old/name,here/name)
for name in ['verify.mjs']:
 assert not (here/name).exists();shutil.copyfile(Path('research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab')/name,here/name)
print('Copied Sol harness and independent verifier into new run only')
