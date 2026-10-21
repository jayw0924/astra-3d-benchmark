# Controlled blind material A/B rendering

## Status

The render package is complete and technically verified. Jay recorded a slight preference for Candidate A before reveal; Candidate A was Estuary Enamel. A later integration package serves an exact copy of that selected candidate in the public configurator, while Fjord remains the documented alternative.

Two hash-pinned Astra material candidates were rendered under neutral labels A and B. The reviewer handoff is isolated to `blind/`, containing only an identity-free `index.html` and copies of the 30 blind-labeled PNGs. The parent evidence package necessarily contains identity-bearing metrics, provenance, source code, and the explicit `reveal.json`; reviewers must not inspect the parent package before recording their judgment.

## Controlled protocol

Both candidates use:

- the same source geometry, transforms, textures, and browser renderer;
- WebGL2 through headless Chromium with software SwiftShader;
- fixed 600 × 400 resolution and device-pixel ratio 1;
- `SRGBColorSpace`, `ACESFilmicToneMapping`, and exposure 1.05;
- three identical exterior cameras: front three-quarter, side, and rear three-quarter;
- the current configurator lighting (hemisphere, key, rim, and grid) and a neutral procedural `RoomEnvironment` generated through PMREM;
- nine neutral close-ups covering `BodyRoofPanel`, `BodyPanelsColor2`, `BodyHoodTopgrill`, right door/handle/mirror secondary surfaces, and left door/handle/mirror secondary surfaces.

The deterministic blind assignment derives from the candidate hashes and a fixed protocol string. Filenames and gallery labels contain only A or B. Each final PNG is hashed in `render-manifest.json`; a second readback from the unchanged rendered canvas matched exactly. That check proves stable readback, not an independent full rerender.

## Browser transition and measurement evidence

For every candidate/lighting session, the harness switched from each supplied source variant—Carmine Candy, Pearly Swirly, and Torched Graphite—to the candidate variant. Every transition applied exactly 25 mappings. No browser page errors or failed requests were recorded.

All four sessions used identical rendering settings. The geometry-level renderer counts were equal between candidates within each lighting setup. The current-viewer setup reported 216 calls and 426,390 triangles; neutral lighting reported 214 calls and 426,390 triangles. The one-material Fjord and two-material Estuary candidates did not produce a meaningful, controlled performance separation in this sample.

Timing data are diagnostic only. Candidate materials were assigned before the first GPU render and then measured with a synchronous cold `renderer.compile()` call; the four values ranged from 16.3 to 21.2 ms. The 15 post-warmup frame samples per session were collected under containerized software rendering and showed substantial scheduling/cache noise: medians ranged from 16.7 to 92.5 ms and p95 from 74.7 to 102.6 ms. Model-load and first-transition timings also varied materially with execution order. These measurements must not be used to rank production GPU performance.

## Quality control and interventions

- The initial 1200 × 800 attempt exposed an impractical SwiftShader readback bottleneck. The fixed protocol resolution was reduced uniformly to 600 × 400 before the accepted capture.
- `compileAsync()` could remain pending because SwiftShader did not expose `KHR_parallel_shader_compile`; the accepted metric assigns the candidate first and measures synchronous `renderer.compile()` before any render or source-variant transition.
- Initial handle close-ups were nearly black because camera side selection trusted left/right names rather than world-space position. A failing regression test was added, camera placement now uses the actual world-space side with bounded distance, and all 18 close-ups were regenerated.
- Final visual QC confirmed all exterior frames contain a fully visible, unclipped, materially lit vehicle. A nine-row paired contact-sheet review confirmed each repaired close-up meaningfully frames its intended surface.
- All 30 final images are 600 × 400, match their recorded byte counts and SHA-256 hashes, and have no duplicate image hashes.

## Provenance and limitations

The candidate materials and mappings remain attributable to their evidence-verified Astra runs. The rendering harness, camera repair, capture orchestration, quality control, gallery, metrics, and this record are Sol-authored. Final images are therefore `mixed`: Astra-authored candidate material work rendered through Sol-authored evaluation infrastructure over sourced baseline geometry and textures.

The neutral environment is procedural and carries no external HDRI or generator provenance. No external image or 3D generator was used. Blender remained unavailable. The gallery supports comparative judgment under these two browser lighting conditions; it is not measured spectral paint validation, a physical studio render, or proof of performance on production hardware.

Do not open `reveal.json` before recording the blind judgment. After the reviewer selects A, B, tie, or neither, record the decision and rationale before revealing identities.

## Blind decision and reveal

At `2026-10-21T02:17:11+00:00`, Jay recorded a **slight preference for Candidate A** before reveal. No additional rationale was supplied. The immutable decision record is `blind-decision.json`.

After the decision was persisted, `reveal.json` established:

- Candidate A: **Estuary Enamel**
- Candidate B: **Fjord Enamel**

The result is therefore a slight visual preference for Estuary Enamel under this controlled browser comparison. It supports advancing Estuary to the integration-candidate stage; it is not evidence of a large quality difference or a production-GPU performance advantage.
