# Sol ground-contact diagnosis and bounded correction

## Outcome — approval pending

A real geometric receiver gap caused the reported floating car. The selected lighting was not the primary cause. Only the refined recipe's shadow receiver height changed; model transforms, model bytes, materials, environment, lights, exposure, shadow fitting/filter/bias/opacity and application camera setup are unchanged. No commit, push, deployment, model edit, Blender install, dependency addition, postprocessing or artificial contact shadow.

Open `index.html` for seven paired views: Carmine and Estuary side/front/wheel desktop, plus Carmine side in the mobile layout. Left is the frozen recipe; right is the bounded receiver correction. Native PNG links preserve resolution. These are actual application canvas framebuffers, not replacement scene renders or DOM screenshots. User approval is separate from technical checks.

## Root cause and measurements

`Box3.setFromObject(model)` transforms each primitive's local bounding box, which includes empty corners around rotated circular tires. The viewer centers that conservative box and positions its bottom at Y=0. The floor used Y=-0.003. Actual transformed tire vertices were higher:

| Runtime mesh | Actual tread minimum Y | Before clearance | After clearance |
|---|---:|---:|---:|
| mesh_87_1 | 0.1590580353062846 | 0.1620580353062846 | 0.0005000623366132 |
| mesh_89_1 | 0.1605192123084346 | 0.1635192123084346 | 0.0019612393387632 |
| mesh_91_1 | 0.1590579729696714 | 0.1620579729696714 | 0.0005000000000000 |
| mesh_93_1 | 0.1605192382041636 | 0.1635192382041636 | 0.0019612652344922 |

Units are scene units. All four tread primitives are visible, opaque `Tiretread` materials and actual shadow casters in both finishes. Full transformed minima points and material/caster inventories are in the before/after measurement JSONs. Front/side tire sampling produces a remaining 0.001461265 spread; geometry is not flattened or forced into the floor to erase it.

Independent raw-GLB verification with the installed glTF-Transform reader reconstructs node world matrices and primitive position arrays without modifying the GLB. `raw-glb-bounds.json` reproduces the runtime values. The lowest conservative tread box reaches raw Y=-0.15929905046462733 while its actual vertex minimum is raw Y=0.0012201618438072437. Viewer normalization adds 0.1592990504646274 to Y. Rotation about the viewer's Y axis cannot fix or cause this vertical discrepancy.

The correction is `new Box3().setFromObject(model, true).min.y - 0.0005` for the refined receiver only. Runtime floor becomes Y=0.1585579729696714, a rise of 0.1615579729696714. Actual global minima were confirmed to belong to the tire tread before using the precise box. No model translation, deformation, camera retarget or light refit.

## Ranked hypotheses and disposition

1. Incorrect geometric floor fit — confirmed by transformed vertex enumeration and raw GLB reconstruction. The conservative AABB is not the tire contact surface.
2. Tire excluded from shadow casters — falsified: all four opaque tread primitives cast shadows with actual assigned materials; variant indices are independently checked in focused browser inspections.
3. Bias detachment / wide filtering — secondary presentation limits, not the large geometric gap. Retained bias=-0.00015, normalBias=0.015, PCF radius=8, map=1024x1024, opacity=0.14. No bias adjustment was justified by the proven cause.
4. Camera-only illusion / weak contrast — low oblique views make the real gap especially visible, but it exists independently of camera. Paired cameras and application layout are held fixed; front views hide some separation that side/wheel views expose.

Installed Three shader source confirms normalBias offsets the receiver query along its world normal (`shadowmap_vertex.glsl.js:35`), not physical mesh vertices. PCF uses Vogel-disk samples with radius/mapSize (`shadowmap_pars_fragment.glsl.js:148-175`); radius is supported, not ignored. With the frozen shadow-camera width 9.47543491252003, one texel is 0.009253354406757841 scene units and radius 8 corresponds to a nominal 0.07402683525406273 sampling scale. The depth-bias world-depth equivalent is -0.0035367656577218643; normal query offset is 0.015. These remain much smaller than the original geometric gap. The receiver's opacity is intentionally low and filtering is broad, so this fix does not promise dense physically accurate contact occlusion. Stronger artistic contact would require a separately approved shadow recipe/AO/contact-shadow treatment; none is hidden in this change.

## Test and browser evidence

