# Astra execution handoff — Safe WebGL geometry run

## Current notice — historical handoff

Safe WebGL authoring, corrections and local integration are complete and independently accepted. This file and both correction briefs are historical instructions—do not execute them again. The existing Mobile LOD low-benefit experiment is stopped; this handoff gives no authority to rerun it or start further authoring. Current refined lighting acceptance is recorded in [the lighting integration record](runs/2026-10-26-sol-lighting-integration/run.json) and [current acceptance](runs/2026-10-26-sol-lighting-integration/finalization-2026-10-26/current-acceptance.json). No remote deployment, commit or push is authorized.

User-facing project: `~/projects/external/configurator-demo`
Tool/backend project root: `/workspace`

## Required launch conditions

Start a **fresh Hermes session** in this project with:

- model: `gpt-6-astra`;
- billing provider: `openai-codex`;
- project mounted at `/workspace`;
- private Hermes session persistence enabled.

In Hermes Desktop, choose `gpt-6-astra` in the model picker **before** creating the chat, then press **Ctrl+N**. The picker is sticky, so the new chat should open on Astra. Selecting Astra inside an existing Sol conversation is a mid-session model switch and does not satisfy this requirement, even when the terminal is correctly mounted at `/workspace`.

In the interactive CLI, **Ctrl+N is not the new-session command**. Exit the existing conversation with `/quit`, then launch a new process from the host shell with the model/provider fixed at creation:

`hermes --cli --in /home/jay/projects/external/configurator-demo --provider openai-codex --model gpt-6-astra --pass-session-id`

Run `/status` before the first work message and verify the new session reports `gpt-6-astra` and `openai-codex`. The agent's Docker terminal tools should then report `/workspace`; that is the expected mount of the host project.

Do not run this prompt with Sol or another model and relabel the output as Astra-authored. Astra attribution is accepted only after a private persisted JSONL export verifies the exact model, provider, billing provider, and session identity.

## Frozen prompt to give Astra

> Execute the Safe WebGL geometry-optimization work package in `/workspace`. This is a scored experiment, not a request to modify the public app.
>
> Read these files completely before changing anything:
>
> - `research/protocols/geometry-optimization-v1.md`
> - `research/runs/2026-10-21-sol-geometry-toolchain-preflight/{prompt.md,notes.md,environment.json,verification.json,run.json}`
> - `research/runs/2026-10-21-sol-geometry-baseline/{prompt.md,notes.md,run.json}`
> - `research/runs/2026-10-21-sol-geometry-baseline/reports/integrated/geometry-report.json`
> - `research/asset-manifest.json`
> - `research/schemas/geometry-report.schema.json`
> - `scripts/report-geometry.mjs`
>
> Treat this exact asset as immutable input:
>
> - asset ID: `web-product-estuary`
> - path: `public/assets/models/product-estuary.glb`
> - bytes: `10191496`
> - SHA-256: `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`
>
> Create one uniquely named run directory under `research/runs/` using the form `2026-10-21-astra-geometry-safe-<session-suffix>/`. Write all new work there. Do not overwrite or modify upstream, sanitized, Estuary, public, protocol, schema, application, or completed-run files. Do not commit or push.
>
> Before transforming the model, inspect it and rank the plausible browser bottlenecks: geometry, primitive submissions, textures, material/shader complexity, shader compilation, and continuous rendering. State which metric the candidate is intended to improve. Polygon reduction is a hypothesis, not automatic success.
>
> Produce a deterministic **Safe WebGL** candidate from the immutable Estuary control using only the accepted pinned glTF Transform 4.5.1 / meshoptimizer 1.2.0 path. Blender and `gltfpack` are unavailable: do not claim Blender/DCC authoring, retopology, or `gltfpack` work. Use repository-controlled paths and arguments only. Maximum three correction rounds.
>
> Prioritize visual and semantic parity. Explain every transformation and parameter. Preserve:
>
> - absence of `License Plate` and `InteriorSteeringEmblem`;
> - all four variant names and exactly 25 mapped primitives per variant;
> - history-independent variant behavior;
> - required hierarchy/names used by configuration and inspection;
> - world orientation, origin, scale, and dimensions;
> - materials, KTX2 textures, UVs, normals, tangents, and assignments required for accepted rendering;
> - silhouette, wheel circularity/placement, lamps, mirrors, panel boundaries, wipers, glass, and primary interior forms.
>
> Required run artifacts include:
>
> - exact `prompt.md` containing this prompt;
> - `notes.md` with diagnosis, transformations, failures, limitations, and measured result;
> - `environment.json` with exact session/tool/source identity;
> - deterministic transformation script or complete editable recipe;
> - `candidate.glb` and a second independently generated repeat output or exact byte-comparison evidence;
> - a candidate geometry report generated with `scripts/report-geometry.mjs` (use a pending filename if strict repository validation cannot accept the unregistered candidate yet);
> - official validator output with its known KTX2-support limitation disclosed;
> - independent protected-semantics comparison against the immutable control;
> - exact timestamped command log with argv, cwd, exit status, stdout, and stderr;
> - source and candidate SHA-256/byte counts;
> - current Hermes session ID and an explicit request/path for the private `session.jsonl` export;
> - `run.json` conforming to the run schema, honestly marked partial or blocked until authentic session evidence and Sol review are integrated.
>
> Run deterministic authoring twice from the immutable control and compare exact bytes. Parse both source and candidate independently. Preserve rejected attempts. Do not use runtime hiding to mask broken content. Do not promote the candidate, modify `research/asset-manifest.json`, update generated study data, or run public integration.
>
> The official npm validator's zero-error result is not full current-Khronos certification because it does not fully support `KHR_texture_basisu`/KTX2. Preserve and explain its warning codes.
>
> Finish by stating the exact run-directory path, candidate bytes/hash, metric deltas, whether deterministic reproduction passed, remaining visual/browser gates, and the exact private session evidence needed. Then stop for Sol review. Do not begin Mobile LOD.

## Return to Sol

After the Astra session stops, return to this Sol session with the new run-directory path. Sol must then:

1. copy the authentic private Hermes session JSONL into the declared ignored path;
2. verify session metadata before any Astra attribution;
3. register the research candidate without promoting it publicly;
4. rename/finalize the geometry report if it was left pending;
5. run independent semantic, visual, browser, provenance, and reproducibility review;
6. accept, reject, or request at most the remaining correction rounds;
7. launch Mobile LOD only in a second fresh Astra session starting again from `web-product-estuary`.

Do not publish private session JSONL or require it in the clean Vercel build.
