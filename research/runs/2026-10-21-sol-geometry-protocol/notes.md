# Geometry protocol notes

## Result

Passed. Geometry optimization protocol v1 is frozen before any scored candidate run.

## Decisions

- `public/assets/models/product-estuary.glb` is the immutable optimization control.
- Safe WebGL and Mobile LOD are separate candidates, each rebuilt from the control rather than chained.
- A candidate must improve a named deployment/runtime metric and pass semantic and visual gates; size reduction alone is not success.
- Geometry count is a hypothesis, not a diagnosed bottleneck. Texture decoding, material/shader complexity, primitive submissions, and render-loop behavior remain competing hypotheses.
- Software Chromium timing is regression evidence for the harness only.
- The accepted controlled comparison resolution is 600×400. The earlier 2400×1600 target remains optional for promotional masters rather than a claim about the completed comparison.

## Validation added

`research/schemas/geometry-report.schema.json` requires exact model identity, geometry counts, bounds, variants, extensions, forbidden-node findings, parser status, and measurement method.

`scripts/validate-research.mjs` now recursively discovers `geometry-report.json` files, validates their shape, resolves their `assetId`, and requires path, byte count, and SHA-256 identity with the manifest asset.

Test-first failures were observed for:

1. an incomplete geometry report that the prior validator ignored;
2. a geometry report referencing an unknown asset;
3. a geometry report whose byte identity differed from the manifest asset.

All three passed after the minimal validator implementation. The complete script suite passed with 19 tests, and repository research validation passed with 8 assets and 7 pre-existing runs before this record was added.

## Authorship and timing

This package was authored by Sol, not Astra. The 128-second measured interval is derived from the first and last substantive protocol/validator artifact modification times. Later provenance packaging is excluded and is not represented as model work.
