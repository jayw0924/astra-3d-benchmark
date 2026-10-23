# Pre-transformation diagnosis

Recorded after raw source inspection and before candidate generation. These are ranked hypotheses, not measured browser timings.

1. Material/shader complexity: transmission glass, clearcoat paint, iridescent supplied finishes and emissive extensions can dominate fragment work and extra passes. Thirty material records do not imply thirty live programs. Preserve all of these: changing them would confound a geometry experiment.
2. Continuous rendering: src/lib/threeViewer.ts:166-173 explicitly renders every animation frame, even at rest. This repeats all costs. No loop changes are authorized and none will be credited to the asset.
3. Primitive submissions: 107 static primitives across 95 meshes are a plausible CPU/submission cost. This is not a measured per-frame draw-call count. Preserve hierarchy and primitive identity rather than merge configuration targets.
4. Geometry: 213,195 triangles and 162,646 distinct POSITION accessor entries are meaningful delivery and vertex-work candidates, but not proof of a runtime bottleneck. The wipers alone contain 24,336 triangles; four rim primitives have 10,116 each. Small silhouette-sensitive parts require conservative error rather than a blind polygon quota.
5. Shader compilation: complex materials plausibly hurt cold first-frame behavior, but no cold compile timing has been collected in this run. Geometry simplification should not be credited with compile improvements without measurements.
6. Textures: fourteen embedded KTX2 images are already compressed. Keep exact payloads, texture transforms, samplers and material links. Texture decode/upload may still matter; compressed byte size is not GPU allocation.

Named target metric: standalone GLB delivery bytes, with static triangles and POSITION entries as secondary explanatory metrics. HTTP compression and actual browser speed remain unmeasured.

Initial recipe: pinned glTF Transform simplify, ratio 0.80, error 0.0001, lockBorder true. Ratio targets triangle-index retention in the inspected implementation; it is an upper ambition, not a guaranteed reduction. Error is the library's relative mesh error threshold, not a certified world-space or pixel bound. LockBorder protects open topological boundaries. The library internally welds with overwrite:false, selects existing indexed vertices, compacts all vertex attributes and chooses 16-bit indices when possible. No quantization, texture transcode, material edits, hierarchy merge or runtime hiding. Source attributes are carried through, not regenerated. Visual equivalence of the interpolated surfaces still needs review.

Risk: simplification may alter silhouette, shading, panel details or bounds despite small numeric error. Stop on semantic/bounds/validator failure; preserve all outputs. No public deployment means rollback is simply retaining the immutable control. Independent raw parsing, NodeIO geometry reports, exact image/material/variant comparisons and repeat-byte equality are required before handoff. Declare 1e-6 metres as the world-bounds tolerance. No browser/visual acceptance claim is made without the fixed matrix.
