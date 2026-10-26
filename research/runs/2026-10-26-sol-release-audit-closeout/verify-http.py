"""Verify built public files through real HTTP, then lightweight browsers."""
from functools import partial
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import subprocess
import threading
from urllib.request import urlopen

root = Path(__file__).resolve().parents[3]
run = Path(__file__).resolve().parent
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(root / 'dist')))
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f'http://127.0.0.1:{server.server_port}'
results = []
try:
    sources = {
        '/licenses/Basis-Universal-APACHE-2.0.txt': 'licenses/upstream/Basis-Universal-APACHE-2.0.txt',
        '/licenses/Basis-Universal-NOTICE.md': 'licenses/upstream/Basis-Universal-NOTICE.md',
        '/assets/viewer/refined-estuary-native.png': 'research/runs/2026-10-26-sol-lighting-integration/after-refined-chromium-estuary-enamel-native.png',
        '/assets/models/product-estuary-safe.glb': 'research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/candidate.glb',
    }
    for url, source in sources.items():
        with urlopen(base + url) as response:
            body = response.read()
            assert response.status == 200
        assert body == (root / source).read_bytes(), url
        results.append({'url': url, 'status': 200, 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(), 'exactSource': source})
    (run / 'http-verification.json').write_text(json.dumps({'baseURL': base, 'results': results}, indent=2) + '\n')
    print(json.dumps(results), flush=True)
    env = {**os.environ, 'BASE_URL': base, 'PLAYWRIGHT_BROWSERS_PATH': '.cache/ms-playwright'}
    subprocess.run(['npx', 'playwright', 'test', 'tests/e2e/release-assets.spec.ts', 'tests/e2e/showcase.spec.ts', '--grep', 'release images|publishes decoded', '--reporter=list'], cwd=root, env=env, check=True)
finally:
    server.shutdown()
    server.server_close()
    thread.join()
