# Corrected Safe WebGL comparison — evidence complete, no final verdict

## Actual completion

- **108/108 matrix PNGs**, 0 remaining: nine frozen targets × two models × two finishes × shaded/wireframe/silhouette. 600×400, DPR1 throughout. `safe` identifiers mean the **corrected** candidate, never the prior rejected version.
- **54 fresh corrected captures** in five small headless-browser batches; **54 unchanged controls reused** only after exact source PNG byte/hash and identical page.js/page.html/control-spec verification. `reuse-verification.json` records every source. No prior candidate capture is relabelled or substituted. Source control evidence has zero active errors.
- **Nine contact sheets**, all 108 panels inspected. Native control/prior-rejected/corrected wipers and glass-edge shaded frames inspected in both finishes (12 native images); labelled three-way comparisons plus two nearest-neighbor seam crops make six supplemental PNGs. The 108 matrix images + 9 sheets + 6 supplements total **123 PNGs**.
- **Four actual ABBA measurement contexts**: control, corrected, corrected, control. Each context has a separate fresh browser process; 30 raw warmed samples after six discarded warmups. **120 samples** and **64 actual transitions** total: all 16 ordered/self pairs of Carmine Candy, Pearly Swirly, Torched Graphite, Estuary Enamel in every context. Every transition checks 25 actual material-object assignments; target signatures remain identical across source histories and contexts.
- Final isolated package tests: **7 passed, 0 failed**. Browser gallery: **108 images decoded**, all 600×400 with alt text, zero page/request/HTTP errors. `verify.py` checks every PNG's decode, hashed evidence, protected files, source pins, supplement provenance and final counts. No production app/research build is claimed or needed; that could write protected generated files.

## Visual finding, not acceptance

The rejected hood-insert scalloping and roof/glazing-adjacent broken highlight are visibly repaired in both finishes. A **minor localized stepped/notched rendered patch remains beside the panel seam below the windshield image-right corner**, especially Carmine. Native glass-edge location approximately x418–423/y323–339. Control has a thin continuous seam; prior and corrected show the small rectangular bright/dark patch. It is visible at native resolution, clearer in labelled nearest4x crops, and far smaller in extent than the repaired hood defect. It is not proof of a physical gap or a proven causal primitive diagnosis. **Do not claim full visual parity.** Details and exact original/corrected/prior paths: `visual-review.md`, `visual-review.json`, `native-comparison-manifest.json`.

Glass-edge isolated wireframes are pixel-identical to control in both finishes, which does not prove surrounding-panel shading parity. Other small highlight/triangulation differences occur on body/fender details. Interior is viewed through real exterior glazing, not a cutaway; opaque silhouettes hide internal forms. Whole exterior wireframes are very dense/near-solid, contextual only. Frozen close-ups crop surrounding body and dashboard periphery, not primary seats/wheel/wipers.

## Real measured diagnostics

HTTP delivered the exact pinned files with `no-store`, no Content-Encoding header, empty ResourceTiming contentEncoding, encoded and decoded body sizes matching source lengths: **10,191,496 control; 9,198,676 corrected**. Saved **992,820 bytes / 9.741651%**. Raw CDP response headers and actual header-inclusive encodedDataLength are retained separately from body sizes. ResourceTiming transferSize uses the browser's accounting and is not an exact measured header size. The inherited raw network collector also records the HTML page because its query ends in .glb; tests select the true model by URL pathname, not that extra HTML record.

Both models report 214 renderer calls, 108 geometries, 15 textures, 23 programs at first model render. Renderer-submitted triangles: **426,390 control; 363,934 corrected**. Counts include main render plus transmission prepass, reset once per top-level render; not unique topology or actual GPU-work counts. No call-count reduction observed.

| completed order | model | fetch+parse ms | context-cold sync compile ms | load to first rendered frame ms | warm submit+finish p50/p95 ms | warm render+finish+RAF p50/p95 ms |
|---|---|---:|---:|---:|---:|---:|
| 0 | control | 14827.6 | 17.7 | 16566.4 | 2.7 / 94.1 | 9298.1 / 20090.1 |
| 1 | corrected | 18112.9 | 195.7 | 21235.5 | 3.1 / 54.5 | 8498.9 / 9653.5 |
| 2 | corrected | 15962.8 | 19.2 | 17774.3 | 3.0 / 98.4 | 47.8 / 18684.0 |
| 3 | control | 14563.2 | 14.3 | 16321.2 | 2.8 / 95.4 | 9200.0 / 10799.0 |

