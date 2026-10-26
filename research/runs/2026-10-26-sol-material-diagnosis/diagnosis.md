# Read-only material / geometry diagnosis preparation

**Outcome:** concrete material-response hypotheses are now source-pinned, but no residual visual defect has been causally localized and no candidate has been authored. The next useful evidence is a fresh original-Estuary-control versus accepted-Safe comparison under the identical frozen refined rig, **planned, not performed**. Blender is unavailable here and is not needed for the structural checks already completed.

Attribution: **Sol analysis**, separate from Astra asset/geometry authorship. This delegated analysis does not authenticate a new subject benchmark session. No new model-quality or performance finding is claimed.

## Scope and provenance

The requested host-visible repository path `/home/jay/projects/external/configurator-demo` resolves to `/workspace` inside this Docker tool backend. Git HEAD was `ffe0a56982a0bb22c34d705b1c00f0a62d147a0f`. The new output directory did not exist when research runs were enumerated. The only initial untracked path observed was the parent's `research/FROZEN_LIGHTING_CHECKPOINT.md`. No historical writer, asset exporter, build or dependency installer was run.

`inventory.json` is real direct-parser output from `inspect.py`, not synthesized model data. It includes complete material definitions, textures/samplers, every image hash and KTX2 header, node hierarchy, per-primitive material/variant mappings, decoded accessor statistics/digests, source pins, and control/Safe correspondences. The script reads assets and emits JSON to stdout; only the shell redirection writes the new report. `frozen-source-pins.json` plus the two `frozen-*.txt` files preserve the actual Git-checkpoint viewer source independently of ongoing grounding work; both matched the source read during this inspection. These copies are evidence, not app edits.

### Immutable asset identities

| Role | Repository path | Bytes | SHA-256 |
|---|---|---:|---|
| Upstream reference (not the causal control) | `research/assets/upstream/CarConcept.glb` | 10,267,996 | `659c592e20aba7afa920db7d14ad767874741384c215ee1df23a5e1c5e1c411c` |
| Sanitized sourced baseline | `public/assets/models/product.glb` | 10,190,148 | `67b7986109c72f6fcc61745e4e2eef25833fbf5c43fa6ffc0f0cf4e9d9e91f41` |
| Corresponding original Estuary control | `public/assets/models/product-estuary.glb` | 10,191,496 | `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f` |
| Accepted runtime Safe | `public/assets/models/product-estuary-safe.glb` | 9,239,404 | `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4` |

Use the original **Estuary** control versus Safe, not upstream versus Safe: upstream also includes sanitization/material-authoring differences. Static triangle counts for those four artifacts are respectively 213,347 / 213,195 / 213,195 / 183,117. These are source topology counts, not GPU work or performance claims.

## Verified static findings

### 1. Control/Safe material identity is very strong, but interpolation identity is not established

- All 107 Safe primitives match unique original-control primitive identities using complete node index/name identity plus primitive ordinal, with exact node hierarchy equality checked first. All corresponding default materials and variant mappings are equal.
- Both have 30 materials, 14 images and four variants: Carmine Candy, Pearly Swirly, Torched Graphite, Estuary Enamel. Each variant maps 25 primitives.
- Textures, samplers, image payload SHA-256 values and variant lists match exactly. Material JSON is not byte/field-identical: Safe omits explicit `alphaMode: OPAQUE` on Estuary Main/Accent (28/29). Normalizing **only this documented default** gives material equality. Installed GLTFLoader lines 3670–3681 implement the same OPAQUE default.
- Every Safe primitive's **joint decoded attribute tuples** is a subset of the corresponding control's tuples, with identical attribute semantic sets. This includes positions/normals/UVs/tangents where present; it is stronger than checking the fields independently. It does **not** prove unchanged triangle connectivity, interpolation or appearance.
- 73 primitives have different index sequences and reduced topology. Door color panels, rear color panels, windows, and rims are among changed regions; e.g. `BodyDoorLColor1` 2,595→2,075 triangles, `BodyRearPanelsColor1` 12,984→10,386, `BodyDoorLWindow` 1,392→1,112. `BodyHood` and `BodyWindshield` are not among changed-index primitives in this comparison. A shading symptom on a retained region could still come from neighboring geometry/reflections, not necessarily that region's mesh.

### 2. Paint is not one material family

Values below are **linear glTF factors**, not sRGB UI hex values. Missing metalness is not zero: installed GLTFLoader lines 3640–3641 default it to 1.

