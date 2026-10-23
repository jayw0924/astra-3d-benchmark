# Control versus Safe WebGL — evidence only, UNACCEPTED

## Completed artifacts

- 108/108 fixed PNGs, 0 remaining: 9 targets × 2 models × 2 finishes × shaded/wireframe/silhouette.
- All PNG capture dimensions 600×400, DPR 1; per-image bytes/SHA-256, repeated unchanged-framebuffer readback, pixel-content check, camera, 25 applied material assignments, and renderer counts in `capture-manifest.json`.
- Nine labeled contact sheets, every panel viewed with model vision; concerns in `visual-review.json` and `visual-review.md`. A control-only three-detail probe was also viewed before the remaining captures.
- `index.html` side-by-side gallery is explicitly unaccepted. Actual browser decode check: 108 images decoded to 600×400, alt text present, no page/request/HTTP errors.
- ABBA raw browser sessions in `raw/measure-{0-control,1-safe,2-safe,3-control}.json`: 30 post-warmup samples each, 120 raw samples total; all 16 ordered variant pairs (including self transitions), 25 assignments verified against actual material object identity each time. Four variant names, history-independent signatures, 64 transitions total. No page/request/HTTP errors in these measured sessions.
- Matrix test written before `plan.mjs`; `test-red.txt` proves missing implementation failure, `test-green.txt` proves pass. `evidence-red.txt` preserves missing visual-review gate failure. Final package tests: 4 passed, 0 failed. No full application build/test run was needed or claimed: production files were not changed.

## Measured observations, not acceptance

HTTP identity content encoding (no `Content-Encoding` header, empty ResourceTiming encoding): actual encoded and decoded body sizes were 10,191,496 control and 9,051,644 candidate bytes. Body reduction 1,139,852 bytes (11.1843%). CDP records actual response headers and total received encoded lengths including headers; ResourceTiming body sizes are separate from header-inclusive transfer sizes. Source files are hash-pinned before every invocation; HTTP serves those exact file bytes with `no-store`.

With `renderer.info.autoReset=false` and an explicit reset once before each top-level render, both report 214 renderer calls, 108 geometries, 15 textures, 23 programs at first model render. Control triangles 426,390; Safe 354,830, a 16.7828% reduction in this harness's submitted triangles. These counts include main and transmission prepass work; they are not unique topology counts, GPU vertex invocations, or cumulative counts over two explicit frames. The extra geometry/texture include renderer/environment resources. No draw-call reduction was observed.

| ABBA order | model | fetch+parse ms | cold synchronous compile ms | load to first rendered frame ms | warm submit+finish p50 / p95 ms | warm render+finish+RAF p50 / p95 ms |
|---|---|---:|---:|---:|---:|---:|
| 0 | control | 14903.5 | 15.0 | 16593.6 | 2.8 / 83.9 | 9080.4 / 18500.3 |
| 1 | Safe | 16600.4 | 15.6 | 18301.4 | 3.0 / 62.8 | 7903.5 / 9298.2 |
| 2 | Safe | 15091.8 | 69.6 | 16779.9 | 2.9 / 8.3 | 7997.3 / 16097.6 |
| 3 | control | 14916.0 | 17.7 | 16559.3 | 2.8 / 88.7 | 9196.7 / 18791.4 |

Raw fetch and parse/decode components, first-render submit/finish duration, and both warmed sample series are retained separately. `renderer.compile(scene,camera)` is synchronous and occurs after Estuary assignment but before any model-scene render or variant-transition render. Procedural PMREM renders during setup, before model load, are not part of this cold model-material claim. `KHR_parallel_shader_compile` was absent. Native transcoder prefetch and PMREM setup precede model-load timing, explicitly excluded; KTX worker initialization/decode is inside GLTF parse timing.

First frame is **first rendered**, not first correct: no visual correctness inspection took place at its timestamp. Later capture QC cannot retroactively establish first-correct-frame latency. Camera-spec fetch and initial assignment/compile occur between parse and first frame, so the latter is not simply parse+compile+render.

Browser: Chromium 156.0.8078.4, WebGL 2, ANGLE Vulkan 1.3 SwiftShader Device (Subzero). Machine identity is in each raw measurement record. Fresh contexts, first A from a multi-session attempt, later B/B/A each from separate browser invocations; OS caches and scheduling are uncontrolled. Six warmup frames then thirty samples. Multi-second and highly variable RAF intervals, alongside much shorter submit/finish measurements, show this headless software setup is heavily scheduler/presentation-bound. Do not treat either metric as production FPS or rank production GPU gains. Compile also varied materially between repeated candidate samples. Delivery-byte improvement is measured; production runtime benefit is not established.

## Controls and visual limitations