- `red.log`: one targeted test failed on the refined floor assertion (old conservative placement -0.7101067811865476 vs expected actual-vertex placement -0.000500000000000111). The synthetic rotated sparse primitive makes the empty-box-corner bug red-capable. A first test-fixture orientation error was corrected before production changes.
- `unit-final.log`: all 6 files / 38 unit tests pass, including historical recipe preservation and no model-transform change.
- `lint-final.log`: `npm run lint` exits 0.
- `build-app-final.log`: `npm run build:app` exits 0. Vite retains the pre-existing large chunk advisory.
- `focused-browser.log`: Carmine actual-app assertions passed; the subsequent Estuary navigation exceeded the original 30-second model response timeout. `focused-browser-Estuary.log` is the successful isolated retry with the bounded response timeout raised to 180 seconds. After-inspection JSONs confirm applied variant material indices, an allocated 1024x1024 shadow map, draw calls, rendered frames, shadow updates, enabled shadows and the actual selected environment. They do not rely on UI status alone.
- `verify.log` / `verification.json`: seven pairs, equal pair dimensions, nonblank pixels, changed image pixels, all four actual tread clearances under 0.002, identical mesh/material/caster inventories and identical shadow settings/exposure before/after. All model bytes remain 9,239,404; SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`.
- Existing `tests/e2e/lighting.spec.ts` floor expectation was updated to the measured minimum for the already hash-pinned model. Its historical capture writer was NOT rerun, because it overwrites the previous lighting-integration evidence directory. Equivalent focused live checks are in this run's harness instead.

## Visual review of every paired view

- Carmine side: broad detached before-shadow shifts into tire contact after; model silhouette and lighting stay fixed.
- Carmine front: receiver no longer visibly hangs below the front; softer residual contact is expected from unchanged PCF/opacity.
- Carmine wheel: strongest proof of original detached shadow; after shadow reaches the wheel base without pressing the tire through the floor.
- Estuary side/front/wheel: same grounding improvement, unchanged finish appearance; wheel view confirms the same local correction.
- Mobile Carmine side: corresponding improvement, but the research side camera crops nose/tail at the narrower canvas aspect. This is a mobile-layout capture, not physical-device gesture certification or an approved mobile composition.

All paired images were loaded and reviewed with the vision tool. Pair JPEGs are presentation derivatives; original native PNGs are the evidence. Contact is improved, not declared photorealistically complete or user-approved.

## Protocol, execution and limits

Inventory of all prior run directories preceded this new directory. `frozen-before-viewerLighting.ts.txt` preserves HEAD's pre-correction source; older run directories and historical inventories were not rewritten. Parent freeze note is separate and untouched.

Research-only Playwright route instrumentation exposes closure objects to measure the actual app scene and set fixed test cameras; it is not a production seam or renderer replacement. Before-resume removes only the five-line receiver correction from the served module. After runs use the actual source. The initial before run captured five views before a 420-second tool timeout terminated the browser; native files were retained and only the missing Estuary wheel was resumed. `before-resume.log` records an instrumentation-route failure caused by Vite's timestamp query; the successful retry uses a query-tolerant route. Subsequent finish runs use isolated bounded processes. Render scheduling is paced to 500 ms from initialization for software rendering; timings do not represent native GPU performance.

Cameras: side position [8,1.8,0], target [0,.55,0]; front [0,1.5,9], target [0,.55,0]; wheel requested [4.2,.65,3.5], target [1,.28,1.25], with existing OrbitControls minimum-distance enforcement retained and actual final camera recorded in manifests. Desktop viewport 1280x900; mobile layout 393x851; DPR 1. Native desktop canvas 850x778; mobile 353x440. No expensive finish/trim/orbit supermatrix was run. Native app default camera source did not change.

Exact executed command families (from repo root):

```
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-26-sol-ground-contact/capture.mjs before
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-26-sol-ground-contact/capture.mjs before 'Estuary Enamel'
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-26-sol-ground-contact/capture.mjs after 'Carmine Candy'
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-26-sol-ground-contact/capture.mjs after 'Estuary Enamel'
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-26-sol-ground-contact/capture.mjs before-mobile 'Carmine Candy'
PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright node research/runs/2026-10-26-sol-ground-contact/capture.mjs after-mobile 'Carmine Candy'
node research/runs/2026-10-26-sol-ground-contact/raw-glb-bounds.mjs
python research/runs/2026-10-26-sol-ground-contact/verify.py
npx vitest run src/lib/viewerLighting.test.ts
npm run test:unit
npm run lint
npm run build:app
```

Ready for user visual approval of this grounding-only correction; not authorization to publish or tune materials.