| Finish/material index | Response-relevant source data |
|---|---|
| Carmine main 10 / accent 9 | Metalness defaults 1; roughness .25/.30; clearcoat 1/.25, clearcoat roughness 0; normal texture 7 at scale ~.30 with 30×30 UV repeat (accent also rotation .585398 radians). AO texture present but strength 0. |
| Pearl main 21 | Metalness defaults 1; roughness .35, clearcoat .1 at roughness 0, normal scale .05 with 30×30 repeat; iridescence .8, IOR 1.2, thickness 820–920 plus texture 13 with 2×2 repeat. |
| Pearl accent 23 | Metalness defaults 1, roughness .25, no normal/clearcoat/iridescence extension. |
| Graphite main 22 / accent 24 | Metalness defaults 1; roughness .30/.20, no normal maps. Accent iridescence .5, IOR 1, max thickness 1000; omitted fields remain defaults, not measured physical properties. |
| Estuary main 28 / accent 29 | Explicit dielectric metalness 0; base colors [.018,.105,.085,1] / [.012,.025,.023,1]; roughness .32/.36; clearcoat 1 with roughness .12 for both; **no normal, base-color or roughness textures**. |

These finishes cannot be diagnosed by a single global normal-strength adjustment. In particular, Estuary residual surface response cannot come directly from Carmine/Pearl paint texture 7: Estuary does not reference it.

### 3. Glass and wheels have distinct confounds

- Glass material 1: double-sided, roughness 0, metalness 0, transmission 1; OPAQUE default; no volume, explicit IOR, thickness texture or normal map. `BodyWindshield` has POSITION/NORMAL only, so absent UV/tangent data on that material is not by itself a missing-map defect. No measured windshield thickness or physical glass calibration is available.
- Runtime loader maps transmission to MeshPhysicalMaterial independently of alpha blending (installed GLTFLoader 1160–1188, 3670–3681). Do not diagnose it as ordinary alpha-transparent glass from `transparent` alone. The frozen grounding caster filter uses `!material.transparent`; any shadow consequence belongs to the separate grounding owner and is **not evaluated or repaired here**.
- Native `Rim2` (19) has default metalness 1 and roughness .049; native `Rim1` (20) has metalness 0, roughness .4 and very dark baseColor. Both retain emissive texture 3, white emissive factor and AO texture 1 / UV1 / strength .85.
- Application `setTrim` overrides **both** cached rim materials: alloy restores original colors but sets metalness **1** and roughness **.24**; dark sets color `#181a1d`, metalness **.85**, roughness **.30**. Alloy is not a restoration of the native glTF shader, especially for Rim1. Neither branch removes emissive/AO texture inputs. Source: frozen `threeViewer.ts` 223–237, 264–275. These are code-established effects; this package has not captured fresh live applied values.

### 4. Numeric normal/UV/texture checks are useful, not a quality verdict

- Safe: POSITION and NORMAL on all 107 primitives; TANGENT on 57, TEXCOORD_0 and TEXCOORD_1 on 99 each. No nonfinite attribute values found. All normal lengths fall within 1e-3 of unit length; actual range about .999999848–1.000000150. No zero-length normals.
- Per-accessor UV extrema are retained. Example hood UV0 spans [.27505946,.51839465] to [.74269789,.80778050]; left door main spans [.01480293,.18834376] to [.39159709,.38874245]. Ranges alone say nothing conclusive about island stretch, texel density or seams.
- All 14 embedded images are KTX2; dimensions/mip counts parsed, payloads hashed, **texels not decoded or visually inspected**. Paint normal image 7 is 128×128, 8 mip levels; its sampler is nearest magnification (9728), nearest-mipmap-linear minification (9986), repeat wrapping. Other samplers use linear / linear-mipmap-linear. Repetition/filtering is a plausible Carmine/Pearl texture-response variable, not proof of visible aliasing.
- Missing tangents are not automatically broken material shading. Shader normal-map processing is distinct from vertex normals (`normal_fragment_maps.glsl.js` 21–33). This inspection does not verify derivative tangent behavior, normal-to-face angular alignment, winding, manifoldness or UV stretch; those remain named unknowns.

## Frozen runtime presentation and historical evidence boundary

Frozen `threeViewer.ts` 112–143: sRGB output, ACESFilmic exposure 1.05, DPR capped at 1.75, perspective FOV 32, camera [6.4,3.25,7.2], target [0,.55,.1]. Lines 239–249 center/lift and rotate the model -.22 radians, update matrices, then create `grounded-studio-refined`.

Frozen `viewerLighting.ts` 4–10, 45–79: refined hemi .55, key 2 at [1,10,1], rim .9 at [-5,3,-4], procedural RoomEnvironment rotated π/2, point intensity 650, selected emissive panel width/intensity adjustment, PMREM sigma .08, neutral background #ddd9d0. Exposure is not the only determinant of paint/glass response. No source material is changed by this rig.

