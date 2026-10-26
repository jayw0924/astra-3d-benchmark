# Refinement recipe and replay

Sol-authored presentation experiment; one optional research preset, `grounded-studio-refined`. Existing recipes and original production default remain unchanged. No preference, default selection, commit, push, deployment or promotion.

## Exact bundle

Read `brief.md` for preregistered rationale. Shared `src/lib/viewerLighting.ts`, Three r186 RoomEnvironment (Three MIT license), PMREM sigma .08. Candidate rotates the entire procedural room +pi/2 around Y, main point intensity650 rather than900, original +Z emissive panel intensity12 rather than43, width2 rather than4.38. All other procedural room panels retained. Hemisphere sky0xf7f3ea / ground0x30363d intensity.55; white key2.0 at[1,10,1] targeting origin; blue rim0x93b6d4 intensity.9 at[-5,3,-4].

Accepted research comparator: unchanged RoomEnvironment, hemisphere.65, key2.4 at[4,8,5], rim1.1 at[-5,3,-4]. Both use the unchanged neutral background#ddd9d0 and no grid. Floor is transparent black ShadowMaterial, depthWrite false, horizontal at post-transform bounds.minY−.003, width/depth5×max(X,Z). Candidate opacity.14 / PCF radius8 versus comparator.18 / radius6; both1024² map, bias−.00015, normalBias.015, ±max extent camera, near.1/far key-to-center distance+3×extent. Only opaque meshes cast; model does not receive. These are filtered directional shadows, not physical area-light/contact rendering. One explicit invalidation per image; warmed frame reuses the map.

Same accepted GLB9,239,404 bytes, SHA256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`, original source material variant assignments and existing bright Rim1/Rim2 roughness.24/metalness1 treatment. No new materials/exposure intervention. Frozen control-spec copied unchanged from prior package: production pre-rotation centering/lifting then rotationY−.22; exterior and source-derived glass camera unchanged. Renderer600×400,DPR1,antialias,sRGB,ACESFilmic exposure1.05,fov32,near.01,far100. No HDR/new dependencies/postprocessing.

## Replay from repo root

```sh
node --test research/runs/2026-10-23-sol-viewer-lighting-refinement/plan.test.mjs
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-23-sol-viewer-lighting-refinement/capture.mjs
# Each invocation resumes up to4 missing images,2 cases per rig, shared model/context.
# Eight fresh contexts for the full32-image plan. Do not overwrite completed evidence.
node research/runs/2026-10-23-sol-viewer-lighting-refinement/verify.mjs
python research/runs/2026-10-23-sol-viewer-lighting-refinement/parity.py
python research/runs/2026-10-23-sol-viewer-lighting-refinement/package.py
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-23-sol-viewer-lighting-refinement/gallery-check.mjs
npm run test:unit
npm run lint
npm run build:app
```

Capture pins source/harness/brief/spec/matrix and verifies model on disk AND served response bytes. Every image has actual material references, camera/transform, content check, render counts, timestamp, hash/bytes/dimensions and applied key/shadow settings. Raw context sessions include exactly one model request, rig switches, all16 finish assignment transitions and disposal checks. Preserve source pins before rerunning; allocate a fresh package for another experiment.

Original default colors/intensities/positions/grid geometry and resource disposal are regression-tested. Shadow needsUpdate is now restored along with enabled/type/autoUpdate on teardown; RED/GREEN logs retain the reproduced bug. Unit tests mock only PMREM's GPU boundary; real browser captures exercise its actual bake and resource lifecycle. No full live-app E2E until a default is chosen; harness camera/material evidence is not a full controls E2E claim.

Open `index.html` directly, or `npm run dev -- --host 127.0.0.1` and visit `/research/runs/2026-10-23-sol-viewer-lighting-refinement/index.html`. Compare native glass and Pearly before choosing. Read `notes.md` for actual outcomes and `baseline-parity.json` for exact-byte versus pixel-level replay differences. No physical-realism, real-GPU performance or general-device claim follows from these fixed views.
