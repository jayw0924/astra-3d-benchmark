# Additive grounding evidence follow-up

## Outcome and scope

Six newly rendered desktop before/after pairs (12 native PNGs): Carmine Candy and Estuary Enamel × side/front/wheel. Each native PNG has a same-frame JSON record in **both** arms, including actual camera position, quaternion, projection matrix, matrixWorld and OrbitControls target; root/mesh model transforms; actual finish/material assignments and material parameters; floor transform/material receiver settings; shadow bias/filter/map/camera settings and renderer state. Camera equality is asserted against the newly captured before arm at runtime, not inferred from requested positions or checked UI controls. Model transforms, actual material assignments, shadow settings and recorded renderer settings also pass exact equality.

This is new evidence, not reconstructed historical telemetry. Historical six-desktop-pair camera equality remains uncertifiable. The prior mobile evidence is not recaptured or expanded here. No exhaustive finish/trim/interaction matrix is claimed. User visual approval remains pending.

## Source/protocol provenance

The capture harness first read package scripts and the prior capture harness. It runs the actual Vite application with a research-only pre-load plugin: before serves the exact `src/lib/viewerLighting.ts` from Git revision `ffe0a56982a0bb22c34d705b1c00f0a62d147a0f`, checked byte-for-byte against the prior frozen source. After serves a snapshot of the current file, not an in-browser reversal synthesized from missing telemetry. Both source snapshots and SHA-256s are retained. `source.diff` documents the sole lighting-module difference: precise-vertex receiver placement. All other application modules and accepted GLB are shared unchanged.

A query-tolerant Playwright response route exposes existing application closure objects. It does not replace the renderer, scene, material setup or animation body. The app's own future animation callback renders; framebuffer pixels and telemetry are read synchronously immediately after it. Camera controls are drained with damping disabled before assigning each requested pose. Runtime min-distance enforcement remains active. Camera/model matrices and projection are actual post-render samples, not requested poses.

Desktop viewport 1280×900, DPR 1, native canvas 850×778. SwiftShader software rendering, 500 ms requestAnimationFrame pacing from startup. These are canvas framebuffers, not DOM screenshots or production GPU timings. Captures ran 2026-10-26 19:59:56.759Z–20:14:40.537Z; actual per-arm/finish elapsed seconds and timestamps are in `provenance.json`. All four isolated browser executions completed; capture command exited 0. Vite dependency re-optimization is recorded in `capture.log`.

Commands executed from the repository root:

```sh
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-26-sol-ground-contact/followup-runtime-pairs/capture.mjs > research/runs/2026-10-26-sol-ground-contact/followup-runtime-pairs/capture.log 2>&1
node --check research/runs/2026-10-26-sol-ground-contact/followup-runtime-pairs/capture.mjs
python research/runs/2026-10-26-sol-ground-contact/followup-runtime-pairs/verify.py > research/runs/2026-10-26-sol-ground-contact/followup-runtime-pairs/verify.log
python research/runs/2026-10-26-sol-ground-contact/followup-runtime-pairs/finalize.py
```

Do not rerun capture.mjs in this populated evidence directory: it is a one-run writer. Create a fresh directory for any further capture. Historical e2e/capture writers were not rerun. No production geometry, materials, lights, shadow parameters or application sources were changed by this follow-up. No commit, push or deployment.

## Verification and non-floor pixel disclosure

`verification.json` checks 12 native PNG hashes, per-image records, six pair dimensions, nonblank output, actual camera/model/material/shadow/renderer equality, actual selected environment, allocated 1024×1024 shadow maps, rendered draws and finish assignment. Runtime floor is -0.003 before and 0.1585579729696714 after. Served GLB is 9,239,404 bytes with SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4` in both arms. `historical-preservation.json` and read-only hash checks preserve all 65 historical files, including all 14 original native PNGs, original inventories, and the literal two-byte `before-captures.json` value `[]`.

| Finish/view | Changed pixels | Max channel delta | Upper 427 rows: pixels/max | Interior body ROI: pixels/max |
|---|---:|---:|---:|---:|
| Carmine side | 29120 | 51 | 11 / 51 | 2 / 39 |
| Carmine front | 17234 | 31 | 140 / 31 | 1 / 2 |
| Carmine wheel | 60114 | 31 | 21449 / 31 | 0 / 0 |
| Estuary side | 29119 | 38 | 9 / 38 | 0 / 0 |
| Estuary front | 17235 | 31 | 141 / 31 | 1 / 2 |
| Estuary wheel | 60114 | 31 | 21449 / 31 | 0 / 0 |

Upper 55% is a spatial diagnostic, **not** a floor mask: wheel shadows extend into that region. Hand-selected interior body rectangles are explicitly recorded in verification JSON; they do not establish exhaustive body segmentation. Carmine side has two changed interior-body pixels with maximum delta 39; both front views have one changed interior-body pixel, delta 2. Tiny scattered above-shadow differences also exist in side images. Their cause is unknown; source/telemetry equality does not justify calling them floor-only or hiding them as harmless. Eight-times amplified differences are linked in the gallery. A separate isolation experiment would be required to attribute these residuals. Prior Carmine historical differences are not replaced by the smaller/new counts.

The follow-up adds 18 PNG files in total: **12 native evidence PNGs plus 6 amplified-difference diagnostic PNGs**. Six JPEG pair images are presentation derivatives, not additional captures. All new native images, diagnostic diffs and gallery pair derivatives were loaded and visually reviewed.

## Visual review

- Carmine side: original shadow visibly detached below tires; after shadow moves to their lower edges. Overall composition/body appearance remains visually stable, but exact body pixels are not identical as disclosed above.
- Carmine front: broad shadow below nose moves closer to bumper/wheel base. Windshield remains strongly washed out and contact remains soft; neither is tuned away.
- Carmine wheel: strongest local contrast. Before shows a distinct vertical shadow gap; after shadow reaches the tire base. Nose/rear crop is intentional in both fixed wheel compositions.
- Estuary side: same receiver correction. Existing lower-body crease/triangulated-looking shading remains visible in both arms, not a new material repair.
- Estuary front: same closer shadow with unchanged broad pale windshield/highlights; tiny body pixel residual disclosed.
- Estuary wheel: separated lower shadow moves to tread base, same fixed crop. No claim of perfect contact occlusion or physical realism.
- All six difference diagnostics: dominant change occupies the shadow band; isolated upper side dots remain visible on amplification. Both arms are present and correctly labelled in every gallery derivative.

## Why the historical before manifest is empty

The exact write that produced the literal `[]` is **not recoverable from retained evidence**, so no historical camera record is fabricated. The retained harness currently initializes a fresh in-memory `results=[]`, skips any already-existing PNG with `access(...)`/`continue`, and only adds telemetry for newly written PNGs. `before-resume2.log` explicitly shows all three Estuary files retained/skipped. `before-resume.log` records a timeout. Thus the resume mechanism cannot recover missing telemetry and can finish with an empty in-memory results list when images already exist. The current final writer's `if(results.length)` guard would not itself write `[]`, which means that literal file cannot be conclusively attributed to the retained final harness version. Earlier writer contents/exact empty-write event are unavailable. Diagnosis is a manifest lifecycle/resume evidence gap, with exact empty-file origin unresolved—not proof that any old camera was wrong.

## Preserved boundaries

No historical notes/gallery/results/inventories were rewritten. `FOLLOWUP_STATUS.md` is a new additive parent-package qualification, not a replacement for old results. The material-diagnosis directory and frozen checkpoint were left alone. This package supports new six-pair camera-controlled grounding evidence only; subjective approval and publication permission remain separate.
