# Mobile LOD initial candidate — PARTIAL; STOP FOR SOL

Run: research/runs/2026-10-22-astra-geometry-mobile-bd8abb4a578f/
Session: local-bd8abb4a578f6f844c88718fb0c080ca3cd56d1393036b77f6c42bd7e12c85ac
Runtime: gpt-6-astra / openai-codex. Runtime metadata only; private persistence UNVERIFIED. Billing cost unknown. Exact prompt and copied handoff retained. No actual earlier Sol work or runtime-switch notice occurred in this session.

## Result and decision

One research-only candidate, NOT accepted or registered. candidate.glb and repeat.glb independently reconstructed from immutable original public/assets/models/product-estuary.glb; exact byte equality.
Candidate: 9,195,792 bytes; SHA-256 3d652b91d18e13910a03fb595b0ce9386c424ab39eb72187f17a6de7eaeb3c5b.
Original: 10,191,496 bytes; SHA-256 bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f.
Delivery reduction: 995,704 bytes (9.77%). Triangles: 213,195 -> 183,125 (14.10% reduction). Distinct POSITION accessor entries: 162,646 -> 146,067. Submissions remain 107 primitives; this is not an FPS result. The more aggressive local recipe with expanded protection did NOT approach the hypothesized 45–65% geometry reduction. Do not spend the remaining correction budget searching for a quota. Compare the modest incremental delivery improvement versus the already deployed Safe in delivery-summary.json before considering extra asset complexity.

## Authoring and verification

Exact pinned glTF Transform 4.5.1 and meshoptimizer 1.2.0. Blender CLI, bpy and standalone gltfpack re-probed without installing; availability is in environment.json (unavailable here). No DCC retopology claimed. Recipe adapted from disclosed prior Safe code, not a blind/conceptually independent experiment. Independent binary reconstruction uses only original control as geometry input. Per-primitive compaction/isolation, locked-border simplification: eligible general ratio 0.50/error 0.0001, rims ratio 0.65/error 0.00005. Thirty source meshes (34 primitives) preserved exactly, including prior vulnerable surfaces, wipers/glass/mirrors/lamps/tires. Decisions and risks frozen in diagnosis.md before authoring.

Independent raw verifier plus repository NodeIO reporter establishes valid indices, stored attribute-tuple retention, exact protected geometry, serialized accessor isolation, matching hierarchy/transforms, world bounds within 1e-6 metres, preserved material/texture semantics and exact embedded KTX2 payloads. All four named variants still map exactly 25 primitives each; static all-pairs mapping is history independent. No forbidden mark-bearing nodes. verification-final.json supplements rather than overwrites the initially failing verification.json. Exact source geometry does not establish simplified interpolation, arbitrary silhouette or hidden-detail quality.

candidate-geometry-report.pending.json has role mobile-lod and proposed asset ID mobile-lod-bd8abb4a578f; schema validation passes but canonical registration remains pending Sol. Both official pinned validator reports show 0 errors, 28 warnings, 15 infos, retaining unsupported-extension/KTX2 warnings. This is NOT full current conformance certification.

108 native fixed-view images, nine contact sheets, exact replay of all 54 accepted control PNGs, no recorded capture page/network errors, nonblank/draw checks and 25 rendered assignments per frame. See image-verification.json, capture-manifest.json and visual-review.md. Prior seam crops are pixel-identical; real shaded panel/rim/interior differences remain. Direct visual inspection unavailable under the terminal/file-only lane; no aesthetic verdict claimed. Sol must inspect supplied native evidence. Supplemental browser measurement failed with outer exit 137 after control measurement; candidate performance and full browser all-pairs transitions unavailable. No real-device testing or mobile-layout substitution.

## Corrections, boundaries and attribution

Zero geometry corrections; TWO conservatively charged verification-tooling correction rounds (reporter path; multi-primitive protected verifier). Both failures preserved in scripts/reports/commands and failures.md. No third correction. One optional measurement process termination is separately disclosed, not disguised as a successful measurement. Successful command logs have actual argv/cwd/start/end/exit/stdout/stderr. Aborted optional measure lacks a completion log; its outer result is retained in the authentic transcript, not invented here. Discovery and file edits use transcript evidence, not reconstructed command timestamps.

Only this run is writable. scope-verification.json compares all 977 preexisting tracked/nonignored files; secret/transcript names are metadata-only and ignored caches/private evidence are excluded. No app build/test suite that regenerates protected data was run. No public/src/manifest/generated-data/protocol/dependency changes, GUI, external generation, commits, pushes, deployment or automatic LOD selection.

Sol's unchanged page, control-spec and renderer/camera harness remain separately attributed in reuse-provenance.json and run.json. Source contributors retained: Unity Fan original model, DGG upstream credit, Eric Chadwick glTF conversion/optimization; inherited CC-BY-4.0, Estuary materials authored separately, sanitized mark state preserved. License: https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept/LICENSE.md . New agent-authored outputs are provisional pending authentic persistence, even where schema lane uses astra_authored.

## Reproduction and stop

On the same /workspace mount in a separate clean copy without existing attempt outputs: execute transform.mjs through command.py. It independently reads the pinned original twice and refuses to overwrite GLBs. Do not run prepare.py over the evidence; it captures the initial inherited verifier that is intentionally retained. Run corrected verify.mjs (its historical single-primitive check fails), then verify-protection.mjs to obtain the independent complete check; the retained failure is expected and documented. Capture control, check-controls.mjs, then capture mobile with PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright. Check-images.py produces diagnostics/sheets. These commands are preserved exactly in commands.jsonl. Do not rerun over existing evidence.

Required authentic private export destination: this run's session.jsonl. Export the actual session above, keep it private/ignored (mode 0600), and let Sol validate exact session ID/model/provider/billing/available route metadata. No session export was fabricated. Independent Sol visual/semantic/attribution acceptance, any selection-policy testing and real-device justification remain gates. Existing public Safe remains unchanged. STOP; no promotion or further candidate authoring.
