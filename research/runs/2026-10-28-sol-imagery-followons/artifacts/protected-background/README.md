# Protected-car / neutral-background preparation — local only

**Ready for one proposed Jay-operated background generation; no cloud job executed.** Start with `inspect-overlay.png` (green = protected geometry), `source.png`, and this guide. `technical-selftest-identity.png` is ONLY an unchanged-source technical test, not an AI result or a new design.

## Exact input and method

Upload **`source.png` from this directory** as the sole image_1 reference, not the old side view, a generated car, the green overlay, or the mask. It is a byte-identical copy of `../car-front-three-quarter.png`, 850×778, SHA-256 `a23adfe1d1ba992ce736f55ca6915f62f7b54d8afa96e9600a6181d8437c1c3b`. Historical same-frame telemetry is `../source-captures/2026-10-27-current-carmine-two-angles/front.json`. This deliberately uses the requested actual front camera; the older protocol proposed a side-view background condition. It is a scoped preparation deviation, not a change to that historical protocol or a side-view causal comparison.

Camera position `[5.1182388968791805,3.0999999999999996,8.003351210241432]`, target `[0,0.55,0]`, quaternion `[-0.12548936421738263,0.2782525288275202,0.036694947005704664,0.951567880150258]`, fov 32°, native 850×778/DPR 1. Exact projection/world matrices are in `capture.json`. Actual accepted GLB SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4` remains unchanged.

`harness.html` imports the actual viewer/loader/lighting into a disposable canvas. `capture-mask.mjs` exposes its existing objects only in intercepted browser responses, freezes animation, applies Carmine Candy/bright alloy, sets the retained exact camera, and asserts camera/model/all mesh matrices, visibility and material-name parity before saving. No application file is edited. One bounded successful capture session rendered an RGB diagnostic then a mask using the same native four-sample MSAA framebuffer. The first launch timed out because Playwright's default wait polling used the intentionally disabled requestAnimationFrame; switching to interval polling resolved the wait, without a prior mask render.

## Mask and transparency policy

No color key or background-color segmentation. The actual GLB has no non-OPAQUE alpha materials. `Glass` (index 1) is double-sided, opacity 1/transparent false at runtime, but uses `KHR_materials_transmission` factor 1. `Mirror` (index 14) is OPAQUE with emissive texture and roughness 0. All visible car geometry is temporarily rendered white with each original material's side/culling retained; glass transmission is intentionally replaced with opaque geometric coverage. Unsupported alphaTest/alphaMap/blended/partial-opacity materials stop capture rather than pretending their coverage is solved.

- `coverage-render.png`: actual antialiased grayscale native coverage (black background, floor hidden). This is geometric coverage, NOT a photometric glass alpha matte.
- `mask.png`: 255 = preserve source RGB, 0 = use background. Every nonzero raster coverage sample becomes 255, including windows/glass, visible interiors, mirrors, wheels, tires and thin parts. Real geometric holes remain background where no car surface covers them.
- `core-mask.png`: 106,452 full-coverage pixels.
- `boundary-mask.png`: 1,151 partial-coverage raster pixels, protected fully as well. Total protection 107,603 pixels; bounds `[119,261,705,521)`.
- **No boundary blending/feathering in this first test.** Native edge samples already contain original studio backdrop; preserving them exactly can leave spill/halos. This is separate from the exact core invariant. A later approved feather/decontamination derivative would change boundary pixels and must not be called fully pixel-preserving.
- **Floor/contact shadow excluded.** The generated scene must provide compatible grounding; it is not extracted from source RGB or falsely claimed physically accurate. Empty-scene shadow failure/halo is a review failure, not permission to repaint the car. Do not invent an object-shaped shadow in the prompt or claim the model can infer one correctly.

The RGB diagnostic differs from the archived source at **16 pixels**, max channel delta **51**, all inside protected support; cause not isolated. Thus the rerender is not byte/pixel-identical historical RGB evidence. Exact retained matrices/native raster geometry support the mask, and the composite always uses the immutable original RGB, never this diagnostic. Full overlay inspection showed coverage over windshield, side glazing, mirror and tires and no obvious gross contour misalignment; this is not exhaustive subpixel or hidden-surface certification. The residual 16-pixel renderer variation remains a disclosed limitation; review native boundaries before accepting a generated composite.

## One proposed manual generation (NEW prompt, not the old enhancement prompt)

Use Jay's existing Comfy Cloud Qwen Image 2.1 graph; sole reference image_1=`source.png`, seed **42**, 25 steps, CFG 1, denoise 1, euler/simple, empty negative, refinement off, existing reference-conditioned sizing. Do not add a protection mask unless actual graph support is verified: protection happens locally, not through a Qwen promise. No API setup, install, model download or automatic retry. Check displayed price/credits and approve one job before submitting; cost unknown. Download the original save-node PNG and workflow/metadata after that one job, then stop for review.

**New exact prompt:**

> Using the reference only to match camera viewpoint, floor perspective, framing and soft neutral studio illumination, create an empty automotive photography studio background plate. Remove the car completely, including all wheels, reflections of the car and its cast shadow. Leave the entire former car area as clean continuous empty studio space. Use a seamless light warm-gray cyclorama and matte neutral floor, a subtle soft tonal gradient, and broad diffuse softbox-style illumination compatible with the reference. Keep the same viewpoint and a quiet, low-contrast neutral studio treatment. No vehicle, people, props, architecture details, text, logos, dramatic lighting or outdoor scenery. Do not create a new car. Return only the empty background image.

This requests a small studio variation, not a location or relight. Perspective/shadow quality and removal are not guaranteed. Reject residual generated car parts, incompatible illumination, horizon or floor contact. No local invented plate is provided.

## Local composite after download

Run from the repository root on the machine containing this repo (not a different laptop). Preserve the downloaded original separately. Default is strict native-size acceptance:

```sh
python work/ai-imagery-followup/protected-background/composite.py /actual/downloaded-background.png work/ai-imagery-followup/protected-background/composite-01.png
```

A prior Qwen output was **864×768**, NOT this source's 850×778. A mismatch stops by default—never stretch/crop the car or silently align two generated car views. If review explicitly permits changing only the empty background, choose center-cover:

```sh
python work/ai-imagery-followup/protected-background/composite.py /actual/downloaded-background.png work/ai-imagery-followup/protected-background/composite-01.png --background-fit cover
```

Policy: background-only uniform cover scale, integer dimensions rounded upward, central crop to native 850×778 with LANCZOS; exact original/resized dimensions, effective per-axis rounding, crop box and hashes are recorded alongside the output. No letterboxing and no car transform. This is a disclosed background derivative, not calibrated scene registration. Script validates immutable source/mask hashes, rejects wrong source/mask dimensions, and refuses output overwrite. `protectedChangedPixels` must be 0. The default binary mask causes **all** protected pixels, including the 1,151 raster-edge samples, to remain exact.

## What has actually passed

Tests were written first and failed because implementation was absent, then six tests passed: source-background RGB identity; source-size and mask-size rejection; 864×768 strict mismatch rejection; explicit background-only cover; protected-pixel equality. Actual CLI selftest used `source.png` as both source and background: the complete output RGB equals source, all 107,603 protected pixels unchanged; PNG bytes differ because it is re-encoded. This is a technical identity check, not visual integration validation. Run again (unit tests don't overwrite artifacts):

```sh
python -m unittest discover -s work/ai-imagery-followup/protected-background -p 'test_*.py'
```

`prepare-mask.py` reproduces masks from retained capture; do not rerun the capture writer into this populated directory (it refuses overwrite). `capture.json`, `mask-provenance.json`, `material-audit.json`, and `scope-verification.json` retain measured evidence. New files live only here. Existing application/report, historical evidence, accepted GLB and unrelated workflow-publication edits remain untouched; no commit/push/deploy.

**Limits:** preserving glass/mirrors means original studio reflections and any transmitted old backdrop stay baked in. This cannot improve shading, relight the product, prove accurate new-scene reflections, prove product fidelity beyond the chosen mask, or create coherent multi-view imagery. Only Jay's actual downloaded background can test integration. The next action is one manual generation with the new prompt and this source, then local fit/composite and native boundary/contact review—not another automatic job.