Historical original/Safe geometry comparison is **not the requested selected-rig comparison**: `research/runs/2026-10-22-sol-safe-final-comparison/page.js` 7–12 used #d6d6d3, RoomEnvironment sigma .04, 600×400 DPR1; it did not import the selected refined rig, and lines 60–87 assign variants without the runtime wheel override. Those images remain historical evidence in their own conditions. No new captures were made or relabeled. The separate ground defect and its parallel repair are out of scope; do not transfer any material conclusions to that work.

## Prioritized testable hypotheses (not established visual defects)

1. **Layered paint / environment interaction, especially Estuary clearcoat.** Estuary has two roughness layers (.32/.36 base, .12 coat) and no paint normal map. Broad/bright environment reflections can dominate readable shape even on preserved geometry. Test the matched source/Safe images first; if shared and localized to this response, the conditional one-scalar clearcoat test in `proposed-protocol.md` is the smallest intervention. It may be worse; no winner predicted.
2. **Runtime wheel treatment differs materially from native intent.** Source confirms the alloy metalness/roughness override, including a dielectric-to-metal change for Rim1, and retained emissive input. Compare native/alloy/dark in an isolated wheel-only test before any reauthoring; freeze topology/lighting/camera. Geometry is still competing: both rim primitives have reduced topology.
3. **Glass reflection/transmission versus actual shell/normal geometry.** Zero-roughness full transmission and double-sided shading interact with the selected environment and interior. Inspect matched unchanged windshield and reduced door/rear windows separately. A roughness or thickness/IOR edit would be a new protocol, not bundled with paint or grounding. No evidence currently selects that edit.
4. **Simplified connectivity changes reflected highlight interpolation.** Retained joint normal/UV values do not guarantee preserved interpolation. Changed doors/panels/windows/rims are concrete targets; original-control-only reproduction under identical refined lighting is the discriminator. Do not hide a Safe-only artifact with softer paint or recalculated normals.
5. **Carmine/Pearl texture repeat/filtering or UV/normal seam interaction.** 30× repeated 128px normal map with nearest sampling merits local texel/UV inspection. This cannot directly explain Estuary texture response, and unit normals do not establish seam correctness. Decode or Blender inspection is still required to identify actual map content.

The ranking is proposed diagnostic order, not measured severity or causality. No supplied residual-defect image was available in this delegated task; this report deliberately makes no new image-quality observations.

## Next experiment, Blender and decisions

- `proposed-protocol.md` freezes a balanced **32-image planned** original/Safe material-localization matrix under one frozen rig. It then proposes, conditionally, one Estuary Main clearcoat roughness change **.12→.20** with an **8-image planned** protected-finish comparison. **Neither stage is performed, no candidate exists, and approval is still required.**
- `blender-brief.md` specifies immutable-copy import, normals/UV/units/transmission/texture inspection, separate .blend saves, camera/lighting-reference approximations, export to a separate candidate plus exhaustive semantic diff, and browser revalidation. Blender would add interactive mesh/UV/node inspection and editable references, not automatic offline/browser equivalence.
- Executable `blender` and Python module `bpy` are unavailable in this backend. No installation/dependency/mount change attempted. Basis KTX2, variants and extension import/export support remain a prerequisite even on a Blender-capable machine.
- Needed: Jay's named defect/region, permission for fresh paired captures, decision on frozen versus later accepted grounding baseline applied identically, and separate approval before material authoring or Blender/tool provisioning. No app integration, asset replacement, commit, push or deployment authorized here.

## Reproduction and limitations

From the repository, `python research/runs/2026-10-26-sol-material-diagnosis/inspect.py` emits a new inventory to stdout without writing assets. Compare it to retained `inventory.json` only if source pins are unchanged; a concurrently modified ground module legitimately changes working-source pins. Do not rerun historical evidence writers.

Initial inventory execution rejected a correspondence key based only on node names: several tire nodes are unnamed. No partial inventory was accepted. The inspector was corrected to require exact node-hierarchy equality and unique full node-index/name identities before comparison; the complete second execution succeeded. No numerical validity was inferred from the failed run. Initial full-report replay later failed equality because the parallel grounding worker changed `src/lib/viewerLighting.ts` after the frozen source snapshot. The original `verification.json` is retained as that failed strict replay, not relabeled as a pass. `final-verification.json` separates immutable asset-analysis equality and checkpoint-source verification from concurrent working-source drift; no source pins or historical records were rewritten. Static structural evidence is not visual acceptance, physical accuracy, arbitrary-view parity, performance, or authenticated model attribution.