Camera positions, targets, root position and rotation derive from the control only (`control-spec.json`). Candidate framing never reads candidate bounds to change the camera or root transform. Fixed 32° cameras, same tone mapping/exposure/sRGB and procedural room environment. Original close-up lessons retained: choose outside direction from world-space center rather than misleading L/R labels; do not hide mesh ancestors of isolated targets—replace ancestor material with no color/depth writes instead.

All nine targets contain externally visible intended forms and non-background pixels. Exterior cameras deliberately retain prior harness transforms and leave generous margins. Detail contexts crop surrounding car, not the primary wheel/wipers/seats. Interior is through real exterior glazing, not a cutaway. Dashboard periphery is cropped in isolated interior wireframe; primary seats remain visible. Dense whole-exterior wireframe is nearly solid at 600×400; use isolated detail topology. Opaque detail silhouettes cannot validate hidden forms and are supplemental only.

**Unresolved visual concern:** Safe hood/top-grill highlight/edge adjacent to windscreen appears more segmented/scalloped in the wipers and glass-edge shaded pairs. Other small highlight differences exist at doors and wheel surrounds. No final parity, rejection or acceptance verdict is authored. Independent native-PNG review is required, especially these two targets in both finishes. Do not promote solely from this package's completeness.

## Failures retained and repaired

1. Initial control-exterior batch captured 18 valid PNGs but recorded one `basis_transcoder.js net::ERR_ABORTED` request failure. Parsing/rendering succeeded, so the transport failure did not make these frames blank; it still failed the zero-request-error gate. Explicit native JS/WASM fetch completion followed by Three Cache priming eliminated the observed failure in all subsequent sessions. The original raw record remains under `raw/capture-control-1792612763961.json`, marked superseded in the capture manifest; the entire affected 18-case exterior subset was rerun after the loader repair, with identical PNG bytes and no errors. Historical `errors` are retained; `activeCaptureErrors` is empty.
2. Two combined long measurement commands returned exit 137 after checkpointing completed sessions (first retained A0, second retained B2). The first had begun the next B context; the second command chain had begun its final A context. Those interrupted contexts have no complete sample record and are excluded, not treated as successful trials. ABBA denotes the four completed samples, not an uninterrupted four-context execution history. Cgroup memory.events showed zero OOM kills at inspection, so OOM is not established; timeout/resource termination cause is undetermined. Resumed missing sessions individually, preserving raw completed outputs. No synthetic samples or silent matrix reductions.
3. Contact-sheet packaging initially emitted a Pillow `getdata` deprecation warning; corrected to current `get_flattened_data` API. No image-content change.

## Reproduction

From mounted repository root, with existing dependencies and `.cache/ms-playwright` browser cache:

```
node --test research/runs/2026-10-21-sol-safe-webgl-comparison/*.test.mjs
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-21-sol-safe-webgl-comparison/capture.mjs bootstrap
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-21-sol-safe-webgl-comparison/capture.mjs capture control front-three-quarter,side,rear-three-quarter
```

Capture the remaining control/safe targets in three-target batches; each invocation rehashes retained PNGs and both model inputs, then checkpoints after every PNG. Measurements should run one fresh process per sample using `measure control 0`, `measure safe 1`, `measure safe 2`, `measure control 3` (same command prefix). `python .../package.py` rebuilds contact sheets, image-difference diagnostics, summary, and gallery. `capture.mjs gallery` performs the browser image-decode check. Regenerate the all-file inventory after any artifact changes. Bootstrapping/measurement overwrites these named outputs deliberately; this is an evidence package replay, not immutable log appending.

## Boundaries

All authored repository artifacts reside under this new directory. No candidate/control/model, Astra run, public/src/package files, manifests, accepted baseline or app behavior was modified. No commits/pushes. No Mobile LOD. No `run.json` and no final acceptance verdict. Parent owns registration/attribution and independent review. All harness/measurement/QC work here is Sol-authored over mixed/sourced model inputs; no new Astra-authored output is claimed.


## Current gate status — Sol finalization 2026-10-22T19:23:51.374445+00:00

Static/reproduction and authentic private attribution pass; fixed-view visual acceptance fails: irregular/scalloped highlights in both finishes. Original rejected candidate retained, not promoted. 108 matrix cases, 64 actual browser transitions and 120 warmed diagnostic samples. Fixed-view research decision is separate from application acceptance.
Earlier no-final-verdict/run.json and pending-review statements describe the original evidence-production boundary and are superseded by this appended status and finalized run record. Existing artifact-inventory.json is historical: do not regenerate it to erase the boundary. Record start uses earliest recorded HTTP response Date among retained raw browser records; pre-capture preparation start unavailable; end includes ledger finalization, not an active-render timing claim. All harness work is Sol-authored over mixed source assets.
