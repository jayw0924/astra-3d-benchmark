"""Read-only GLB inspector. Run from repository root; JSON to stdout only.
Sol analysis preparation; no asset export, renderer or candidate authoring.
"""
import hashlib, json, math, struct, shutil, importlib.util, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
def sha(b): return hashlib.sha256(b).hexdigest()
def pin(p):
    b=(ROOT/p).read_bytes(); return {'path':p,'bytes':len(b),'sha256':sha(b)}
def inspect(path):
    b=(ROOT/path).read_bytes()
    magic,version,size=struct.unpack_from('<4sII',b)
    assert magic==b'glTF' and version==2 and size==len(b)
    off=12; j=None; binary=None
    while off<len(b):
        n,t=struct.unpack_from('<II',b,off); payload=b[off+8:off+8+n]; off+=8+n
        if t==0x4e4f534a: j=json.loads(payload)
        elif t==0x004e4942: binary=payload
    def view(i):
        v=j['bufferViews'][i]; assert v.get('buffer',0)==0
        return binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]
    def accessor(i):
        a=j['accessors'][i]; assert not a.get('sparse')
        v=j['bufferViews'][a['bufferView']]; assert not v.get('extensions')
        f,w={5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}[a['componentType']]
        k={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        blob=view(a['bufferView']); stride=v.get('byteStride',w*k); offset=a.get('byteOffset',0)
        vals=[struct.unpack_from('<'+f*k,blob,offset+n*stride) for n in range(a['count'])]
        if a.get('normalized') and a['componentType']!=5126:
            d={5120:127,5121:255,5122:32767,5123:65535}[a['componentType']]
            vals=[tuple(max(x/d,-1) for x in row) for row in vals]
        return vals
    cache={}
    def stats(i,semantic):
        key=(i,semantic)
        if key in cache:return cache[key]
        vals=accessor(i); a=j['accessors'][i]
        canonical=b''.join(struct.pack('<'+'d'*len(row),*row) for row in vals)
        out={'accessor':i,'count':len(vals),'type':a['type'],'componentType':a['componentType'],'decodedTupleSHA256':sha(canonical),'nonfinite':sum(not math.isfinite(x) for r in vals for x in r)}
        if vals:
            out['min']=[min(r[c] for r in vals) for c in range(len(vals[0]))];out['max']=[max(r[c] for r in vals) for c in range(len(vals[0]))]
        if semantic=='NORMAL':
            lens=[math.sqrt(sum(x*x for x in r)) for r in vals]
            out['lengthRange']=[min(lens),max(lens)];out['zeroLength']=sum(x<1e-8 for x in lens);out['outsideUnitTolerance1e-3']=sum(abs(x-1)>1e-3 for x in lens)
        cache[key]=out;return out
    prims=[]
    for mi,m in enumerate(j.get('meshes',[])):
        nodes=[{'index':ni,'name':n.get('name')} for ni,n in enumerate(j.get('nodes',[])) if n.get('mesh')==mi]
        for pi,p in enumerate(m['primitives']):
            prims.append({'mesh':mi,'primitive':pi,'meshName':m.get('name'),'nodes':nodes,'material':p.get('material'),'mode':p.get('mode',4),'extensions':p.get('extensions',{}),'attributes':{s:stats(a,s) for s,a in p['attributes'].items()},'indices':stats(p['indices'],'INDICES') if 'indices' in p else None})
    # Joint attribute tuples distinguish compaction from changed attribute values.
    for out in prims:
        definition=j['meshes'][out['mesh']]['primitives'][out['primitive']]
        semantics=sorted(definition['attributes'])
        decoded=[accessor(definition['attributes'][s]) for s in semantics]
        assert len({len(v) for v in decoded})==1
        out['_jointTupleHashes']={sha(repr(tuple(values[n] for values in decoded)).encode()) for n in range(len(decoded[0]))}
        out['jointTupleSemantics']=semantics
    images=[]
    for i,img in enumerate(j.get('images',[])):
        data=view(img['bufferView']); info={'index':i,'definition':img,'bytes':len(data),'sha256':sha(data)}
        if data[:12]==b'\xabKTX 20\xbb\r\n\x1a\n':
            fields=struct.unpack_from('<9I',data,12)
            info['ktx2Header']=dict(zip(['vkFormat','typeSize','pixelWidth','pixelHeight','pixelDepth','layerCount','faceCount','levelCount','supercompressionScheme'],fields))
        images.append(info)
    return {**pin(path),'asset':j.get('asset'),'extensionsUsed':j.get('extensionsUsed'),'extensionsRequired':j.get('extensionsRequired'),'variants':j.get('extensions',{}).get('KHR_materials_variants'), 'materials':j.get('materials',[]),'textures':j.get('textures',[]),'samplers':j.get('samplers',[]),'images':images,'nodes':j.get('nodes',[]),'scenes':j.get('scenes',[]),'primitives':prims}
paths=['research/assets/upstream/CarConcept.glb','public/assets/models/product.glb','public/assets/models/product-estuary.glb','public/assets/models/product-estuary-safe.glb']
assets=[inspect(p) for p in paths]
a,c=assets[-2:]
def normalmat(m):
    m=dict(m);m.setdefault('alphaMode','OPAQUE');return m
matches=[]
# Stable full node identity + primitive ordinal; fail if hierarchy differs.
assert a['nodes']==c['nodes'], 'Need explicit hierarchy correspondence'
def key(p):return (tuple((n['index'],n.get('name')) for n in p['nodes']),p['primitive'])
lookup={key(p):p for p in a['primitives']};assert len(lookup)==len(a['primitives'])
for p in c['primitives']:
    q=lookup.get(key(p)); row={'nodes':p['nodes'],'primitive':p['primitive'],'matched':q is not None}
    if q:
        row['jointTupleSemanticsEqual']=p['jointTupleSemantics']==q['jointTupleSemantics']
        row['safeJointTuplesSubsetOfControl']=p['_jointTupleHashes'].issubset(q['_jointTupleHashes'])
        row['materialMappingEqual']=p['material']==q['material'] and p['extensions']==q['extensions']
        row['attributes']={s:{'tupleSequenceEqual':v['decodedTupleSHA256']==q['attributes'].get(s,{}).get('decodedTupleSHA256'),'controlCount':q['attributes'].get(s,{}).get('count'),'safeCount':v['count']} for s,v in p['attributes'].items()}
        row['indicesSequenceEqual']=p['indices']['decodedTupleSHA256']==q['indices']['decodedTupleSHA256']
        row['controlTriangles']=q['indices']['count']//3;row['safeTriangles']=p['indices']['count']//3
    matches.append(row)
sources=['research/FROZEN_LIGHTING_CHECKPOINT.md','src/lib/threeViewer.ts','src/lib/viewerLighting.ts','package.json','package-lock.json','node_modules/three/src/renderers/shaders/ShaderChunk/normal_fragment_maps.glsl.js','node_modules/three/examples/jsm/loaders/GLTFLoader.js','node_modules/three/examples/jsm/environments/RoomEnvironment.js','research/runs/2026-10-22-sol-safe-final-comparison/page.js','research/runs/2026-10-22-sol-safe-final-comparison/control-spec.json']
report={'scope':'Read-only source analysis; no captures, candidate authoring, quality acceptance or performance measurement','attribution':'Sol analysis (delegated Hermes runtime); no authenticated subject-session attribution claimed','gitHEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'rootResolved':str(ROOT),'availability':{'blender':shutil.which('blender'),'bpy':importlib.util.find_spec('bpy') is not None},'sourcePins':[pin(p) for p in sources if (ROOT/p).is_file()],'assets':assets,'controlVsSafe':{'materialsExactEqual':a['materials']==c['materials'],'materialsEqualAfterExplicitAlphaDefaultOnly':[normalmat(m) for m in a['materials']]==[normalmat(m) for m in c['materials']],'texturesEqual':a['textures']==c['textures'],'samplersEqual':a['samplers']==c['samplers'],'imagePayloadHashesEqual':[i['sha256'] for i in a['images']]==[i['sha256'] for i in c['images']],'variantsEqual':a['variants']==c['variants'],'nodesExactEqual':a['nodes']==c['nodes'],'primitiveCorrespondence':matches},'limitations':['Texture payloads hashed and KTX2 headers parsed, not decoded or visually inspected.','UV ranges and normal vector lengths are numeric checks, not proof of seam quality, texel density, correct handedness, face orientation or interpolation equivalence.','Decoded tuple sequence equality differs from tuple-set preservation; unequal sequences may merely reflect compaction.','World-space dimensions, topology manifoldness and triangle/normal angular alignment not measured here.','glTF linear color factors and extension fields are source data; no physical measurement of this car is available.']}
for asset in assets:
    for primitive in asset['primitives']:
        del primitive['_jointTupleHashes']
print(json.dumps(report,indent=2,allow_nan=False))
