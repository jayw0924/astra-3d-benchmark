# Geometry baseline notes

## Result

Passed. The upstream source, sanitized baseline, and integrated Estuary control were independently inspected, hash-pinned, rendered in a real browser, and visually reviewed before any optimization work.

## Current integrated model

The selected public Estuary asset contains:

- 10,191,496 bytes;
- 99 nodes, all reachable from the default scene;
- 95 meshes and 107 primitives;
- 30 materials, 14 textures, and 14 embedded images;
- 213,195 triangles;
- 639,585 submitted triangle indices per complete triangle pass;
- 162,646 distinct POSITION accessor entries;
- no cameras, animations, or skins;
- four material variants, each mapped to 25 primitives;
- dimensions 2.5423209977504473 × 1.1488961344483861 × 4.357385993003845 metres.

`submittedTriangleIndices` and `positionAccessorEntries` are static file-structure counts, not GPU-upload, vertex-shader-work, or draw-call measurements. Primitive count is only a static draw-submission proxy. The capture harness observed 107 model primitives in the file and 214 render calls after two explicit renders; that cumulative renderer counter is not a per-frame draw-call measurement.

## Asset lineage findings

Sanitization removed the two prohibited nodes and their unreferenced resources:

- 77,848 bytes (0.7582% of the upstream file);
- 2 nodes, 2 meshes, 2 primitives, 1 material, and 1 texture;
- 152 triangles, 456 submitted triangle indices, and 120 distinct POSITION accessor entries.

The Estuary material integration then added 1,348 bytes and 2 material records without changing nodes, meshes, primitives, textures, images, triangles, submitted triangle indices, POSITION accessor entries, or dimensions.

## Visual review

- `source-overview.png`: valid and well framed. The raw upstream source uses Carmine Candy. Neither the plate nor steering emblem is legible in this exterior frame; the source still retains those nodes and remains explicitly licensed/marked as upstream evidence.
- `sanitized-overview.png`: valid and well framed. It remains visually complete at this camera after physical removal of the two mark-bearing nodes.
- `estuary-overview.png`: valid and well framed. The seafoam/teal Estuary finish, dark roof, glazing, wheels, and brakes are visible.
- `wireframe-wheel-detail.png`: valid isolated front-wheel topology view. It exposes the dense tire, rim, spoke, brake-disc, and hub triangulation more clearly than the rejected whole-car wireframe.

The rejected whole-car wireframe was nearly solid because 213,195 triangles rasterized as one-pixel lines at 600×400. The first isolated-wheel attempt was blank because hiding the root `BodyUnderside` mesh also hid its wheel descendants. A capture assertion reproduced the zero-call failure. The corrected harness keeps ancestor transforms active with a color/depth-disabled material and renders only the target subtree with a double-sided wireframe material.

The source and sanitized PNGs differ in only 24 RGB pixels (maximum channel delta 43) within a small region, consistent with the removed geometry being visually negligible at this camera. This pixel comparison is diagnostic evidence, not a claim that the GLBs are semantically identical.

## Reproducibility and scope

All captures use the same front-three-quarter camera, neutral room environment, ACES filmic tone mapping, 1.05 exposure, 600×400 resolution, DPR 1, headless Chromium, and SwiftShader. Repeated readback bytes matched for every accepted image.

SwiftShader results establish deterministic browser compatibility only. They do not establish production-GPU performance. No geometry was changed in this package.

## Authorship and timing

The reporter, browser harness, captures, metrics, debugging, visual review, and notes were authored by Sol. No output in this package is Astra-authored. The measured interval begins with the reporter implementation after the resumed execution and ends at the accepted render manifest; later provenance packaging is excluded.
