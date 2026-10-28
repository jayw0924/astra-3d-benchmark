# Composite 02 — actual renderer contact-shadow alpha, local only

**Outcome:** native 850×778 candidate produced and visually inspected beside the immutable source and composite 01. The real source-shaped soft contact shadow restores grounding beneath the nose, front tire and side sill; 01 visibly floats by comparison. There is no opaque gray floor patch. This is an inspectable candidate for Jay's review, **not approval/publication** or proof of photorealism.

## Review files

- `composite-02.png`: actual candidate, 850×778.
- `comparison-source-01-02.png`: labelled side-by-side; all three inputs pasted at native size, no source scaling.
- `shadow-layer.png`: actual black RGBA ShadowMaterial export, including portions later occluded by the car.
- `shadow-layer-effective.png`: equivalent layer with alpha zero at every protected car pixel.
- `shadow-overlay.png`: technical visualization only; cyan = exposed nonzero shadow support, green = protected boundary. Not the delivered composite.
- `source-diagnostic.png`: bounded actual renderer verification, NOT used for car RGB.
- `fitted-background.png`: same existing Qwen plate using existing cover implementation.

Host MEDIA path:
`/home/jay/projects/external/configurator-demo/work/ai-imagery-followup/protected-background/contact-shadow-02/composite-02.png`

## Method and provenance

No source-RGB shadow guessing, brush, ellipse, blob, blurred silhouette, floor-color extraction, invented lighting, paid job or cloud request. Actual application renderer/GLB/finish/light factory is loaded in the pre-existing disposable mask harness. `capture-shadow.mjs` intercepts browser responses only: exposes references, disables RAF scheduling and changes renderer construction from `alpha:false` to `alpha:true` to permit transparent export. No application or GLB file is written. This alpha-context instrumentation is disclosed rather than called an identical historical framebuffer.

Exactly **two explicit native render calls**, one successful capture session:
1. Set actual historical camera matrices at DPR 1, 850×778; render the unchanged source scene to populate the actual shadow map and save a diagnostic.
2. Keep shadowMap autoUpdate=false and populated map unchanged. Hide the model's beauty visibility, not its geometry/materials/caster assignments; null only scene background and clear transparent black. Render the existing ShadowMaterial floor against transparency using the retained map. Cache identity, camera equality and native MSAA state are asserted.

`capture.json` includes actual post-render camera/world/projection/target, every model mesh matrix/material name/visibility/caster assignment, model matrix, directional/hemisphere light values, floor/material state, renderer color/tone/shadow/context data and attribution. Runtime camera/model/mesh/material-name/caster parity is asserted against the historical source telemetry. The factory implements the approved `grounded-studio-refined` rig: opacity **0.14**, floor Y **0.1585579729696714**, key position **[1,10,1]**, bias **-0.00015**, normal bias **0.015**, PCFShadowMap/1024 map. Radius **8** is recorded, not claimed an independently supported PCF softness control. No settings were tuned.

### Mathematical layer / ordering

For source S, binary protection M, fitted background B and exported alpha A=byte/255:

`T = round((1-A) B)`; `C = M S + (1-M) T`.

Black shadow RGB is verified everywhere. Pillow `alpha_composite` applies this in stored sRGB byte space, not physical linear-light transport. Copying source RGB last preserves all boundary samples, glass and mirrors. Equivalent effective alpha is `A(1-M)`. No car resizing, interpolation, feathering or filtering.

The Qwen original remains unchanged, SHA-256 `d6e1ed83870024bab30eb66457907d75e3580ccab2526538a14e2c912eea4f2c`. Existing `fit_background(...,'cover')` is reused: 864×768 → 876×778, crop `[13,0,863,778]`; background only, LANCZOS with disclosed integer rounding. No new plate was authored.

## Machine evidence

See `verification.json` and `scope-verification.json`:
- **107,603 protected source pixels; 0 changed**, including **106,452 core / 0 changed** and **1,151 boundary / 0 changed**.
- Raw shadow: 57,875 nonzero-alpha samples, maximum alpha byte 36 (no opaque samples). Effective exposed support / changed pixels versus 01: **11,502**. Changes outside actual shadow support: **0**.
- Actual rerender differs from the historical source at **16 pixels**, max channel delta **51**, **all within protection**. This repeats the known renderer residual; no cause is claimed. The diagnostic is never used as source RGB.
- Strong shadow-isolation check: alpha composited over the *observed* original uniform background RGB `[221,217,208]` reconstructs every unprotected historical source pixel to within **1 channel level**. 9,375 differ by that rounding level; **0 exceed 1**. This uses observed pixels as a diagnostic reference, not an invented opaque floor passed off as a shadow.
- Existing immutable source PNG SHA: `a23adfe1d1ba992ce736f55ca6915f62f7b54d8afa96e9600a6181d8437c1c3b`.
- Preserved 01 SHA: `9230f828ad8d6b824defe1b486aba3739ce8849a883b412343ac207ac4613c4c`.
- Candidate 02 SHA: `96eda7c1547fb20084f7cd9123669821c656ff05c25a66d341b2f64efbef8599`.
- Raw alpha layer SHA: `8d67856eb4e233cf6d450438274b14133383c34ed6767f6734e43496840d5015`.
- Accepted model SHA: `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`.
- **2,145 pre-existing files hash-checked unchanged**, including inputs/history, accepted app/model, research/public files and unrelated uncommitted workflow work. `immutable-before.json` SHA: `8b2aacb41095523a4962435ec9f152d2d314f26b85cac6cdeae5e207d954ee5a`.

## Tests / bounded failures

Two vertical RED→GREEN tests exercise actual alpha blending and source-copy-last ordering including binary boundary protection. `test-red-01.log` is missing-module RED; `test-red-02.log` is missing-export RED. Both now pass (`regression-shadow-two.log`). The six original composite tests also pass (`regression-original-six.log`); bytecode writes disabled to preserve original cache/history. Native full-image assertions separately exercise every protected pixel and alpha-support boundary on the actual candidate.

First capture failed before launch: installed Playwright wanted missing browser 1248. One bounded retry explicitly used already-installed Chromium headless shell 1243; successful, no install. `capture.log` and `capture-retry-01.log` retain both outcomes. First assembly failed on absent numpy, before writing image outputs. One bounded rewrite using existing Pillow and stdlib succeeded; `assemble.log` and `assemble-retry-01.log` preserve both outcomes. No hidden generation retries or full matrix.

`commands.json` records executed procedure commands and corresponding logs. Writers use exclusive creation and must not be rerun into this populated directory. Reproduction requires a fresh separately named directory and intentionally updated references. All new work is ignored/local, not canonical research registration.

## Visual judgment and limitations

Full native 02 plus original, 01 and technical overlay were actually opened with vision. The soft narrow shadow under the front bumper, front tire and side/rear contact now gives a credible floor relationship for this restrained studio substitution; the floating flat-cutout impression is reduced. No broad rectangular gray patch is visible. The original's restrained shadow strength is retained rather than artistically intensified. The wheel/lower-edge raster retains a slightly hard CG/cutout quality, and the deliberately exact old-background edge samples can retain spill. It is a modest compositing refinement, not a full scene integration or physical contact validation.

Lighting/reflections and glass remain from the old studio, including original transmitted backdrop. The generated plate is a different lighting/background field, without calibrated camera/floor geometry or matching actual light transport. Transferred shadow alpha is source evidence, **not proof that the new plate would physically cast this shadow**. No relighting, glass correction, photorealism certification, geometry repair or user visual approval is claimed. No cloud/API/install/commit/push/deploy, no public-report changes. Stop here for visual review before archive/publication.
