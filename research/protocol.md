# Astra 3D Benchmark Protocol

## Purpose

Observe a realistic AI-assisted 3D production workflow while balancing output quality, runtime performance, human effort, elapsed time, and cost. Astra is the user-selected subject of this case study; the selection is an experimental premise, not evidence of comparative superiority or a universal model ranking.

## Research questions

1. Can Astra correctly inspect and explain an unfamiliar production-style 3D asset?
2. Can Astra author editable, technically valid material variants from a fixed brief?
3. Can Astra add modest geometry without damaging naming, scale, normals, UVs, or separability?
4. Can Astra produce reproducible studio and lifestyle renders from a fixed shot list?
5. Can Astra optimize and integrate the asset into an accessible, performant browser configurator?

## Fixed inputs

- Primary asset: Khronos CarConcept optimized GLB, pinned in `asset-manifest.json`
- Control asset: Khronos ToyCar, retained as a documented fallback but not yet downloaded
- Target delivery: static website using Three.js and WebGL2
- Viewports: 1440×900 desktop and 390×844 mobile
- Image outputs: 2400×1600 PNG masters plus web derivatives

## Allowed tools

Record every tool Astra can use in each run. A run is invalid if tool access or the active model identifier is unknown. External 3D/image generators are allowed only in a separately labeled `astra_orchestrated_external` provenance lane.

## Provenance lanes

- `sourced_baseline`: licensed geometry or materials used unchanged except for conversion and optimization.
- `non_astra_authored_baseline`: research, code, or content authored by a human or a non-Astra assistant to establish the controlled baseline.
- `astra_authored`: scripts, materials, geometry, lighting, renders, or code authored directly by Astra using local tools.
- `astra_orchestrated_external`: output created by a dedicated external generator that Astra called or directed.
- `mixed`: a result containing more than one lane; every output must identify its own lane and component source assets.

## Intervention levels

- 0: prompt only
- 1: clarification without solution
- 2: explicit diagnosis or requested correction
- 3: human edits the output
- 4: human replaces the approach

## Outcome labels

- `pass`
- `pass_with_intervention`
- `partial`
- `fail`
- `blocked`

## Scoring rubric

Score each category from 0–4 and preserve the supporting evidence:

- requirement completion
- visual fidelity
- technical validity
- editability
- runtime performance
- reproducibility
- provenance completeness
- human effort
- elapsed time
- cost efficiency

## Stopping rules

- Maximum three correction rounds per work package.
- Stop immediately on license uncertainty, destructive overwrite without backup, repeated invalid output, or undisclosed external generation.
- Preserve the last useful output and document the stop reason.
- Do not hand-repair a failed Astra output and then report the repaired result as an unassisted pass.

## Performance reporting

Report model size, load-to-first-frame, median steady-state FPS, renderer, browser, viewport, DPR, and named benchmark machine. Measurements apply only to the recorded machine and browser.

## Evidence standard

Every external asset must have an official source URL, immutable revision or download URL, author, license, retrieval time, byte count, SHA-256, and local path. Every public finding must link to a run ID. Preserve failures and intervention notes alongside successful outputs.
