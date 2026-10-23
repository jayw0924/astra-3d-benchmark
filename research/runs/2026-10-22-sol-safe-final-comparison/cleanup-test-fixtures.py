from pathlib import Path
import shutil,json
p=Path(__file__).resolve().parent
for name in ['tmp','test-cache']:
 f=p/name
 if f.exists():
  print(json.dumps({'removedDisposableTestDirectory':name,'files':sum(x.is_file() for x in f.rglob('*')),'reason':'Only test fixture/cache data; real raw command logs retained. Prevent synthetic fixture run.json records entering recursive research discovery.'}));shutil.rmtree(f)
