# Case01: two-angle Qwen comparison

## Decision and attribution

Retain both outputs as interpretive product-image examples, not faithful product renders or improved 3D assets. Qwen Image 2.1 generated the images; Sol coordinated source preparation, prompt/guidance, graph comparison and technical/visual review; Jay manually executed Comfy Cloud jobs. Historical Astra-directed Safe geometry and sourced CarConcept credits remain attached. No angle winner or blanket fidelity approval is attributed to Jay. Source-angle approval and publication scope are supplied by the user, separately from the packet's earlier pending-review status.

Two actual current-grounded sources and two received generated PNGs are copied losslessly here and to `public/assets/study/ai-imagery/angles/`. `image-inventory.json` measures each native file. Source inputs are 850×778; generated outputs 864×768. They have different aspect ratios and are not aligned overlays. No crop, resize, retouch or synthetic replacement was used. Source transforms/cameras are known; generated perspective is not geometrically identical or certified by source telemetry.

## Native image review

- Front: recognizable overall red/black concept, silhouette and three-quarter orientation retained. Floor/contact shading and glass/body response look more photographic. The wheel spoke arrangement, tire structure, lower splitter/side trim, seams and surface grain are reconstructed; framing/projection shifts. Fine grain is generated appearance, not validated metallic-flake physics.
- Rear: recognizable rear three-quarter silhouette and glazing outline retained. A studio floor, contact shading and softer body/glass response read more photographically. Near wheel spokes and tire tread are redrawn; lower sill/rear trim and surface grain are reinterpreted. Shape/framing is not an exact camera/geometry match.
- These are independent edits. They do not establish scientific multiview coherence, reliable design preservation, general performance or a coherent reconstructed 3D model. The accepted Safe GLB, runtime viewer, materials and ground-contact implementation are unchanged.

## Effective graph comparison

`effective-comparison.json` records a recursive comparison of complete submitted graphs against the historical side seed-42 graph and rear against front. Both differ from side only at node 470 LoadImage: `inputs.image` **and** top-level `is_changed`; rear versus front changes that node only. The measured local source SHA-256 equals each `is_changed[0]`, but differs from each hash-shaped cloud filename. The latter is not a local-content checksum. These embedded tokens corroborate supervised UI source instructions and receipt, not independent cloud-upload authentication.

The selected effective prompt, model loaders and all selected branches/sampling settings match: seed 42, 25 steps, CFG 1, Euler/simple, denoise 1, refinement false, negative prompt empty. The inactive text-enhancer seed is also 42. UNET `qwen_image_2.1_int8_convrot.safetensors`, encoder `qwen3vl_8b_int8_convrot.safetensors`, VAE `qwen_image_2.1_vae_bf16.safetensors`. The text encoder resolution policy is 0; image-conditioning latent branch is selected, not the unused 1024×1024 EmptyLatent. Do not treat denoise 1 as generic image-to-image strength. Graph exports were extracted again from the actual output PNGs and compared with the received graphs. Native metadata is retained and reviewed; separate JSON graphs are research-only.

## Capture provenance and real failure

`source-capture/` is a verified, byte-identical copy of the work capture packet, including `source-manifest.json`, actual `front.json` / `rear.json` same-frame telemetry, pose records, source pins, instrumentation, `capture.mjs`, `verify-and-package.py`, command/error logs, preflight and original inventory. Its original scope/pending-review wording is historical, not overwritten by this publication.

The first front command exited 1 **after** successfully persisting front PNG and telemetry: raw deep comparison encountered fields serialized away as `undefined` and signed-zero normalization. `front-command.log`, `errors.jsonl` and `front-readback-recovery.json` preserve the failure and recovery. The retained harness reflects the normalized assertion used for rear (`JSON.parse(JSON.stringify(tel))`); it is not a pristine pre-failure snapshot. Front was verified from saved bytes, not recaptured. Two source captures, no capture retry. SwiftShader CPU and 500ms RAF pacing instrumentation are disclosed; this is source evidence, not GPU/performance measurement.

`copy-verification.json` records exact transfer identities. The convenience input files and each archived source match the actual capture PNG hashes. No API credentials are included; opaque cloud filenames/graph ID remain in reviewed embedded metadata. License entries consistently retain upstream CC BY 4.0 attribution; cloud terms/output rights have not been independently audited and this is not a legal guarantee.

## Timing, unknowns and scope

`run.json` timestamps/elapsedSeconds cover observed retrospective packet registration/copy only, not original generation, source capture, full review, active/billed time or this full session. Raw receipts retain actual observed receipt timestamps. Original cloud job IDs, start/end, execution duration, cost/credits, failed-job history and total submitted-job count are unknown. There are two successful received angle outputs; this registration performed zero generations. Do not infer cloud runtime from receipt/copy times.

All four follow-on conditions remain **planned, not executed**: masked-background compositing, original-seed repeatability, a second model, and location imagery. Protocol: [`car-ai-imagery-followup-v1.md`](../../protocols/car-ai-imagery-followup-v1.md). Nothing here implements masks or expands paid scope. Case02 remains empty. The prior side run, historical inventories and public side PNGs are immutable; `before.json` and final integrity verification cover their hashes plus the accepted model.
