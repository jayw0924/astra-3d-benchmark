# Astra Safe WebGL — bounded visual correction

**Completed historical work package. Do not execute again. The active final correction is `research/ASTRA_SAFE_FINAL_CORRECTION.md`, authorized to address the residual seam artifact while preserving the repaired hood/glass highlights.**

## Decision and scope

The first candidate is not approved for promotion. Execute one corrective work package, not another broad optimization search. Two correction rounds remained after the recorded verifier-default correction; this work consumes the next round. Preserve every previous artifact. No Mobile LOD, public integration, commits, pushes, GUI apps, or external generators.

## Launch

Use a fresh Hermes CLI session created on gpt-6-astra through openai-codex with private persistence. From the host shell, not through a running Hermes bang command:

`hermes --cli --in /home/jay/projects/external/configurator-demo --provider openai-codex --model gpt-6-astra --pass-session-id`

The human may use `/status` as a launch diagnostic, but pasted `/status` output is NOT a prerequisite for authoring and does not authenticate private persistence. Proceed provisionally when runtime metadata identifies gpt-6-astra/openai-codex, a concrete session ID is available, the immutable source is verified, and the current session has no actual earlier Sol work or explicit mid-session switch notice. Read-only launch discovery and this clarification do not invalidate a fresh session. Do not infer a model switch merely from discussion of one in a handoff. Record private persistence as unverified until the authentic post-run export is checked by Sol; missing export blocks attribution/acceptance, not isolated candidate authoring. A terminal path of `/workspace` is expected inside Docker; it is not evidence of model/session identity. Do not resume or switch a Sol conversation.

## Execute this correction

Read these files before writing:

- `research/protocols/geometry-optimization-v1.md`
- `research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab/{notes.md,diagnosis.md,transform.mjs,verify.mjs,verification.json}`
- `research/runs/2026-10-21-sol-safe-webgl-comparison/{decision.json,visual-review.md,control-spec.json,plan.mjs,capture.mjs}`; inventory this directory for linked harness files before using them.
- `research/runs/2026-10-21-sol-geometry-toolchain-preflight/{notes.md,environment.json,verification.json}`
- `research/asset-manifest.json` and geometry/run schemas.

The failure is visible irregular/scalloped highlight edging around the dark hood insert ahead of the windscreen, also seen in glazing/roof-adjacent regions. Wipers themselves broadly align. Inspect the actual native control/candidate pairs:

- `research/runs/2026-10-21-sol-safe-webgl-comparison/rendered/control--wipers--estuary--shaded.png`
- `research/runs/2026-10-21-sol-safe-webgl-comparison/rendered/safe--wipers--estuary--shaded.png`
- `research/runs/2026-10-21-sol-safe-webgl-comparison/rendered/control--glass-edge--estuary--shaded.png`
- `research/runs/2026-10-21-sol-safe-webgl-comparison/rendered/safe--glass-edge--estuary--shaded.png`

Identify the actual implicated nodes/mesh primitives and map them to source geometry; do not assume semantic names establish causality. Prefer excluding the affected source primitives from simplification, or apply tighter local tolerance if justified. Do not alter materials, normals, lighting, exposure, cameras, or runtime code to conceal the geometry regression. If protection cannot be localized safely, reduce optimization aggressiveness or explicitly return blocked; do not chase a reduction quota.

## Immutable input and protected evidence

Every reconstruction MUST begin independently from:

- asset: `web-product-estuary`
- path: `public/assets/models/product-estuary.glb`
- bytes: `10191496`
- SHA-256: `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`

Never use the simplified first candidate as input. Keep its exact bytes (SHA-256 `0c57718add772f1265f8cbb3d9f165bc3b06c73629b50f5297f31f844d32c810`) and all old run files unchanged. Inventory existing run directories, then create a unique `research/runs/<date>-astra-geometry-safe-correction-<session-suffix>/` directory. Write only there. Capture protected-file hashes before substantive work; exclude secrets/transcripts from printed contents.

## Required deliverables and verification

1. Exact prompt, source identity, runtime session ID/model/provider, environment versions, and measured timestamps.
2. Diagnosis identifying protected primitives and the limited correction recipe. Use pinned glTF Transform 4.5.1 / meshoptimizer 1.2.0; no Blender/bpy/gltfpack claims.
3. Deterministic authoring script rebuilt twice from immutable control, candidate/repeat exact byte comparison, hashes and sizes. Never overwrite attempts.
4. Independent raw/parser inspection and geometry report under a pending filename until registered. Preserve hierarchy, transforms, dimensions, all four 25-primitive variants, history-independent mappings, materials, texture payloads, vertex attributes and forbidden-node removal. Normalize only documented glTF defaults, not unexplained differences.
5. Verify protected primitives' geometry is byte/semantically identical to source if using exclusions. Confirm the global simplification implementation cannot mutate those shared accessors unintentionally.
6. Official validator output with known KTX2 limitation; retain all failure logs and timestamped command argv/cwd/stdout/stderr/exit status.
7. If feasible, headless affected-view shaded renders for both Estuary and Carmine using the EXACT accepted control cameras/settings, plus relevant wireframe views. Reuse the existing harness without changing old evidence; copy/adapt it ONLY into the new directory. Validate no blank frames and inspect native images. Do not call this full visual/browser acceptance. If costly or unavailable, leave visual repair explicitly unverified for Sol.
8. `run.json` with partial/blocked outcome pending authentic private session export and independent Sol acceptance. Keep original candidate provenance separate from this new correction and retain inherited licensing.

Report exact new run path, bytes/hash/deltas, reproduction and protected checks, correction budget consumed, observed affected-view result and remaining gates. Declare private export destination `<new-run>/session.jsonl`, request authentic export, and STOP. Do not edit manifests, public files, application source, generated study data, protocols or completed runs. No promotion or Mobile LOD.
