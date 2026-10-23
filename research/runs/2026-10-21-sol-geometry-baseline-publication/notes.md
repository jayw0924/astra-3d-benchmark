# Geometry baseline publication notes

## Result

Passed. The public case study now explains the asset selection, shows the source-to-control lineage, and publishes exact geometry-quality metrics before any optimization claim.

## Public content

The new Geometry baseline section contains four exact evidence copies:

1. raw licensed upstream source in Carmine Candy;
2. sanitized three-variant web baseline;
3. integrated Estuary optimization control;
4. isolated front-wheel topology detail.

The selection rationale identifies named/separable parts, supplied variants, KTX2 textures, practical complexity, the CC BY 4.0 license, and the separate marks notice. Public copy distinguishes 213,195 triangles, 162,646 distinct POSITION accessor entries, 639,585 submitted triangle indices per complete pass, and 107 primitives. It explicitly states that the accessor and index values are static file-structure counts—not GPU upload or shader-work measurements—and that primitive count is only a static draw-submission proxy.

## Asset integrity

All four public files are byte-identical copies of the accepted baseline evidence images. Manifest records pin exact byte counts and SHA-256 values and retain inherited licensing and mixed source/capture provenance.

## Tests

- Unit coverage requires the geometry heading, exact metric language, selection rationale, image alt text, and stable public URLs.
- Browser coverage checks all four decoded images at 600×400 on desktop and Pixel 7 profiles.
- Browser coverage independently fetches every public PNG and verifies exact response bytes and SHA-256.
- The original configurator acceptance test remains isolated from the geometry checks because loading the 10.19 MB model and SwiftShader plus scrolling/hash requests exceeded its 180-second test budget. The first combined run timed out after reaching the end of its assertions. Splitting image acceptance into a lightweight test restored the original desktop configurator test to 1.9 minutes; the geometry desktop/mobile pair passed in 9.6 seconds.
- ESLint, research validation, and the focused unit suite passed before final aggregate verification.

## Authorship

Application copy, layout, copying, tests, manifest changes, and publication evidence were authored by Sol. The Estuary material visible in two images remains Astra-authored mixed content; the public integration work is not attributed to Astra.
