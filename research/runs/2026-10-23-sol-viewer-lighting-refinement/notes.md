# Bounded studio refinement — recovered closeout

## Outcome and review boundary

**32/32 native captures, 16 paired comparisons, retained without recapture. Original live default remains `original`.** Two research rigs × four finishes × three exterior views plus glass. No human preference, objective realism conclusion, promotion, commit, push, deployment or `run.json`. This is Sol presentation work, not Astra geometry work. `grounded-studio` is a research comparator, not the production default.

Source: `public/assets/models/product-estuary-safe.glb`, 9,239,404 bytes, SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`. Shared factory capture pin: `e857ac0f409258a31d71ae7c7f19b97975036e7bed62e1aff1c872e6e65e0030`. Full source/harness pins remain in `plan-frozen.json` and `capture-manifest.json`; all were rehashed on recovery. Source, material assignments, transform, camera, ACESFilmic exposure 1.05, sRGB, background and 600×400 DPR1 are fixed. The candidate bundles room orientation/panel changes, reduced direct lights and a nearer-overhead/lighter floor shadow; see `brief.md` and `recipe.md`. It is not an isolated causal orientation experiment.

## Actual visual tradeoff (author inspection, not user choice)

All four finish contact sheets and all seven unscaled native-pair sheets were loaded and inspected during recovery, plus both gallery screenshots. Native pairs retain each original 600×400 frame without resampling.

- **Glass:** the candidate substantially reduces the broad diagonal white windshield wash across all four finishes. Wipers, seats and steering/dash detail are more exposed. The small bright upper-left point glint remains; the windshield is not reflection-free.
- **Reflection redistribution:** a stronger broad bright roof-panel highlight appears in the native candidate glass views, especially Pearly and Graphite. Bright hood/shoulder reflections and Carmine metallic speckle remain. Reducing windshield wash did not eliminate bright reflections; some emphasis moved to roof/body surfaces.
- **Body:** finish identity and broad form remain readable, but candidate doors, lower panels and rear surfaces darken, most noticeably Carmine/Graphite and the teal Estuary side. Black wheel spokes remain dark. This is a genuine illumination/readability cost, not an unqualified improvement.
- **Pearly:** pastel green/pink iridescence and silver body remain visible; somewhat darker side/rear midtones give more tonal separation, but pale/near-white highlights and bright white seat areas remain. No claim that Pearly is fully balanced or that source materials were fixed.
- **Grounding:** floor shadow is visibly shorter, lighter and more concentrated beneath the car, especially rear three-quarter; the previous long directional silhouette is less prominent. It is still a filtered directional shadow, not physical area-light contact. Some side-view wheel/contact ambiguity persists; geometry was not moved.

No blank, incorrect-finish or mismatched-camera panel was found in the inspected sheets. Exterior framing remains relatively distant by design. No additional paint/wheel captures were needed for this bounded closeout.

## Baseline replay parity — not bit-identical

Independent decoding/comparison confirms **10/16 exact PNG-byte matches; six frames differ at exactly five RGB pixels each**. Four rear views have maximum channel delta 12; Pearly and Graphite front views have maximum delta 4. These are scattered small wheel/edge/dark-surface pixel differences, not broad image shifts; all 30 changed-pixel neighborhoods were inspected enlarged nearest-neighbor in `resume-audit/parity-pixel-context.png`. Exact coordinates/deltas are in `resume-audit/independent-evidence.json`; original `baseline-parity.json` is preserved. Cause remains unisolated; context/material/program history is only a possibility. No pixel retouching or rerender was used to force parity. The prior package's 209 SHA256SUMS-listed files rehash correctly, and all preexisting files were preserved by this recovery.

## Evidence and tests

- Manifest IDs cover the frozen 32-case matrix exactly. Every native PNG was rehashed, byte-count checked and fully decoded at 600×400. Paired cameras, transforms and 25 material assignments agree and match frozen cameras/transform.
- Eight completed raw sessions and all eight batch completion logs exist. Each session records one served GLB request with the pinned response hash/size, both rigs, 16 finish-assignment transitions and successful environment/model-shadow/renderer-shadow-state restoration. These transitions test applied references, not separately captured images of all transition histories.
- `raw/unit-final.log`: 27 tests in five files pass. `raw/plan-final.log`: two focused evidence/plan tests pass. `raw/build-final.log`: TypeScript plus Vite `build:app` completed successfully, with the existing >500 kB chunk warning. Completed tests/build were not duplicated merely because delegation was interrupted.
- Historical lint logs contain no error but no explicit recorded exit code. Recovery reran only lint: exit 0, exact execution record and output in `resume-audit/lint-execution.json` and `lint.log`.
- Existing `verify.mjs` was run read-only successfully during recovery; the separately implemented `resume-audit/audit.py` also passed. It independently checks actual files, source/harness pins, decoded dimensions, matrix/pairs, sessions and historical parity. Pillow emitted only a deprecated-getdata warning; no evidence failure.
- Historical gallery check reports 32 decoded images, no bad image, no overflow and no errors at 1280 and 390 px; corresponding screenshots were inspected. On mobile the pairs stack rather than remaining literal left/right. The gallery's existing notes link is now populated.
- Chromium 156.0.8078.4 / ANGLE Vulkan SwiftShader; readPixels stall warnings are retained, no page/request/console errors in completed sessions. Timing/counts are software-renderer diagnostics only; no real-GPU ranking. No full live-app E2E was run; controls/URL behavior and device performance are not newly certified.

## Failure and recovery disclosure

The task handoff reports an interrupted owner before closeout. Evidence does **not** show an unfinished capture: all 32 images and eight completed sessions already existed. No task-related renderer/test/server process was still running in this recovery backend's process listing. This does not assert anything about processes outside that backend. The owner's exact interruption command, exit status, cause and time are unknown and are not reconstructed.

Preserved RED/GREEN logs show the shadow `needsUpdate` restoration bug failing for both prior values, then passing, and candidate absence failing then passing. The final source already restores `needsUpdate` and retains the `original` factory default; no source repair was needed during recovery. `raw/unit-concurrent-timeout.log` records a real App test timeout (one failed, 26 passed); subsequent `raw/unit-final.log` records all 27 passing. The filename suggests concurrency, but a resource-contention cause was not proven. No timeout increase or suppressed failure was introduced here. Prior experiment interruptions/rejected grounding captures remain in the original run and are not new refinement failures.

Recovery added documentation, an independent audit, parity-pixel inspection aid and integrity inventories only. No preexisting evidence/logs/scripts were overwritten. `resume-audit/before.json` snapshots the 1,489 preexisting tracked/nonignored files; final preservation/path-scope reconciliation is in `resume-audit/preservation.json`. Ignored build/cache files and other machines are outside that snapshot's scope. Existing capture timestamps are retained as evidence, not newly invented completion times.

## Preview and remaining gates

Open `/home/jay/projects/external/configurator-demo/research/runs/2026-10-23-sol-viewer-lighting-refinement/index.html` directly. Useful comparisons: `sheets/native-1-glass.png`, `sheets/native-1-side.png`, `sheets/native-1-rear-three-quarter.png`, and all `sheets/finish-{0..3}.png`. Desktop/mobile previews: `gallery-1280.png`, `gallery-390.png`. These are local files; no server was left running. Alternatively start the repository's normal Vite dev server and use `/research/runs/2026-10-23-sol-viewer-lighting-refinement/index.html`.

No executable closeout blocker remains. Human preference/default selection remains pending. If a default is later proposed, obtain that choice and run the separately required live-app E2E; do not treat this recovered package as authorization.


## Current finalization status — 2026-10-26T17:59:00.644Z

The preceding text is preserved historical evidence. It is superseded for current status by `../2026-10-26-sol-lighting-integration/finalization-2026-10-26/current-acceptance.json` (from this package directory). Jay accepted `grounded-studio-refined`, now integrated locally, as a published checkpoint with residual issues. This is not geometry/material realism, objective realism or physical-mobile certification. Complete Sol run records and additive evaluator checks now exist; historical inventories, captures, preferences and verification bytes remain unchanged. Earlier pending/default/no-run statements above and in frozen artifacts describe their original boundary. No staging, commit, push or deployment is performed by this finalization. The new run timing extends only an observed retained-evidence boundary through record finalization, not measured active runtime; cost is unavailable.
