# Isolated Safe WebGL handoff

Status: partial, not accepted or promoted. Stop for Sol review. No Mobile LOD, second model, photoreal work, public integration, commits, or pushes.

## Diagnosis and transformation

See diagnosis.md, written before transforming, and source-inspection.json. The measured target is raw GLB delivery bytes, not FPS or shader compile time. Material complexity, continuous rendering and primitive submissions remain plausible dominant runtime costs. No runtime code changed.

One candidate recipe was executed twice independently from the immutable Estuary control using glTF Transform 4.5.1 and meshoptimizer 1.2.0. transform.mjs pins the source and dependency versions, uses fixed repository-controlled arguments, and refuses to overwrite attempts. Parameters: simplify --ratio 0.80 --error 0.0001 --lock-border true. Ratio is a target; the conservative error and topology constraints prevented a full 20% triangle reduction. No additional correction attempt pursued a quota at the expense of visual risk. No Blender, bpy, gltfpack, retopology or DCC authorship is claimed.

Reproduction: run from /workspace with `python research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab/command.py node research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab/transform.mjs` in a clean copy where the output files do not exist. Both independent outputs are retained as candidate.glb and repeat.glb. They match exact bytes, not merely the hash. The script intentionally refuses to replace existing evidence.

## Measured result

Source: 10,191,496 bytes; SHA-256 bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f.
Candidate: 9,051,644 bytes; SHA-256 0c57718add772f1265f8cbb3d9f165bc3b06c73629b50f5297f31f844d32c810.

- Raw delivery bytes: -1,139,852 (-11.1843%).
- Triangles: 213,195 to 177,415 (-35,780; -16.7828%).
- Submitted triangle indices: 639,585 to 532,245 (-107,340; -16.7828%).
- Distinct POSITION accessor entries: 162,646 to 141,935 (-20,711; -12.7338%).
- Unchanged: 99 nodes, 95 meshes, 107 primitives, 30 materials, 14 textures/images, four variants covering 25 primitives each.

These counts are not GPU uploads, vertex shader invocations or measured draw calls. HTTP transfer encoding and browser speed have not been measured.

## Independent static checks

verify.mjs does not import or execute transform.mjs. It independently parses raw GLB JSON/binary and runs the existing scripts/report-geometry.mjs on both control and candidate; that reporter separately parses through NodeIO. Both reports conform to the geometry-report schema. The candidate report is intentionally named candidate-geometry-report.pending.json because its proposed asset ID is not registered in the immutable manifest.

Seventeen static checks pass, including source pin, repeat equality, schemas, protected counts, bounds within the predeclared 1e-6 metre tolerance, forbidden-node absence, exact hierarchy/transforms, texture/sampler identity, embedded KTX2 payload hashes, material semantics, extensions, primitive assignments and complete variant mappings. Every candidate vertex attribute tuple (position, normal, all UVs and tangent where present) is an exact tuple from the corresponding control primitive. This does not guarantee identical interpolation on simplified triangles. All previous/next variant pairs were simulated according to the current viewer's mapping semantics; this establishes static history independence, not actual browser execution.

## Failure and correction record

Initial verification failed exact material JSON equality: the serializer omitted explicit alphaMode: OPAQUE on the two Estuary materials. OPAQUE is glTF's default, so rendering semantics are unchanged. Preserved verify-initial.mjs and verification-initial-failure.json. One comparison-only correction normalizes that single default; all other material fields remain strict deep-equality checks. No candidate bytes or transformation parameters changed. Conservatively count one verification correction against the maximum three-round budget, leaving at most two for Sol-requested corrections. No rejected geometry attempts were deleted or overwritten.

## Official validator

Both source and candidate: gltf-validator 2.0.0-dev.3.10, zero errors, 28 warnings and 15 infos. Full outputs are retained separately. Codes: UNSUPPORTED_EXTENSION, VALUE_NOT_IN_LIST, UNUSED_OBJECT, IMAGE_UNRECOGNIZED_FORMAT. This npm validator does not fully support KHR_texture_basisu / image/ktx2; zero errors is not full current-Khronos certification. The exact embedded texture bytes and links are preserved independently.

## Outstanding acceptance gates

No GUI applications or browser processes were launched. The required visual matrix is pending: front three-quarter, side, rear three-quarter; wheel/brake, mirror/window frame, wipers, panel seams, primary interior and glass edge/refraction, with Estuary and a supplied finish plus wireframe, at fixed 600x400 settings. Silhouette, circularity and surface appearance are unaccepted until that review. Stop/reject if any protected feature visibly fails.

Browser gates also remain pending: actual history-independent switching, error-free KTX2 loading, fetch/decode/parse, first correct frame, cold synchronous compilation, live program/geometry/texture/draw counts and counterbalanced warmed p50/p95 timings. Software rendering must not be presented as production-GPU performance. No runtime performance improvement is claimed.

## Provenance and private session request

Current runtime-reported session ID: local-d8fc14b866ab86f25880391b832b60f366b81a1d92cd5df6932349a5b4b04c42.
Runtime-reported model/provider: gpt-6-astra / openai-codex. Private persistence and route/billing metadata cannot be authenticated from this package alone. Attribution is provisional, not accepted. The mixed provenance lane describes the sourced model plus this session's transformation; it does not bypass the private-evidence gate.

Sol must export/copy the authentic persisted JSONL for this exact fresh session to the ignored path:
research/runs/2026-10-21-astra-geometry-safe-d8fc14b866ab/session.jsonl

Verify exact session ID, model, provider, billing provider and available route metadata, and confirm this was not a mid-session switch. Do not fabricate an export, publish the transcript or make a clean build require it. Then register the research-only candidate, finalize the pending geometry report, independently review semantic/visual/browser/reproduction evidence, and accept, reject or request remaining corrections. Keep the public control unchanged.

## Scope and command evidence

commands.jsonl records exact timestamps, argv, cwd, exit status, stdout and stderr for package execution, including child authoring/reporting commands and the initial verifier failure. Preliminary read-only discovery and file-tool writes are in the Hermes conversation transcript, not reconstructed with invented timestamps. environment.json captures runtime/tool/source identity. workspace-before.json and scope-verification.json compare existing tracked and untracked project file hashes outside this run.

The reporter's exact-baseline regression test was executed and passed. Full app build was deliberately not run because it regenerates protected study data; no application code was changed. Package schemas and syntax are checked separately. All acceptance claims remain bounded to the recorded static evidence.


## Current gates — Sol ledger finalization 2026-10-22T19:23:51.374445+00:00

Static/reproduction and authentic private attribution pass; fixed-view visual acceptance fails: irregular/scalloped highlights in both finishes. Original rejected candidate retained, not promoted.
Authentic final private export verified locally; earlier pending-persistence statements above are historical and superseded. The private export remains ignored and mode 0600; session-evidence.sha256 publishes its digest only. No fourth correction is authorized. Canonical evaluator reports are separate, not overwritten author reports.
