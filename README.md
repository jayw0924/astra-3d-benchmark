# AI-assisted 3D benchmark

This repository contains a reproducible, evidence-backed case study of Astra assisting a realistic 3D content workflow. It includes a controlled baseline, evidence-verified Astra runs, a blind material comparison, and the selected Estuary Enamel integration.

## Current scope

- licensed source-asset selection, deterministic sanitization, and provenance;
- completed Astra-assisted asset inspection and two isolated material candidates;
- a completed 30-image blind browser-render comparison with a recorded pre-reveal decision;
- a Three.js/WebGL2 configurator serving Estuary Enamel as the selected fourth finish;
- FINAL Safe geometry optimization accepted under fixed-view research gates and integrated locally;
- initial geometry authoring was unavailable in Phase 1; later optimization used a pinned non-Blender toolchain;
- methods, failures, interventions, findings, and credits;
- a deferred—not simulated—Unity/Unreal streaming track.

## Accepted Safe result (local integration)

The configurator now loads `/assets/models/product-estuary-safe.glb`, an exact copy of
`research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/candidate.glb`:
9,239,404 bytes, SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`.
This saves 952,092 bytes (9.34%) versus the preserved Estuary control. Static counts:
183,117 triangles, 144,888 distinct POSITION accessor entries, 549,351 submitted
triangle indices, 107 primitives. These are not GPU work or measured draw-call counts.

Acceptance: 108 fixed-view cases and 64 ordered variant transitions passed; see
`research/runs/2026-10-22-sol-safe-final-comparison/decision.json`. This is fixed-view
acceptance only, not arbitrary-view or real-device quality certification. No runtime
speedup is established; first-correct-frame timing is unavailable. Local integration
is separately authorized; nothing here authorizes a remote deployment.

The public before/first-attempt/final PNGs are exact, inventory-hash-verified research
copies (600×400 Estuary front-three-quarter shaded views), not fresh runtime captures:
`before.png` and `final.png` from `2026-10-22-sol-safe-final-comparison/rendered/`,
`first-attempt.png` from `2026-10-21-sol-safe-webgl-comparison/rendered/`.
The source filenames are respectively `control--front-three-quarter--estuary--shaded.png`,
`safe--front-three-quarter--estuary--shaded.png`, and
`safe--front-three-quarter--estuary--shaded.png`. The first attempt was rejected; this
single preview does not expose every defect. Optimization is evidence-verified
Astra-directed work; Sol authored the comparison captures, review, and integration.
CarConcept source/derivative credits remain visible on the page (CC BY 4.0, marks excluded).

### Rollback

One-line URL revert procedure: in `src/lib/threeViewer.ts`, replace
`/assets/models/product-estuary-safe.glb` with `/assets/models/product-estuary.glb`,
then rebuild with `npm run build:app`. Update the public current-runtime summary and
served-model E2E expectation if rolling back. Do not overwrite either binary.
The exact preserved rollback asset is `public/assets/models/product-estuary.glb`:
10,191,496 bytes, SHA-256 `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`.
The Geometry baseline section is historical, not the current runtime.

### Browser verification

E2E checks intercept the model response and hash the bytes actually served. They
exercise all four finishes, both wheel finishes, camera buttons, URL reload/reset,
page/request errors, decoded hash-pinned evidence, and mobile overflow. Run
`npm run test:e2e -- --workers=1`; on memory-constrained SwiftShader hosts, run each
project/test separately with `--project=chromium` or `--project=mobile-chromium`
and `--grep` (`loads the real`, `publishes decoded`, `keeps the mobile`).
Tests explicitly use SwiftShader at DPR 1, including the mobile layout emulation;
they do not certify physical-device image quality. CPU material compilation can
be slow, so the full interaction test allows ten minutes. Failed high-DPR mobile
runs and whole-suite resource termination are not evidence of runtime speedup.

## Commands

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

`npm run build` is the strict local research build and requires the private,
gitignored Astra session exports. Vercel uses `npm run build:app` to compile the
already validated public application from tracked files without weakening the
local attribution gate.

Research records are validated with:

```bash
npm run research:validate
```

See `research/protocol.md` and `.hermes/plans/2026-10-20_202749-astra-3d-benchmark-showcase.md`.
