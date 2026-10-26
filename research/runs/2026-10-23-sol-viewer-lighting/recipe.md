# Exact recipe and replay

This is **Sol presentation work**, not an Astra geometry/material output. The original remains the only app default; candidate rigs are research-only. `src/lib/viewerLighting.ts` is the shared rig factory called by both the actual viewer (no preset argument, therefore original) and `page.js` (explicit matrix preset).

## Frozen controls

- Accepted GLB: `public/assets/models/product-estuary-safe.glb`, 9,239,404 bytes, SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`. Local and browser-response bytes checked.
- Renderer: 600×400, DPR1, antialias, sRGB, ACESFilmic, exposure1.05, background `#ddd9d0`; near0.01/far100/fov32. No postprocessing, external HDR or network asset download.
- Production transform order: derive unrotated source bounds, subtract center, lift half height, THEN rotate Y−0.22. Frozen position `[0.0052169566892141805,0.1592990504646274,-0.23846179246902466]`. Earlier geometry harness instead centered after rotation; that transform was deliberately NOT copied. Exterior positions retained from current viewer/prior control; detail positions derived once from the accepted safe source.
- `control-spec.json` freezes all six camera position/target pairs. `plan-frozen.json` hashes that spec, matrix and source files. No per-rig fitting.
- All source materials and source finish mappings preserved. The only existing runtime treatment copied is bright `Rim1`/`Rim2`: original color, metalness1, roughness0.24, identical for every rig. No new rim intervention. No GLB changes.

## Illumination

| Setting | original | environment-only | grounded-studio |
|---|---:|---:|---:|
| hemisphere sky `0xf7f3ea` / ground `0x30363d` |2.5|0.65|0.65|
| white directional `[4,8,5]` targeting origin |5.5|2.4|2.4|
| blue directional `0x93b6d4` at `[-5,3,-4]` |3.5|1.1|1.1|
| environment |none|RoomEnvironment PMREM sigma0.08|same|
| grid |24×24, y−0.015|identical|none|
| floor |none|none|ShadowMaterial opacity0.18|

Three.js `RoomEnvironment` is a procedural broad-panel studio with its existing MIT license (`node_modules/three/LICENSE`). The room graph and PMREM generator are disposed immediately after baking; the resulting render target remains rig-owned and is disposed on teardown. Environment is illumination/reflection only; background never changes.

## Grounding

Transparent black ShadowMaterial overlays the unchanged neutral background rather than introducing a lit floor whose albedo/exposure could change the environment comparison. Horizontal plane width/depth = five times maximum world-space model X/Z extent; center matches transformed bounds, Y = minimum bound−0.003 = −0.003. Key position/target/intensity remain IDENTICAL to environment-only; only its shadow camera is fitted (±max model extent, near0.1, far=key-to-bounds-center distance+3×extent).

Supported PCFShadowMap, 1024², radius6, opacity0.18, bias−0.00015, normalBias0.015. Only opaque meshes cast; model meshes do not receive, avoiding body self-shadow/material confounds. This is filtered directional shadowing, NOT physically accurate area-light contact shadows. Shadow maps update once on explicit invalidation; second/warmed image render reuses the static map. Moving geometry/lights or changing transparency requires explicit invalidation. Teardown restores prior model cast flags, environment and renderer shadow settings, and disposes floor geometry/material and key shadow maps. Dispose before installing another rig.

Initial grounding used the removed PCFSoftShadowMap constant with default radius1 and opacity0.24; native review rejected its hard polygonal shadow. `attempts/grounded-v1/` preserves the rejected frames, source and manifests. `shadow-repair.json` declares the bounded correction; unchanged original/environment stages are retained, with exact-PNG parity probes in `repair-parity.json`. No retouching.

## Replay

From repository root, using existing node_modules/browser cache:

```sh
node --test research/runs/2026-10-23-sol-viewer-lighting/*.test.mjs
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-23-sol-viewer-lighting/capture.mjs capture grounded-studio 6
node research/runs/2026-10-23-sol-viewer-lighting/verify.mjs
python research/runs/2026-10-23-sol-viewer-lighting/package.py
npm run test:unit
npm run lint
npm run build:app
```

Capture resumes only missing IDs, six at a time in a fresh browser context/process, rehashing retained PNGs and source pins before reuse. A complete existing package is NOT overwritten. For a truly new experiment create a new package with a fresh frozen spec; do not run bootstrap or the one-shot shadow repair over this finalized evidence. `prepare-shadow-repair.mjs` refuses an existing correction declaration.

Open `index.html` directly for the labelled offline gallery, or use `npm run dev -- --host 127.0.0.1` and browse `/research/runs/2026-10-23-sol-viewer-lighting/index.html`. Candidate rendering is isolated in `page.html`; the app has no lighting UI or default change. Ask Jay for preference only after showing tradeoffs. Do not generate a preference/run.json or promote based on these captures alone.
