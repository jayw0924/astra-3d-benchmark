import datetime,json,pathlib,subprocess,sys,os
here=pathlib.Path(__file__).resolve().parent
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
p=subprocess.run(sys.argv[1:],capture_output=True,text=True)
record={'argv':sys.argv[1:],'cwd':os.getcwd(),'startedAt':start,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitStatus':p.returncode,'stdout':p.stdout,'stderr':p.stderr}
with (here/'commands.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
print(p.stdout,end='');print(p.stderr,end='',file=sys.stderr);sys.exit(p.returncode)
