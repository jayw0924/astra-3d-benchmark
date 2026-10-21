# Estuary Enamel public integration

## Decision

Jay recorded a slight blind preference for Candidate A before reveal. The reveal identified Candidate A as Estuary Enamel. This package integrates that selected candidate; Fjord remains a documented alternative and is not served by the configurator.

## Scope and provenance

- `public/assets/models/product.glb` remains the preserved sanitized three-variant baseline.
- `public/assets/models/product-estuary.glb` is an exact byte copy of the evidence-verified Estuary candidate, SHA-256 `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`.
- The Estuary material and mappings remain Astra-authored mixed with sourced model content. The public copy, application integration, tests, provenance update, and this package are Sol-authored; they are not attributed to Astra.
- The configurator loads the selected four-variant model and exposes Estuary Enamel while retaining the three supplied finishes and all existing controls.
- No production-GPU performance advantage is claimed.

## Acceptance

All required checks passed:

- 15 Vitest unit tests, 15 script tests, and 5 render-plan tests passed.
- ESLint passed.
- Research validation passed with 5 assets and 6 runs; the deterministic public study build regenerated from all 6 runs.
- TypeScript and the Vite production build passed.
- The integrated GLB is byte-identical to the evidence-verified candidate and `gltf-transform inspect` confirms both Estuary materials and required glTF extensions.
- Real Chromium acceptance passed on desktop and Pixel 7 emulation. Both loaded the exact 10,191,496-byte served model with SHA-256 `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`, reached `3D model ready`, selected Estuary Enamel, and reported no page errors or failed requests. The mobile viewport check also passed.
- An independent fail-closed review found one stale package-description blocker. The description was corrected from a pending scaffold to an evidence-backed completed study, after which the scoped checks were rerun.
- A follow-up review found the same stale pending language in the README. The README now distinguishes completed inspection, materials, render comparison, and integration work from the unperformed Blender geometry package and deferred streaming track.
- A broader final review then found equivalent placeholders in the public application and an obsolete active-looking Astra restart handoff. The application now reports the completed first phase, 30-render comparison, four finishes, and actual limitations; the handoff is explicitly superseded and points to the canonical completed records.
