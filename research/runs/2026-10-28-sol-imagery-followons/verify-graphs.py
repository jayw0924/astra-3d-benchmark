"""Read-only graph comparison; does not execute Comfy nodes."""
from pathlib import Path
import json
base=Path(__file__).resolve().parent
root=base.parents[2]
control=json.loads((root/'research/runs/2026-10-27-sol-qwen-imagery/followup-seed42/prompt.json').read_text())
def read(p):return json.loads(p.read_text())
def diff(a,b,path=''):
 if type(a)!=type(b):return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):
  result=[]
  for k in sorted(set(a)|set(b)):
   if k not in a or k not in b:result.append({'path':path+'/'+k,'before':a.get(k),'after':b.get(k)})
   else:result+=diff(a[k],b[k],path+'/'+k)
  return result
 if a!=b:return [{'path':path,'before':a,'after':b}]
 return []
result={}
for folder in ['qwen-location','protected-background/received-background-01']:
 graph=read(base/'artifacts'/folder/'prompt.json')
 assert graph['459:458']['inputs']==control['459:458']['inputs']
 assert graph['459:484']['inputs']['switch'] is False
 assert graph['470']['is_changed']==(['79adecb53eddb16c5d7eb6478d8ef1ad0e6f0e68dc78d6d06eef0c59f017b252'] if folder=='qwen-location' else ['a23adfe1d1ba992ce736f55ca6915f62f7b54d8afa96e9600a6181d8437c1c3b'])
 result[folder]={'reference':'original side seed42 execution graph','completeDifferences':diff(control,graph),'effectivePrompt':graph['459:484']['inputs']['on_false'],'sampler':graph['459:458']['inputs'],'promptRefinement':False,'sourceToken':graph['470']['is_changed'],'limit':'Metadata corroboration, not authenticated cloud upload/execution/cost history.'}
flux=read(base/'artifacts/flux-kontext-pro/prompt.json')
assert flux['84']['is_changed']==control['470']['is_changed']
result['flux-kontext-pro']={'actualNode':flux['83'],'sourceToken':flux['84']['is_changed'],'limit':'Different service graph, requested sizing not actual output sizing; seed42 across models is not paired randomness.'}
print(json.dumps(result,indent=2))