Nearest-rank percentiles; 30 warmed samples/context, low context replication. Raw fetchArrayBufferMs, parseDecodeMs, fetchParseMs, coldCompileMs, first-render cpuSubmitAndFinishMs, both warm sample series, all assignment records and network responses are in `raw/measure-*.json`; `metrics-summary.json` preserves honest descriptive names.

`renderer.compile(scene,camera)` is synchronous after Estuary assignment and before any model-scene render or transition. Procedural PMREM setup renders occur earlier, separately; native basis prefetch and PMREM are excluded from the model-load start. Context-cold does not mean OS/driver-cache-cold. `KHR_parallel_shader_compile` is absent. First-render correctness was not inspected at that timestamp: **first-correct-frame latency is unavailable**, not retroactively proven by later QC. Six warmups apply to the warmed measurement loop, not six frames per capture; the frozen capture sequence is initial compile/first-model frame, then one top-level render per planned image.

Chromium 156.0.8078.4, ANGLE/Vulkan SwiftShader Device (Subzero), software WebGL2. Very large RAF dispersion, the second corrected context's 47.8 ms median versus 18,684 ms p95, and compilation dispersion show uncontrolled host scheduling/cache effects. **Diagnostic only; no production-GPU ranking or runtime improvement established.** No extra reruns were spent trying to manufacture stable results.

## Tests, execution and failures

`pins-red.txt` demonstrates the actual prior-candidate pin failing the corrected pin test, then `pins-green.txt` passes. `matrix-red.txt` demonstrates a deliberately missing glass-edge target (8 instead of 9) failing the balanced108 contract before capture; `matrix-green.txt` restores and verifies the full matrix. This is an adversarial balancing RED, not a claim that the original harness lacked a matrix. `evidence-red.txt` preserves incomplete evidence failures; `tests-final.txt` contains all seven final passes.

`commands.jsonl` plus `execution-0.txt` through `execution-8.txt` preserve real argv/cwd/start/elapsed/exit and stdout/stderr for five capture batches and four individual measurement invocations. **All nine completed with exit 0; no interrupted attempt, exit137, browser error or excluded measurement context occurred in this new run.** Earlier directory's interrupted attempts remain historical there and are not reused as corrected measurements. Tool wait-window expirations only polled a running background wrapper; they did not stop any browser work.

## Recheck safely

From the backend repository root `/workspace`:

```
node --test research/runs/2026-10-21-sol-safe-correction-comparison/*.test.mjs
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-21-sol-safe-correction-comparison/capture.mjs gallery
python research/runs/2026-10-21-sol-safe-correction-comparison/verify.py
```

Do not rerun `prepare.py` on existing evidence: it now refuses an existing manifest rather than resetting it. `execute.py` records the initial sequence, not an idempotent all-run replay. Capture harness can be called for explicitly missing target subsets; it rehashes retained files and pins before every invocation and checkpoints after each PNG. Resume missing measurement contexts individually by their exact order/index; never overwrite a complete raw sample merely to obtain different timing. The final package needs no further expensive capture or measurement.

## Boundaries and paths

Requested host path `/home/jay/projects/external/configurator-demo` is absent in the Docker tool backend; discovered actual root `/workspace` was explicitly supplied by parent context and both model hashes were verified before use. Host-visible artifacts are under `/home/jay/projects/external/configurator-demo/research/runs/2026-10-21-sol-safe-correction-comparison/`; backend artifacts are `/workspace/research/runs/2026-10-21-sol-safe-correction-comparison/`.

All authored repository files are confined to that new Sol directory. Old runs, public/src/package files and manifests were not modified; protected snapshot verification records this boundary for 242 files. No GUI, Mobile LOD, commit/push, promotion or application integration. No final acceptance, decision.json or run.json authored. Parent owns attribution integration and final verdict; the parent supplied that correction-authentication/static gates already passed. This package does not replace those gates with browser evidence.


## Current gate status — Sol finalization 2026-10-22T19:23:51.374445+00:00

Authentic private attribution, static/reproduction and targeted repair pass; full matrix exposes residual rectangular seam deviation. Not promoted; superseded by FINAL. No runtime speedup established. 108 matrix cases, 64 actual browser transitions and 120 warmed diagnostic samples. Fixed-view research decision is separate from application acceptance.
Earlier no-final-verdict/run.json and pending-review statements describe the original evidence-production boundary and are superseded by this appended status and finalized run record. Existing artifact-inventory.json is historical: do not regenerate it to erase the boundary. Record start uses first retained commands.jsonl startedAt; end includes ledger finalization, not an active-render timing claim. All harness work is Sol-authored over mixed source assets.
