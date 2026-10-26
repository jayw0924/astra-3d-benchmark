"""Check built public delivery on a temporary loopback preview server, no captures."""
from pathlib import Path
import os, subprocess, time, urllib.request
root=Path(__file__).resolve().parents[3]
port=4187
base=f'http://127.0.0.1:{port}'
server=subprocess.Popen(['node','node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',str(port),'--strictPort'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
try:
    for _ in range(100):
        if server.poll() is not None: raise RuntimeError('Preview server exited before readiness')
        try:
            with urllib.request.urlopen(base,timeout=1) as response: assert response.status==200
            break
        except OSError: time.sleep(.1)
    else: raise RuntimeError('Preview readiness timeout')
    import hashlib
    public_files=[p for p in (root/'public').rglob('*') if p.is_file()]
    for source in public_files:
        emitted=root/'dist'/source.relative_to(root/'public')
        assert emitted.read_bytes()==source.read_bytes(), str(emitted)
    with urllib.request.urlopen(base+'/assets/models/product-estuary-safe.glb',timeout=30) as response:
        model=response.read()
    assert len(model)==9239404 and hashlib.sha256(model).hexdigest()=='01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4'
    print(f'All {len(public_files)} public files emitted byte-for-byte; HTTP Safe GLB bytes/hash verified.')
    env=dict(os.environ, BASE_URL=base, PLAYWRIGHT_BROWSERS_PATH='.cache/ms-playwright')
    result=subprocess.run(['npx','playwright','test','tests/e2e/release-assets.spec.ts'],cwd=root,env=env)
    assert result.returncode==0, f'Production release checks failed: {result.returncode}'
    print('Built public delivery checks passed; model requests were aborted, no GLB capture writer run.')
finally:
    server.terminate()
    try: server.wait(timeout=10)
    except subprocess.TimeoutExpired: server.kill(); server.wait()
