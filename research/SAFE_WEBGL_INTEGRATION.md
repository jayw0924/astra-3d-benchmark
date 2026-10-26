# Historical Safe WebGL local integration checkpoint

This document preserves the geometry integration checkpoint and its then-current counts, not the latest lighting/test/repository state. Current refined lighting and Jay's subjective checkpoint approval: [lighting integration run](runs/2026-10-26-sol-lighting-integration/run.json), [current acceptance](runs/2026-10-26-sol-lighting-integration/finalization-2026-10-26/current-acceptance.json). Historical fixed-view Safe PNGs remain unchanged, not current-lighting captures. The existing Mobile low-benefit experiment is stopped; no rerun is authorized.

## Result

Local application integration is verified and independently accepted. The loader uses `/assets/models/product-estuary-safe.glb`, an exact copy of the accepted FINAL research candidate: 9,239,404 bytes, SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`.

The original public GLBs remain byte-identical to Git HEAD. Rollback uses `/assets/models/product-estuary.glb`, 10,191,496 bytes, SHA-256 `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`; README documents the loader URL reversal and corresponding test updates.

## Verified evidence

- Independent integration reviewer fetched the production-build HTTP model response and verified exact bytes/hash against the accepted candidate.
- Public before/rejected/final evidence copies match their research sources; source licensing, marks caveat and mixed authorship remain disclosed.
- Current checks passed: 19 unit tests, 25 script tests, six render-plan tests, ESLint, strict research validation (19 assets / 22 runs), strict production build and public-only build.
- The integration worker ran separate bounded desktop/mobile-layout interaction tests: five passed and one intentional desktop skip. Tests verify served binary identity, UI/URL choices, ready state, reload/reset and recorded error channels. They do NOT independently prove every material assignment or camera motion rendered correctly. Actual all-pairs material assignments were verified in the separate final research harness, not inferred from checked radio buttons.
- CPU-only smoke coverage uses DPR 1 with Chromium/SwiftShader. Whole-suite/high-DPR resource terminations were encountered before the successful bounded runs. These tests are not physical-device certification or speed measurements.
- The independent reviewer additionally reran a focused Chromium evidence-image decoding/hash test, unit tests, lint and public-only build; it did not rerun the heavy interaction suite.

## Scope and current-state interpretation

Payload reduction is 952,092 bytes (9.34%). Frozen fixed-view research acceptance passed; arbitrary-view/real-device quality is not certified. Runtime speedup is not established and first-correct-frame latency is unavailable.

Earlier research records that reserve application acceptance to the parent describe the historical research boundary. This note records its subsequent local completion without changing those frozen decisions.

At this checkpoint no commit, push, remote deployment, or Mobile LOD work was performed. This is not a claim about the current Git state; inspect it before any later authorized delivery. Public application integration and the documentation here are Sol-authored work, not Astra-authored geometry optimization.
