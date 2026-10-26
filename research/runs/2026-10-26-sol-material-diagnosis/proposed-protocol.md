# Frozen proposal v1 — next bounded material investigation

Attribution: Sol analysis. Status: **protocol recorded before any candidate authoring; execution NOT authorized or performed**. No new controlled captures exist in this package. This is not a registered/accepted subject benchmark run.

## Gate 0: immutable identity and ownership

- Retain checkpoint commit `ffe0a56982a0bb22c34d705b1c00f0a62d147a0f`, the source copies and SHA-256 values in `frozen-source-pins.json`, and the four asset pins in `inventory.json`. Safe must match `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`; corresponding original Estuary control must match `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`.
- Grounding repair is independently owned. Do not touch it or use its outputs as a material improvement. Choose the frozen recipe for both arms; if a later ground fix is adopted, freeze a new protocol revision and apply the same new rig to both arms. Never compare an old-ground control to a new-ground candidate.
- Reviewer must identify a named residual concern and target region before experimentation (paint highlight continuity, windshield readability, or wheel finish). No objective realism metric is available. Keep authorship, static validity, visual preference, integration and publication approvals separate.

## Stage A: localize material response versus Safe geometry — planned only

Use a new isolated comparison harness reusing the exact frozen rig, not two hand-recreated approximations. Pin installed Three.js, browser executable/version, WebGL vendor/renderer/capabilities, harness files and applied GLB response hashes. Freeze actual camera matrices, model transform, clipping planes, projection, viewport **600×400 DPR 1**, sRGB output, ACESFilmic exposure **1.05**, background, procedural environment and PMREM sigma **0.08**, key/hemi/rim and shadow settings. Report software rendering explicitly if used. No timing/performance ranking.

Derive centering, transformed model pose and all close-up cameras from the Estuary control only and reuse verbatim for Safe. Use frozen application orientation -0.22 radians; do not refit the candidate to hide differences. Native application home camera is [6.4,3.25,7.2], target [0,0.55,0.1], FOV 32; resolve precise near/far and aspect in matrix data before capture. Freeze target bounds/cameras for hood, left door seam, windshield/glass edge and front-left wheel from the control, inspect them for clipping before acquisition. Do not assume the old geometry camera package already matches this selected rig.

Balanced matrix: two assets × four supplied finishes × four targets (hood, door seam, glass, wheel) × one fixed `alloy` runtime trim = **32 planned shaded images**. Compare the native untouched rim materials against runtime alloy/dark only in the separate wheel investigation, not silently in this matrix. For native-reproduction `alloy`, explicitly apply the same runtime override to both assets. Record 25 mapped-primitive assignments per finish if that expectation is independently confirmed against these pinned bytes; fail on missing/duplicate mappings, not on UI readiness alone. Require all finish-to-finish assignments (including self transitions) to resolve atomically and observe the actual applied material indices. Do not infer completion from a persistent ready indicator.

Preflight matrix with unique output names, balanced counts, nonempty named targets, identical transforms/settings and matching input pins. Run sequential bounded batches, append manifests per batch, retain failures. Warm up a fixed declared number of complete frames (proposed 3 after material application; revise before acquisition if stability check fails), then capture and rerender once to distinguish true repeat-render stability from repeat readback. Require nonblank image content, decode dimensions, hash each capture and inspect every panel plus native suspect regions. Pixel differences may locate a deviation; they are not perceptual quality scores.

Interpretation:
- Same defect in control and Safe under this rig -> inherited material/source-geometry/presentation causes remain possible; not proof that geometry is sound.
- Safe-only difference -> topology/interpolation is implicated, because material fields, textures and mappings are held constant. Retain original and open geometry diagnosis; do not smooth normals, change paint or soften light to hide it.
- Defect changes with finish on the same mesh -> material response is implicated but does not exclude normal/topology interactions.
- Inspect corresponding wireframe and normal-direction diagnostics at a named failing region only if Stage A establishes it; do not add wholesale geometry editing.

## Stage B: smallest next material test — conditional proposal, not authored

Default first material intervention, **only if Stage A points to Estuary paint response**: clone Safe independently into a fresh candidate package and change **only material 28 `Estuary Enamel Main` / KHR_materials_clearcoat.clearcoatRoughnessFactor from 0.12 to 0.20**. Keep accent, base color, base roughness 0.32, metalness 0, clearcoat amount 1, textures, variant mappings, geometry, normals, lighting and wheel state untouched. This is a hypothesis about broader reflected highlights, not a predicted improvement. If the nominated defect is glass or wheels, obtain a revised one-variable protocol instead of stacking glass/paint/rim changes.

A/B matrix: unchanged Safe versus one candidate, Estuary Enamel, the already frozen hood and door close-ups, plus one whole-car home view = **6 planned images**. Add one unchanged Carmine home capture per arm as a protected-finish regression check = **8 total planned images**. Capture in the same harness/settings as Stage A. No new HDR, exposure, tone-mapping, ground, postprocessing, normal recalculation or geometry simplification.

Before images: inspect independent semantic diff, allowing exactly the single declared scalar path; all other materials/extensions, mappings/defaults, hierarchy/transforms, attribute and index payloads, texture bytes and licensing/trademark-removal state must remain unchanged. Rebuild twice and require identical candidate hashes. A DCC round-trip that changes unrelated semantics fails this one-field contract; use a deterministic glTF edit for the browser test and keep Blender as inspection/reference unless a separately reviewed broader export contract is needed.

Stop if quality is worse, finish differentiation/interior visibility is lost, or the semantic diff expands. Present blinded A/B native images, disclose tradeoffs and ask Jay to select or retain control; no silent default change. Retain a negative result. No asset replacement, app integration, commit, push or deployment without separate authorization.

## Decisions/prerequisites

1. Approve controlled Stage A captures and nominate the defect/region; none are performed here.
2. Confirm frozen-ground versus newly accepted ground baseline; keep both arms identical.
3. Approve Stage B only after localization, or request a revised glass/rim one-variable test.
4. For Blender: authorize a host/tool-enabled workspace separately; this backend has neither executable nor bpy. No install/dependency/mount changes are part of this package. Confirm importer support for Basis KTX2 and material variants/extensions before importing; see `blender-brief.md`.
