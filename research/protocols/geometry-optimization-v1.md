# Geometry Optimization Protocol v1

## Purpose

Measure whether a model-assisted optimization pass improves the selected Estuary CarConcept asset for WebGL delivery without obscuring visual regressions, semantic breakage, or the actual source of any performance change.

This protocol is frozen before any scored Astra geometry run. Changes after the first candidate begins require a new protocol version and must not be applied retroactively.

## Immutable control

- Asset ID: `web-product-estuary`
- Public path: `public/assets/models/product-estuary.glb`
- Expected bytes: `10191496`
- Expected SHA-256: `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`
- The original upstream asset, sanitized three-variant baseline, Estuary evidence candidate, and public Estuary integration remain immutable.
- Every candidate starts from the pinned Estuary control. A candidate must not use another candidate as its source.

## Research questions

1. Which geometry, material, texture, shader, and render-loop costs are plausible browser bottlenecks?
2. Can Astra create a reproducible safe-WebGL candidate with measurable delivery or runtime improvement and no accepted fixed-view visual regression?
3. Can Astra create a separate mobile LOD with a larger resource reduction while retaining the intended silhouette and primary product details at the mobile target?
4. Are the benefits large enough to justify additional asset and runtime complexity?

## Candidate roles

### Safe WebGL

Prioritize visual and semantic parity. The initial hypothesis is a 20–35% reduction in geometry or an equivalent measurable load/compile improvement, but no reduction is required if profiling shows geometry is not the limiting factor.

### Mobile LOD

Prioritize constrained-device delivery. The initial hypothesis is a 45–65% geometry reduction. Visible differences are allowed only when documented and accepted at the fixed mobile viewport and camera distances.

The role names are targets, not quality verdicts. A smaller candidate is not automatically better.

## Required geometry report

Every control or candidate used in comparison must have a `geometry-report.json` conforming to `research/schemas/geometry-report.schema.json`. The report identifies a manifest asset and records:

- bytes and SHA-256;
- scenes, nodes, reachable nodes, meshes, primitives, and materials;
- textures and embedded images;
- cameras, animations, and skins;
- submitted triangle indices, distinct POSITION accessor entries, and triangles;
- world-transformed axis-aligned bounds and dimensions in metres;
- material variants and mapped-primitive coverage;
- used and required glTF extensions;
- forbidden-node findings and independent parser status;
- the measurement method and producing script.

`submittedTriangleIndices` is the static number of indices consumed by one complete triangle pass, including repeated references. `positionAccessorEntries` is the sum of distinct POSITION accessor element counts. These are file-structure counts, not measurements of GPU uploads, unique transformed vertices, vertex-shader invocations, or draw calls. Primitive count is reported only as a defensible draw-submission proxy unless the live renderer is measured directly.

## Protected semantics

Unless a candidate explicitly declares and justifies a deviation, it must preserve:

- the sanitized trademark state, including absence of `License Plate` and `InteriorSteeringEmblem` nodes;
- all four material variants and their names;
- exactly one deterministic mapping for every previously mapped primitive in every variant;
- history-independent variant switching;
- visible hierarchy names required for configuration, inspection, and detail targeting;
- world orientation, origin, scale, and dimensions within the declared tolerance;
- UVs, normals, tangents, and material assignments needed for accepted rendering;
- wheel circularity and placement;
- silhouette, windows, lamps, mirrors, panel boundaries, and primary interior forms;
- embedded texture ownership and licensing lineage.

A candidate may merge primitives, change hierarchy, or change texture payloads only when the transformation is declared, the viewer no longer depends on the changed identity, and the comparison isolates the effect.

## Tooling preflight

Before a scored run begins, record exact availability and versions for:

- Blender CLI and `bpy`;
- glTF Transform CLI and libraries;
- `gltfpack` or another meshoptimizer frontend;
- Khronos glTF Validator;
- Node.js and browser versions;
- the agent-visible project root and source file hash.

If Blender is unavailable, the work package may test deterministic glTF/WebGL optimization, but it must not claim a full DCC geometry-authoring pass. Infrastructure failures discovered before the measured prompt are setup failures, not model-capability results.

## Reproducibility

- Store the exact prompt, environment record, command log, transformation script or editable recipe, candidate, inspection, and report in one isolated run directory.
- Run deterministic transformations twice from the pinned control and compare exact bytes or SHA-256.
- Use an independent inspector that does not import or execute the authoring script.
- Do not overwrite source, sanitized baseline, accepted material candidates, or public assets.
- Maximum three correction rounds per candidate.
- Preserve failures and rejected candidates.

## Fixed visual matrix

Use identical model transform, material variant, camera, light rig, tone mapping, exposure, viewport, DPR, warm-up, and background for all candidates.

Required exterior views:

- front three-quarter;
- side profile;
- rear three-quarter.

Required detail views:

- front wheel and brake;
- mirror and adjacent window frame;
- windscreen wipers;
- representative panel seams;
- primary interior forms;
- glass edge/refraction area.

For each target, capture:

- shaded Estuary view;
- at least one supplied finish where material behavior can expose damage;
- wireframe view;
- silhouette or image-difference diagnostic when useful.

The accepted controlled browser resolution is 600×400 for reproducible software-rendered comparison. Higher-resolution promotional derivatives may be produced separately and must not silently replace the scored matrix.

## Browser performance measurements

Separate these measurements:

1. transfer bytes and HTTP content encoding;
2. fetch/decode/parse time;
3. load-to-first-correct-frame;
4. cold synchronous shader compilation before first render;
5. renderer program, geometry, texture, and primitive/draw-call counts;
6. warmed steady frame time.

Record browser, renderer/GPU identity, machine, viewport, DPR, sample count, execution order, and p50/p95. Counterbalance candidate order across fresh contexts where feasible. Software-renderer timing is reproducibility and regression evidence only; it must not be presented as production-GPU performance.

The runtime loop must be characterized separately. A model optimization cannot receive credit for gains caused by changing continuous rendering, camera behavior, or unrelated application code unless that intervention is isolated and labeled.

## Stop conditions

Stop and mark the candidate failed or blocked when any of these occurs:

- invalid GLB or independent parser failure;
- missing textures or broken material variants;
- variant assignment depends on the previously selected finish;
- forbidden mark-bearing nodes or resources reappear;
- dimensions or transforms change beyond the declared tolerance without approval;
- silhouette, wheel circularity, lamps, mirrors, panel gaps, wipers, glass, or primary interior forms visibly fail;
- the candidate regresses the named deployment metric without a documented compensating benefit;
- the transformation cannot be reproduced from the pinned control;
- the toolchain cannot perform the requested class of geometry work.

## Promotion rule

Promote the Safe WebGL candidate only when it improves at least one named delivery or runtime metric, passes semantic and visual gates, and receives independent fail-closed review.

Add the Mobile LOD to the application only when a tested selection policy and real-device result justify the extra asset and runtime complexity. Until then it remains a comparison artifact.

It is a valid result to retain the current Estuary control when optimization benefits are negligible, visually costly, or dominated by shaders, textures, draw submissions, or render-loop behavior.

## Attribution

Astra attribution requires private persisted Hermes session evidence matching the exact session ID, model, billing provider, and available route metadata. Sol-authored protocol, harness, integration, measurement, and review work remains non-Astra-authored. External geometry or image generators use a separate lane and may not be described as directly authored by Astra.
