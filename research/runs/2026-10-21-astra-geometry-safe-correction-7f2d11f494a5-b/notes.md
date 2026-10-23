# Single correction handoff — PARTIAL, STOP FOR SOL

One geometry correction recipe, reconstructed twice independently from immutable web-product-estuary. No further correction or optimization search performed. This consumes the next authorized round: two rounds consumed overall including the earlier verifier-default correction; at most one remains. No promotion, Mobile LOD, public integration, commits, pushes or GUI applications.

## Artifact and measured result

candidate.glb and repeat.glb: 9,198,676 bytes, SHA-256 a30deb208c7c1c4b23859edbb57d2c9d1cb1ad828e00c9431d4ebc29a47d9bce. Exact byte reproduction passes.
Control: 10,191,496 bytes, SHA-256 bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f.
Saved 992,820 bytes (9.741651274749065%). Triangles 213,195 → 181,967, reduction 31,228 (14.64762306808321%). POSITION accessor entries 162,646 → 144,284. These are structural counts, not GPU upload/vertex invocation measurements. No runtime improvement claimed.

## Correction and protection

See diagnosis.md and fresh source-pixel-probe.json. Ray intersections localize the hood insert to mesh 43/0, exposed under-edge to 42/0, adjacent hood to 40/0; roof-adjacent image region intersects windshield 1/0, with gasket 2/0 behind. Base 4/0 appears in lower-right pixels. Also exclude neighboring roof 30/0 and hood interior 41/0 conservatively. Semantic names alone were not used as causality proof.

transform.mjs uses pinned glTF Transform 4.5.1 and meshoptimizer 1.2.0. Only eligible primitives enter compactPrimitive/simplifyPrimitive (.80/.0001/lockBorder). Global weld and simplify are not invoked. Compaction detaches eligible accessors first; live assertions prove they do not reference protected accessors. Both in-memory snapshots and an independent raw serialized-accessor byte check prove all eight excluded primitives' indices and attributes remain exact. No regenerated normals or changed material, texture, lighting, exposure, camera, application or runtime code.

18 static checks pass. Raw parsing plus the existing independent NodeIO reporter validate hierarchy, transforms, world bounds within 1e-6 m, primitive identities, source vertex tuples, four 25-primitive variants with history-independent static mappings, materials with documented OPAQUE default normalization, exact KTX2 payloads and forbidden-node absence. Both geometry schemas pass; candidate-geometry-report.pending.json deliberately remains unregistered.

Official gltf-validator 2.0.0-dev.3.10: both control and correction have zero errors, 28 warnings and 15 infos. Full outputs retained. Unsupported KHR_texture_basisu/image/ktx2 behavior means zero errors is not full current Khronos certification.

## Affected-view browser evidence, NOT acceptance

16 native 600×400 captures: control/correction × wipers/glass-edge × Estuary/Carmine × shaded/wireframe. Same frozen camera file, lighting, exposure, transform and inherited capture render sequence. All eight freshly rendered control PNGs are byte-identical to the corresponding accepted comparison controls. All 16 frames pass nonblank pixel and draw-call checks; no recorded page/network errors; all rendered variant assignment checks pass.

Image-verification.json measures lower whole-frame mean absolute RGB differences for all four shaded comparisons than the rejected candidate. Estuary wipers: 0.553929 → 0.188689; Estuary glass-edge: 0.434211 → 0.136090 (0–255 channel units). Both glass-edge wireframes are pixel-identical to control. These objective diagnostics support review but cannot prove the scalloped-highlight defect is perceptually repaired.

Native subjective image inspection remains UNVERIFIED. The browser display tool rejected loopback access and then timed out starting its own local-file browser. Terminal-driven pinned Playwright succeeded for probes/captures. No GUI workaround was used. Sol must inspect original native pairs and these new native images, including the hood-insert boundary and glazing/roof highlights. Wipers wireframes inherit the original isolated-wiper selection; they do not isolate the hood insert. Complete fixed visual matrix, actual all-variant transition checks for this new candidate, and browser/performance acceptance remain pending. No production-GPU ranking.

## Provenance and licensing

Runtime identity is provisional: gpt-6-astra / openai-codex, session local-7f2d11f494a583302db2e53b0f9e4a2005993658d95139d2820942312e2131c4. Private persistence UNVERIFIED. Request authentic export to this run's ignored session.jsonl; Sol must verify exact identity, billing/provider and route metadata before attribution/acceptance. Do not synthesize the transcript.

Source model contributors retained: original public-domain model by Unity Fan; DGG credited upstream; glTF conversion/optimization by Eric Chadwick. CC-BY-4.0 inherited; trademark-bearing nodes remain removed. License URL: https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept/LICENSE.md . Estuary material provenance retained separately from this provisional correction. Prior candidate 0c57718add772f1265f8cbb3d9f165bc3b06c73629b50f5297f31f844d32c810 is preserved, not reused as input. Sol's camera/render harness remains Sol-authored; copied locally with only model/subset/output protection and non-rendering ray-probe additions. No Blender/bpy/gltfpack or external-generator authorship claimed.

The pre-existing same-session diagnostic directory was preserved as found and not treated as authenticated persistence. This unique -b run is the sole write scope. workspace-before.json and scope-verification.json cover tracked and nonignored untracked existing files outside this run, not ignored caches or transcripts. commands.jsonl records real argv/cwd/timestamps/stdout/stderr/exit status, including nested reporting. Preliminary file reads/edits and browser-tool failures belong to the authentic session transcript; they are not reconstructed as timestamped commands. Browser tool failure details are summarized in browser-tool-limitations.json.

## Reproduction and review

From project root, in a clean copy with no run outputs, invoke:
python research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b/command.py node research/runs/2026-10-21-astra-geometry-safe-correction-7f2d11f494a5-b/transform.mjs

The author refuses existing candidate/repeat outputs. Do not rerun over evidence. verify.mjs is independent of the author and checks both outputs. PLAYWRIGHT_BROWSERS_PATH must point to the pinned .cache/ms-playwright for capture.mjs. No full app build was run: it would regenerate protected study data. This package is partial pending authentic export, native visual review, registration if approved, complete acceptance gates and independent Sol decision. STOP here.


## Current gates — Sol ledger finalization 2026-10-22T19:23:51.374445+00:00

Authentic private attribution, static/reproduction and targeted repair pass; full matrix exposes residual rectangular seam deviation. Not promoted; superseded by FINAL. No runtime speedup established.
Authentic final private export verified locally; earlier pending-persistence statements above are historical and superseded. The private export remains ignored and mode 0600; session-evidence.sha256 publishes its digest only. No fourth correction is authorized. Canonical evaluator reports are separate, not overwritten author reports.
