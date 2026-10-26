# Viewer lighting experiment v1

## Question and authorship

Can a viewer-only studio lighting and grounding change improve shape readability and product presentation without modifying the accepted geometry/material asset? This is Sol-authored presentation work, not an Astra optimization result. This protocol is established before candidate captures. Subjective preference is not an objective realism score or evidence of Blender superiority/inferiority.

## Fixed input and control

- Accepted GLB: public/assets/models/product-estuary-safe.glb
- Bytes: 9239404
- SHA-256: 01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4
- Preserve original viewer rig: hemisphere 2.5; white directional 5.5 at [4,8,5]; blue rim 3.5 at [-5,3,-4]; grid; ACESFilmic exposure1.05; sRGB.
- Geometry, textures, material PBR parameters, rim treatment, model transform and selected camera must be identical across paired captures. Do not fix presentation by silently modifying GLB/materials, normals, or roughness.

## Stages and attribution of effect

1. Baseline: original live viewer rig.
2. Environment-only: procedural PMREM studio environment and rebalanced direct lights, same floor/grid/background. This tests broad reflection/illumination treatment.
3. Grounded studio: same environment/light treatment as stage2 plus neutral shadow-receiving floor and restrained soft shadow treatment, grid removed. This isolates grounding/presentation from illumination. If shadows cost too much or render incorrectly, record it and retain environment-only as an option.

Avoid external HDR downloads, new dependencies and postprocessing in this first comparison. Procedural studio maps avoid asset-license/network confounds. Exposure is fixed at1.05 for initial scored captures. Any later exposure change is a separately labelled intervention, never silently substituted.

## Capture and visual review

- Same frozen control-derived cameras, 600x400,DPR1 and browser/renderer for all stages.
- All four finishes, front-three-quarter/side/rear-three-quarter plus paint/glass/wheel detail views.
- Test matrix as data before rendering; paired camera/spec equality and immutable model pins required.
- Record actual render bytes/hash, dimensions, errors, material assignment correctness, browser/GPU identity, settings and capture timestamps.
- Confirm nonblank outputs and inspect every contact-sheet panel plus native details. Watch crushed body panels, blown highlights, distracting windshield reflections, wheel legibility, contact/floating appearance, shadow artifacts and finish differentiation.
- Compare stages by dimension (readability, highlights, grounding), not a fabricated numeric realism score. Present labelled before/after and ask Jay for preference before selecting a new default. Preserve original rig as explicit fallback.

## Engineering gates

Test real variant application and camera controls, dispose procedural environment/PMREM/floor resources correctly (including when swapping rigs), avoid redundant GLB fetches for lighting switches, and preserve URL/config behavior. No perpetual shadow-map updates when lights/scene are static if safely supported. Characterize added resources and compile/render cost separately; software-renderer timing is diagnostics only. Never claim end-user performance from SwiftShader.

## Acceptance and publication

No default switch before controlled evidence and user preference. No commit,push,remote deployment, model replacement, Mobile LOD revival or second-model work. Keep prior geometry acceptance evidence unchanged: lighting changes are not retroactive evidence for geometric parity. Document exact recipe, failures, attribution, settings, tests and restart steps so future models can reuse a measured baseline→lighting→grounding workflow. Record unresolved material issues for a later, separately isolated experiment.
