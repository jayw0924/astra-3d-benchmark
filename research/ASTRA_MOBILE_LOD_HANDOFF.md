# Astra Mobile LOD — isolated research candidate

## Current notice — historical instructions, not authorization

The existing Mobile LOD low-benefit experiment is stopped. This retained brief gives no authority to rerun it, spend remaining corrections, promote it, or start further authoring. The imperative instructions below are historical evidence only. The accepted Safe runtime remains unchanged; current refined lighting acceptance is in [the lighting integration record](runs/2026-10-26-sol-lighting-integration/run.json) and [current acceptance](runs/2026-10-26-sol-lighting-integration/finalization-2026-10-26/current-acceptance.json). No commit, push or deployment is authorized.

## Work-package boundary

Safe WebGL is locally integrated and preserved. Execute ONE independent Mobile LOD authoring experiment, not application integration. Start from the original Estuary control, NEVER from the accepted Safe WebGL candidate or any rejected/corrected candidate. Mobile LOD is a target, not a mobile performance or quality verdict. It stays research-only until separate visual/browser review, a tested selection policy and real-device evidence justify integration.

No public/src/manifest/generated-data edits, dependency changes, commits, pushes, remote deployment, GUI launches or external generation. No automatic user-agent/viewport LOD selection. No second model or photoreal work.

## Launch and evidence

Start a fresh Hermes CLI session from the host shell:

`hermes --cli --in /home/jay/projects/external/configurator-demo --provider openai-codex --model gpt-6-astra --pass-session-id`

Proceed provisionally if runtime metadata is gpt-6-astra/openai-codex, a concrete session ID is available, the immutable source is verified, and there is no actual earlier Sol work or explicit runtime-model-switch notice in this session. `/status` is an optional human diagnostic, not mandatory pasted proof of persistence. Handoff discussion of switches is not an actual runtime switch. Record private persistence as unverified until authentic post-run export; missing export blocks final attribution/acceptance, not isolated authoring. Use only terminal/file tools and headless Playwright.

## Read first

- `research/protocols/geometry-optimization-v1.md` completely (frozen protocol, especially Mobile LOD, semantic gates and promotion rule).
- `research/runs/2026-10-21-sol-geometry-toolchain-preflight/{notes.md,environment.json,verification.json}`.
- `research/runs/2026-10-21-sol-geometry-baseline/reports/integrated/geometry-report.json`.
- `research/SAFE_WEBGL_INTEGRATION.md`, for current deployment boundary only.
- `research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/{notes.md,diagnosis.md,transform.mjs,verify.mjs}` as disclosed prior recipe/defect evidence; inspect sibling files before relying on names.
- `research/runs/2026-10-22-sol-safe-final-comparison/{control-spec.json,plan.mjs,capture.mjs,visual-review.md}` for fixed camera/render settings and linked harness files.
- `research/asset-manifest.json`, run and geometry schemas, `scripts/report-geometry.mjs`.

Exposure to Safe WebGL recipes is explicit: this is independent binary reconstruction, NOT a blind/conceptually independent experiment.

## Immutable source and allowed write scope

- asset ID: `web-product-estuary`
- path: `public/assets/models/product-estuary.glb`
- bytes: `10191496`
- SHA-256: `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`

Verify source pins through actual tools. Inventory existing runs, then create one unique `research/runs/<date>-astra-geometry-mobile-<session-suffix>/`. Write only there. Capture protected-file baseline before substantive work, including existing tracked/nonignored files; metadata-only secret/transcript handling. Preserve all prior models and source bytes.

## Optimization question

Test whether a more aggressive, semantically intact geometry derivative yields materially smaller delivery while retaining silhouette and primary detail at the frozen comparison scale. Protocol v1's 45–65% geometry reduction is a hypothesis, not a quota or acceptance threshold. Return an honest smaller reduction, no-benefit result, or blocked result rather than destroying visible quality to hit it.

Rank likely bottlenecks first: triangle geometry, primitive submissions, textures, material/shader complexity, compilation and continuous rendering. Geometry reduction does not establish mobile FPS. Choose and state a named deployment metric; keep app runtime/material/texture changes out of this first geometry-only experiment so causality stays interpretable.

Use exact pinned glTF Transform 4.5.1 / meshoptimizer 1.2.0. Blender/bpy and standalone gltfpack were unavailable; re-probe availability without installing, and do not claim DCC retopology. Prefer conservative local simplification/exclusions where known reflective/structural details are sensitive. Protect the hood/grill/glass/pillar surfaces implicated in prior regressions unless a measured, documented alternative preserves them. Do not presume the Safe exclusion set is optimal for Mobile; justify decisions from source inspection and fixed-view evidence.

Preserve all four variant names and exactly 25 mapped primitives per variant, deterministic/history-independent mappings, required hierarchy names, origin/orientation/dimensions, material assignments, texture payloads, required UV/normal/tangent attributes, sanitized mark state, wheel circularity/placement, lamps/mirrors, panel boundaries, wipers, glass and primary interior forms. Do not flatten/merge identities or recompress textures in this initial package; those require an isolated, justified follow-on experiment. Declare intentional visual deviations; do not call them accepted.

## Deliverables and verification

1. Exact prompt, diagnosis, immutable source hash, environment, exact runtime session ID/model/provider and actual timestamps; explicit unknown cost.
2. One explained deterministic recipe plus candidate/repeat independently rebuilt from immutable control and proven byte-identical. Refuse overwriting attempts and preserve failures.
3. Independent raw/NodeIO geometry/semantic inspection that does not execute authoring script. Verify index validity, exact protected source geometry, accessor isolation, preserved materials/textures/hierarchy/transforms/variants and required attributes. Document geometry quality not proven by these checks (interpolation, silhouette or hidden details).
4. `candidate-geometry-report.pending.json` generated by the repository reporter with role `mobile-lod`, proposed unique asset ID, exact bytes/hash/counts/bounds. Do not register it in the canonical manifest yourself.
5. Official pinned validator report preserving KTX2 support warnings; zero errors is not full current conformance certification.
6. Actual timestamped argv/cwd/exit/stdout/stderr logs, protected-file after comparison and all setup failures. Do not reconstruct invented command timestamps for file-tool activity.
7. Initial headless fixed-view comparison: identical control-derived cameras and 600x400 DPR1 settings, Estuary and Carmine. At minimum front/side/rear and vulnerable wheel, hood/glass/pillar/seam details. Copy/adapt harness ONLY within new directory. Exact model hashes, nonblank/draw checks, assignments, native PNG dimensions/hashes, contact sheet and honest visual limitations. Fresh control renders must match the accepted controls before comparing. This is preliminary QC, not full Mobile acceptance or real-device certification. If impractical, explicitly mark visual gates unavailable and return partial.
8. If testing mobile layout additionally, declare viewport/DPR and identical framing for both models before captures. Do not silently substitute it for the frozen 600x400 scored evidence, infer real-device behavior from emulation, or introduce acceptance thresholds after looking at results.
9. Run record conforming to schema, output provenance one-to-one, human brief and reused Sol harness separately attributed. Outcome partial or blocked pending authentic private export and independent Sol acceptance. Maximum three correction rounds under protocol; do not silently spend all three in an optimization search. Produce the initial candidate and stop for feedback.

## Return and stop

Report exact run path, candidate bytes/hash/deltas, reproducibility, protected semantics, observed visual deviations, actual corrections used and remaining gates. Request authentic private export to `<new-run>/session.jsonl`; do not fabricate it or publish it. Keep existing public Safe WebGL model unchanged. STOP for Sol review. No automatic promotion or LOD switching.
