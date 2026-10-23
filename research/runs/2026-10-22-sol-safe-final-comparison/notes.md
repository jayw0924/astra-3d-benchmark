# FINAL candidate comparison — executed evidence, no final verdict

Input: `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`, 9239404 bytes. Control: `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`, 10191496 bytes.

## Verified results

- Matrix: 108 images; 54 genuinely new FINAL renders in five checkpointed batches and 54 byte/hash-verified reused controls. All nine targets × two models × two finishes × three modes; fixed 600×400 DPR1, frozen control-derived cameras, RoomEnvironment PMREM 0.04, ACESFilmic exposure 1.05 sRGB, rotation −0.22. No direct-light/material/camera changes.
- All 9 contact sheets (108 panels) and four native seam/hood pairs actually inspected; ten supplemental images decoded and reviewed (threeway context images tool-downscaled). The rectangular seam patch is absent in FINAL in both finishes. Two declared seam ROI boxes are pixel-identical to control in both finishes. Earlier hood repair retained; no new blocking defect observed at the requested fixed views. See `visual-review.md` for visibility limits, not a parity or promotion claim.
- Actual ABBA control/final/final/control in 4 fresh browser contexts, each in a separate Chromium process. 64 all-four-variant ordered transitions, 25 verified assignments each, 120 raw warmed samples. Stable canonical assignments across histories and contexts.
- All 108 gallery images decoded in Chromium, no gallery errors. Pillow decoded all 127 package PNGs. 16 author targeted frames are byte-identical to independently reproduced acceptance frames (8 fresh author controls map to reused accepted controls, 8 author FINAL frames map to genuinely new renders).
- Test-first pin and balanced matrix actual RED/GREEN preserved. Package tests: 7 pass; fast app unit 18, scripts 25, prior render-plan 6 pass. Tests do not run a production build or mutate generated study data.
- 738 pre-existing tracked/nonignored files checked by exact content hash/byte length, zero protected changes and zero new out-of-scope paths. Input GLBs explicitly pinned before/after. Ignored dependencies/caches/private exports are excluded from broad Git snapshot; browser executable hash and dependency versions independently match original reuse environment. Host path is mapped to verified Docker `/workspace`; see `initial-inventory.json`.

## Delivery / static counts

Candidate file payload is -952,092 bytes (9.342024% reduction) relative to control. Static triangles 213,195 → 183,117; this is author verification data pinned by the protected snapshot, not inferred GPU work. Browser resource body lengths independently match GLB pins; HTTP identity encoding, no Content-Encoding header, no disk-cache GLB responses. CDP encodedDataLength also includes HTTP overhead and is not mislabeled as file payload.

## Actual diagnostic timing, milliseconds

| Order/model | Fetch+parse | Cold sync compile | First render submit+finish | Warm submit+finish p50/p95 | Warm render+finish+rAF p50/p95 |
|---|---:|---:|---:|---:|---:|
| 0 / control | 16128.900 | 63.800 | 1647.100 | 2.600 / 96.100 | 9499.000 / 19096.300 |
| 1 / safe | 16024.500 | 69.000 | 1721.100 | 2.800 / 59.800 | 8494.200 / 9689.900 |
| 2 / safe | 15606.000 | 14.900 | 1804.400 | 2.900 / 53.100 | 8498.900 / 17204.000 |
| 3 / control | 15899.400 | 69.200 | 1779.800 | 2.700 / 8.000 | 9105.000 / 19503.600 |

Nearest-rank percentiles, 30 raw warmed samples per context after six warmup frames. `renderer.compile(scene,camera)` occurs before the first model render; PMREM/basis setup is separate. These are CPU wall measurements around renderer.render plus blocking gl.finish, optionally including a subsequent requestAnimationFrame. They are not GPU timer measurements, display latency, or production GPU rankings. First-correct-frame is **unavailable**, since correctness was not checked at that timestamp. The separately named load-to-first-rendered-frame field is not silently relabeled.

Native/sheet packaging overlapped the first control context; gallery decode also occurred during acquisition. Driver/OS caches and host scheduling are uncontrolled. Do not turn these actual diagnostic samples into an isolated-hardware speedup claim. The generic unchanged raw scope prose mentions shared browser process; actual one-model-per-invocation execution is separately documented and summarized correctly.

The very large divergence between millisecond-scale submit+finish samples and multi-second render+finish+rAF samples is an observed scheduling/presentation-path limitation, not a proven geometry/GPU cost attribution. The cause was not isolated. These samples therefore do **not** establish production steady-frame performance or a model speedup; no such ranking is made. The four cold-scene compile measurements also do not prove globally cold browser/driver shader caches.

## Reuse, failures and inventory

The original source control, page.js, page.html and control-spec.json have exact verified SHA-256 identities. Original recorded harness input hashes, browser executable SHA-256 and exact Three/Playwright versions were checked before reusing the 54 control PNGs. Each control PNG was length/hash-verified before copying. Zero prior candidate frames were reused as FINAL. All retained PNG identities were rehashed at every checkpoint resume. Rendering harness semantics are unchanged; only model pins, packaging labels/guards and evidence orchestration were adapted.

Exact argv/cwd/start/end or elapsed/exit/stdout+stderr are preserved in commands.jsonl and referenced logs. Expected RED tests, the failed original environment-schema guard, and the 60-second tool wait timeout whose child continued and completed are preserved; see tool-attempts.md. No rerender was initiated for that wait timeout. No completed captures were rerun. Disposable script-test fixtures were explicitly cleaned after real tests; raw evidence was not deleted.

Final artifact-inventory.json lists SHA-256 and bytes for every retained package file except itself (self-reference). Broad protected-scope exclusions are explicit in initial-inventory.json. No final verdict, run.json, registration, promotion, geometry edit, public/src/manifest/package change, GUI launch, Mobile LOD, or commit is part of this package. Correction budget remains exhausted. Parent handles final acceptance and authenticated attribution; private exports were not read or manufactured by this subtask.


## Current gate status — Sol finalization 2026-10-22T19:23:51.374445+00:00

Authentic private attribution, independent static/reproduction and frozen fixed-view research gates pass. FINAL accepted research artifact only; separate application integration acceptance required. Runtime speedup not established; first-correct-frame unavailable. Correction budget exhausted. 108 matrix cases, 64 actual browser transitions and 120 warmed diagnostic samples. Fixed-view research decision is separate from application acceptance.
Earlier no-final-verdict/run.json and pending-review statements describe the original evidence-production boundary and are superseded by this appended status and finalized run record. Existing artifact-inventory.json is historical: do not regenerate it to erase the boundary. Record start uses first retained commands.jsonl startedAt; end includes ledger finalization, not an active-render timing claim. All harness work is Sol-authored over mixed source assets.
