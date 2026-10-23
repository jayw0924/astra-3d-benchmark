# Final bounded seam correction — PARTIAL; STOP FOR SOL

Run: research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/
Runtime: gpt-6-astra / openai-codex. Session local-d0bf6e206c9298befb665382c599a950d599a720fb7d55c9038e54b7a23938b9. Attribution provisional; private persistence unverified.

## Result

candidate.glb and repeat.glb: 9,239,404 bytes; SHA-256 01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4. Independently rebuilt twice from pinned web-product-estuary (10,191,496 bytes, bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f), with exact byte equality.

952,092 bytes saved (9.342023977637828%). Triangles 213,195 -> 183,117, saving 30,078 (14.108210792936044%). Distinct POSITION accessor entries 162,646 -> 144,888. These are structural metrics, not GPU work or runtime-speed measurements. Only mesh 38 primitive 0 (BodyPillars) was added to the earlier protected set. This final candidate restores 1,150 triangles compared with the previous correction; it does not pursue a new reduction quota.

## Evidence

- diagnosis.md and source-pixel-probe.json: direct source ray localization using accepted camera/transforms; all 102 pixels in the supplied region hit 38/0.
- transform.mjs: prior glTF Transform 4.5.1 / meshoptimizer 1.2.0 recipe with one additional exclusion; no global weld/simplify or regenerated normals. In-memory accessor isolation assertions protect excluded data before any simplification.
- verify.mjs / verification.json: 18 passing independent raw/NodeIO checks, exact serialized indices/attributes for all nine protected primitives (including all eight previous exclusions), world bounds within 1e-6 m, hierarchy/transforms, exact embedded textures, material semantics with only default OPAQUE normalization, extension sets, forbidden-node absence, retained source attribute tuples and all four variants mapping exactly 25 primitives. Static history checks are not browser transition evidence.
- candidate-geometry-report.pending.json: schema-conforming but deliberately unregistered.
- control-validator.json / candidate-validator.json: official gltf-validator 2.0.0-dev.3.10, zero errors, 28 warnings, 15 infos each. Incomplete KHR_texture_basisu / image/ktx2 support prevents claiming full current Khronos certification.
- rendered/ and capture-manifest.json: 16 native 600x400 DPR1 glass-edge/wipers images, control/final × Estuary/Carmine × shaded/wireframe. All eight fresh control PNGs equal accepted controls exactly. No blank frames, page/network errors or rendered assignment failures. Frozen Sol page/render/camera semantics retained byte-for-byte; wrapper only narrows output matrix and refuses PNG overwrite.
- seam-check-prior.json preserves the expected failing localized regression check; seam-check-final.json passes exact equality in both finishes. The failure was not hidden or adjusted away.
- visual-review.md: native visual inspection observes removal of the rectangular seam patch and preservation of the preceding hood-highlight repair. Whole-frame pixel parity is not claimed.

## Scope, provenance and limitations

The sole write scope is this new run. Protected baseline covers tracked and nonignored untracked existing files, including both earlier binaries and old evidence; ignored caches/private transcripts are outside that coverage. Final scope-verification.json records comparison. No app build was run because it regenerates protected study data. No manifest/public/src/protocol/dependency edits, GUI launches, external generation, commits or pushes. No Blender/bpy/gltfpack authoring claimed. Preliminary tool discovery/setup invocation and file edits remain attributable to the authentic transcript; command.py logs actual subsequent argv/cwd/start/end/exit/stdout/stderr including nested reports. No historical command timestamps were reconstructed.

Source contributors: original public-domain model by Unity Fan; DGG credited upstream; glTF conversion/optimization by Eric Chadwick. CC-BY-4.0 inherited, trademark-bearing nodes remain removed. License: https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept/LICENSE.md . Estuary material attribution retained separately. Sol's camera/render harness remains Sol-authored, not newly Astra-authored. The final exclusion decision and local investigation are provisionally Astra work until authentic evidence verification.

## Reproduction and stop

From project root in a clean copy without existing outputs:
python research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/command.py node research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/transform.mjs

Then run verify.mjs via the same command wrapper. For captures set PLAYWRIGHT_BROWSERS_PATH to the existing pinned .cache/ms-playwright and invoke capture.mjs capture control, then capture.mjs capture final. Never rerun authoring/capture over evidence.

Required private authentic export destination: research/runs/2026-10-22-astra-geometry-safe-final-d0bf6e206c92/session.jsonl. It has NOT been manufactured. Sol must verify the exact session ID/model/provider/billing and available route metadata before attribution. Full visual matrix, actual browser all-variant transitions, performance gates and independent acceptance remain pending. Keep run.json partial. Retain deployed control pending Sol's decision.

FINAL third correction round consumed, including initial verifier-default correction. Correction budget exhausted. STOP for Sol review. No fourth correction, promotion or Mobile LOD.


## Current gates — Sol ledger finalization 2026-10-22T19:23:51.374445+00:00

Authentic private attribution, independent static/reproduction and frozen fixed-view research gates pass. FINAL accepted research artifact only; separate application integration acceptance required. Runtime speedup not established; first-correct-frame unavailable. Correction budget exhausted.
Authentic final private export verified locally; earlier pending-persistence statements above are historical and superseded. The private export remains ignored and mode 0600; session-evidence.sha256 publishes its digest only. No fourth correction is authorized. Canonical evaluator reports are separate, not overwritten author reports.
