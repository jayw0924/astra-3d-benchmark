from pathlib import Path
import hashlib,json
p=Path(__file__).resolve().parent
records=[]
for file in sorted(p.rglob('*')):
    if file.is_symlink():
        raise RuntimeError('Unexpected symlink: '+str(file))
    if file.is_file() and file.name!='artifact-inventory.json' and '__pycache__' not in file.parts:
        b=file.read_bytes()
        records.append({'path':str(file.relative_to(p)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
result={'scope':'All package files except this self-referential inventory and Python cache; all PNGs included','files':records,'fileCount':len(records),'pngCount':sum(x['path'].endswith('.png') for x in records)}
(p/'artifact-inventory.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'files':result['fileCount'],'pngs':result['pngCount']}))
