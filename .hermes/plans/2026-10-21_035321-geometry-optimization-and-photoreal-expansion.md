# Geometry Optimization and Photoreal Expansion Plan

> **For Hermes:** Execute this as a sequence of independently reviewed benchmark work packages. Keep source-backed-data-app and 3D benchmark provenance gates active; do not combine optimization, second-asset onboarding, and external image generation into one scored run.

**Goal:** Extend the case study from material authoring into an evidence-backed geometry/optimization benchmark, then reuse the stabilized workflow on a second model and produce clearly labeled, structure-grounded photoreal AI renders.

**Architecture:** Preserve the current CarConcept source, sanitized baseline, Estuary candidate, and public integration as immutable controls. Build a fixed geometry-quality baseline and browser measurement harness first; let Astra produce isolated optimization candidates against that frozen protocol; compare source, safe, and aggressive outputs under identical cameras and real-device browser tests. Generalize the pipeline only after the first optimization package passes. Treat photoreal image generation as a separate external-generation lane conditioned on deterministic 3D passes—not as proof of the underlying model's geometry quality.

**Tech stack:** glTF/GLB, glTF Transform, Three.js/WebGL2, Playwright, Chrome performance APIs, optional Blender or `gltfpack`/meshoptimizer after environment preflight, Hermes/Astra session evidence, and a separately selected image-generation backend.

---

## Recommendation and sequencing

Proceed in this order:

1. **Publish asset-selection and geometry-baseline evidence.** This is low risk and immediately improves the story.
2. **Run an Astra geometry-optimization bake-off.** This should be the next scored experiment.
3. **Integrate only the winning optimization if it improves a named metric without visible regression.**
4. **Generalize the pipeline and onboard one structurally different model.** Do not choose another car by default.
5. **Generate photoreal AI imagery from deterministic 3D conditioning passes.** Keep it visibly separate from technical/WebGL evidence.
6. **Publish side-by-sides and a decision summary.** Comparisons should explain tradeoffs, not merely decorate the page.

Do **not** jump directly to AI renders or a second model. Doing so now would multiply variables before we know whether the geometry pipeline is reusable or whether the current bottleneck is actually geometry, textures, shaders, or continuous rendering.

---

## Phase 1: Explain the source asset and establish geometry quality

### Task 1: Freeze the geometry/optimization protocol

**Objective:** Define what “better for WebGL” means before Astra sees the model or any candidate output.

**Files:**
- Create: `research/protocols/geometry-optimization-v1.md`
- Modify: `research/protocol.md`
- Create: `research/schemas/geometry-report.schema.json`
- Test: `scripts/validate-research.test.mjs`

**Protocol requirements:**

- Immutable input: `public/assets/models/product-estuary.glb` and its current manifest hash.
- Preserve the sanitized trademark state, four finish variants, 25 mapped primitives, hierarchy semantics, dimensions, transforms, UVs, material assignments, texture payloads, and visible wheel/interior detail unless a declared candidate intentionally changes them.
- Record before/after:
  - transfer bytes and gzip/Brotli behavior where applicable;
  - triangles, render vertices, uploaded vertices, primitive/draw-call proxy count, nodes, meshes, materials, textures, and extensions;
  - bounding box and transformed world dimensions;
  - model load-to-first-render, cold shader compile, steady/warmed frame timing, renderer program count, and GPU/CPU renderer identity;
  - visual comparison at fixed exterior, wheel, mirror, panel-gap, interior, and wiper views.
- Two target candidates:
  - **Safe WebGL:** prioritize visual parity; target roughly 20–35% geometry reduction or a material load/compile improvement without detectable fixed-view regression.
  - **Mobile LOD:** target roughly 45–65% geometry reduction; visible differences are allowed only if documented and acceptable at the intended screen size/distance.
- Maximum three correction rounds per Astra candidate.
- Stop on broken variants, missing textures, changed dimensions beyond tolerance, reintroduced mark-bearing nodes, invalid GLB, visibly damaged silhouette/panel gaps/wheels, or regression in the named deployment metric.
- Do not promise triangle reduction before profiling. Current evidence suggests 213,195 triangles and 107 primitives are plausible WebGL loads; textures, transmission/double-sided shaders, continuous rendering, or draw submissions may matter more than raw polygon count.

**Validation:**

```bash
npm run research:validate
npm run test:scripts
```

Expected: protocol and schema are machine-readable; malformed geometry reports fail closed.

### Task 2: Produce the source-asset story

**Objective:** Add a concise public explanation of why CarConcept was chosen and what the project actually received.

**Files:**
- Create: `research/runs/<baseline-visual-id>/prompt.md`
- Create: `research/runs/<baseline-visual-id>/notes.md`
- Create: `research/runs/<baseline-visual-id>/run.json`
- Create: `research/runs/<baseline-visual-id>/rendered/source-overview.png`
- Create: `research/runs/<baseline-visual-id>/rendered/sanitized-overview.png`
- Create: `research/runs/<baseline-visual-id>/rendered/wireframe-overview.png`
- Create: `research/runs/<baseline-visual-id>/geometry-report.json`
- Promote approved images to: `public/assets/study/geometry/`
- Modify: `research/asset-manifest.json`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`, `tests/e2e/showcase.spec.ts`

**Steps:**

1. Reuse the existing fixed render harness and one camera for source, sanitized, shaded, and wireframe views.
2. Capture a raw-source screenshot for evidence. Before public promotion, inspect it for the plate and steering emblem governed by the upstream mark notice. If a mark is visible, keep the raw frame in research evidence and publish the sanitized overview instead—do not silently retouch and call it raw.
3. Add a public “Why this asset” block sourced from `research/asset-candidates.md`:
   - named hierarchy and separable parts;
   - three supplied variants plus the project-authored Estuary finish;
   - KTX2 textures and browser-ready glTF;
   - enough complexity to expose real optimization tradeoffs;
   - licensing/mark-removal caveat.
4. Add an honest geometry-quality panel with exact current metrics:
   - 213,195 triangles;
   - 639,585 render vertices/pass;
   - 162,646 uploaded vertices;
   - 107 primitives;
   - 28 baseline materials, 14 embedded KTX2 images, no animation/rig;
   - dimensions 2.542321 × 1.148896 × 4.357386 metres.
5. Add wireframe/detail callouts for the wipers, wheels/brakes, panel seams, mirrors, interior, and glass. Explain where density is justified versus likely reducible.

**Validation:**

- Hash all captures and register promoted images.
- Visually inspect every public image.
- Browser-test image decoding and exact natural dimensions on desktop and mobile.
- Verify no public text confuses render vertices, uploaded vertices, triangles, primitives, or draw calls.

---

## Phase 2: Astra geometry and optimization bake-off

### Task 3: Preflight a geometry-capable tool environment

**Objective:** Ensure the scored Astra session has a real, reproducible geometry toolchain before timing starts.

**Files:**
- Create: `research/tooling/geometry-environment.md`
- Create: `scripts/preflight-geometry-tools.mjs`
- Test: `scripts/preflight-geometry-tools.test.mjs`

**Steps:**

1. Probe Blender CLI/`bpy`, `gltfpack`/meshoptimizer, glTF Transform, Khronos validator availability, and whether Astra’s actual terminal backend can access `/workspace`.
2. Prefer a pinned container/tool version rather than installing mutable global tools during the scored run.
3. If Blender remains unavailable, choose explicitly:
   - proceed with a **WebGL optimization** run using deterministic glTF/meshoptimizer tooling; or
   - pause the **geometry authoring** claim until a Blender-capable environment exists.
4. Do not describe compression, quantization, material merging, or runtime LOD configuration as geometry authored directly by Astra unless Astra actually produced the corresponding transformation/code.

**Verification:**

```bash
node scripts/preflight-geometry-tools.mjs
```

Expected: one machine-readable capability report and a clear go/no-go result.

### Task 4: Run Astra Safe WebGL optimization

**Objective:** Measure Astra’s ability to diagnose and safely optimize the current selected model.

**Files:**
- Create isolated run: `research/runs/<astra-safe-optimization-id>/`
- Required outputs: `prompt.md`, `notes.md`, `run.json`, transformation scripts, editable source where applicable, `candidate.glb`, `geometry-report.json`, command log, environment record, private `session.jsonl`, and public transcript hash.

**Frozen prompt requirements:**

- Inspect first and rank likely bottlenecks before modifying anything.
- Produce a deterministic candidate from `public/assets/models/product-estuary.glb`.
- Preserve all four variants and exact history-independent mappings.
- Preserve geometry names/hierarchy where needed by configuration and inspection.
- Optimize only where measurements justify it.
- Explain each transformation: deduplication, quantization, mesh compression, simplification, primitive/material merging, texture changes, or runtime behavior.
- Do not overwrite source or public assets.
- Run twice and compare output hashes.

**Candidate review:**

- Independently parse source and candidate.
- Deep-compare protected semantics.
- Reject hidden runtime-only workarounds that merely hide broken content.
- Capture fixed shaded and wireframe side-by-sides.

### Task 5: Run Astra Mobile LOD optimization

**Objective:** Test a more aggressive, explicitly lower-fidelity optimization target without contaminating the safe candidate.

**Files:**
- Create isolated run: `research/runs/<astra-mobile-lod-id>/`
- Same evidence set as Task 4.

**Rules:**

- Start again from the pinned Estuary input, not the safe candidate.
- Use a separate Astra session and prompt.
- Keep silhouette, wheel circularity, mirrors, lamps, panel boundaries, and primary interior forms readable at 390×844.
- Aggressively target low-value hidden/high-frequency geometry only after reporting it.
- Treat wiper simplification, unseen underside/interior reduction, and duplicated vertex/layout cleanup as hypotheses to test—not predetermined edits.

### Task 6: Compare source, safe, and mobile candidates

**Objective:** Select based on evidence rather than file-size reduction alone.

**Files:**
- Create: `research/runs/<sol-geometry-comparison-id>/comparison-manifest.json`
- Create: `research/runs/<sol-geometry-comparison-id>/metrics.json`
- Create: `research/runs/<sol-geometry-comparison-id>/rendered/`
- Create: `research/runs/<sol-geometry-comparison-id>/decision.json`
- Modify after decision only: `public/assets/models/` and `research/asset-manifest.json`

**Comparison matrix:**

- Source/sanitized control, safe candidate, mobile candidate.
- Identical Estuary and at least one supplied finish.
- Front/rear/side three-quarter, wheel/brake, mirror, wipers, panel seams, interior, and glass.
- Shaded, silhouette/difference, and wireframe panels.
- Desktop Chrome on Rivendell and a real mobile device where practical; software Chromium remains reproducibility evidence, not end-user GPU evidence.
- Cold load/compile separated from warmed frame timing.
- Repeat samples, p50/p95, renderer/GPU, viewport, DPR, and sample count.

**Decision rule:**

- Promote **safe** only if it improves a named metric and passes visual/semantic gates.
- Add **mobile LOD** only if the runtime has a tested selection policy and the real mobile result justifies the complexity.
- It is acceptable—and valuable—to conclude that geometry optimization is not the limiting factor.

---

## Phase 3: Expand to a second model

### Task 7: Generalize the workflow before selecting the model

**Objective:** Remove CarConcept-specific assumptions so the second asset tests repeatability rather than bespoke code.

**Likely files:**
- Create: `research/protocols/asset-onboarding-v1.md`
- Create: `scripts/inspect-model.mjs`
- Create: `scripts/build-public-derivative.mjs`
- Create: `scripts/validate-model-package.mjs`
- Modify: `src/lib/threeViewer.ts` only if model configuration requires a data-driven adapter.
- Create: `src/lib/modelCatalog.ts`
- Test corresponding scripts and viewer behavior.

**Generalization requirements:**

- Manifest-driven model path, camera framing, variants, configurable surfaces, attribution, and mark-removal rules.
- No hard-coded CarConcept node/material names in reusable validators.
- Exact source/derivative lineage and licensing per model.
- Isolated work packages per capability.

### Task 8: Select one structurally different second asset

**Objective:** Test whether the workflow generalizes beyond automotive geometry.

**Selection criteria:**

- permissive, explicit redistribution license;
- immutable downloadable source;
- no avoidable trademark or personality-rights risk;
- real UVs/textures and separable meaningful parts;
- approximately 100k–500k triangles before optimization;
- enough material/geometry complexity to be interesting;
- no dependency on proprietary DCC files for basic reproduction.

**Recommendation:** Prefer a furniture, footwear, appliance, or industrial-product asset rather than another car. `MaterialsVariantsShoe` is a useful compact control but may be too simple for the hero second case; score it against at least two more complex non-automotive candidates before deciding.

**Stop condition:** Do not integrate the second model until its license, source hash, baseline inspection, and public derivative all pass independently.

---

## Phase 4: Structure-grounded photoreal AI renders

### Task 9: Freeze the external-generation protocol

**Objective:** Generate slick imagery without misrepresenting 2D generation as 3D or geometry quality.

**Files:**
- Create: `research/protocols/photoreal-generation-v1.md`
- Create: `research/runs/<generation-id>/prompt.md`
- Create: `research/runs/<generation-id>/conditioning/`
- Create: `research/runs/<generation-id>/outputs/`
- Create: `research/runs/<generation-id>/selection.json`

**Conditioning package:**

- deterministic beauty render;
- transparent/object mask;
- depth map;
- normal pass;
- optional material/part segmentation;
- fixed camera metadata;
- exact Estuary color/material reference;
- negative constraints for logo invention, changed wheel count, altered window/door topology, fake text, and unsupported details.

**Generation rules:**

- Use image-to-image or structure controls with conservative denoise/strength first.
- Keep the exact generator/model/version, seed where supported, prompt, settings, input hashes, time, and cost.
- Label outputs `astra_orchestrated_external` only if Astra actually invokes/directs the specialist generator; otherwise use the applicable Sol/non-Astra external lane.
- Never use generated images as evidence of mesh quality, material correctness, or configurator performance.
- Preserve failed/inconsistent outputs and cap correction rounds.

### Task 10: Evaluate photoreal identity consistency

**Objective:** Select images that remain recognizably grounded in the 3D model.

**Checks:**

- silhouette and proportions;
- wheel count, placement, and design;
- windshield/roof/door/panel seams;
- mirror and lamp placement;
- Estuary two-tone treatment;
- absence of invented marks/text;
- consistency across multiple views.

Use a blind review with at least:

1. direct WebGL render;
2. conventional enhanced/graded render if available;
3. AI-generated photoreal interpretation.

Ask separately about attractiveness, realism, faithfulness to the model, and usefulness for marketing. Do not collapse these into one “best” score.

---

## Phase 5: Publish comparisons that teach something

### Task 11: Build evidence-first side-by-sides

**Objective:** Make the strongest findings visually obvious while preserving technical context.

**Recommended comparisons:**

1. **Asset lineage:** upstream source → sanitized web baseline → Estuary integration → optimized candidate.
2. **Geometry:** shaded + wireframe source/safe/mobile at the same camera, with exact triangles/bytes beneath each.
3. **Detail retention:** wheels/brakes, wipers, mirrors, panel seams, interior, and glass as synchronized crops.
4. **Performance:** size, load-to-first-frame, cold compile, programs/primitives, and warmed frame timing; volume and quality must use separate visual channels.
5. **Material decision:** Estuary vs Fjord blind images plus the pre-reveal preference and reveal mapping.
6. **Rendering ladder:** raw WebGL → controlled browser render → photoreal AI interpretation, each with an explicit provenance badge.
7. **Cross-asset repeatability:** CarConcept and the second model using the same inspection/optimization report format.

**Public UI files likely to change:**

- `src/App.tsx`
- `src/styles.css`
- `src/generated/study-data.json`
- new components under `src/components/`, such as `GeometryComparison.tsx` and `RenderProvenanceBadge.tsx`
- `research/asset-manifest.json`
- new run records and public images

**Presentation rule:** Lead with the decision (“what improved, what did not, and what we recommend”), then disclose metrics and provenance. Do not present an aggressive LOD as universally better because it is smaller.

---

## Global verification gate

After every completed work package:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Also require:

- exact input/output hashes and byte counts;
- clean-checkout public deployment build via `npm run build:app`;
- private session evidence verification for any Astra claim;
- independent fail-closed review;
- real desktop/mobile visual checks;
- no stale pending/current-status contradictions;
- no automatic promotion of candidates before Jay’s review.

## Risks and tradeoffs

- **Optimization can reduce quality without improving the real bottleneck.** Profile first and keep the original model selectable throughout the experiment.
- **Blender availability is a hard capability boundary.** Compression scripts can test optimization skill, but not full DCC geometry craftsmanship.
- **AI renders can invent geometry.** They are marketing interpretations conditioned on 3D evidence, not faithful alternate renders unless consistency checks support that claim.
- **A second model can dilute the case study.** Add it only after the first optimization protocol is reusable and stable.
- **More comparison views can overwhelm the page.** Publish a decision-first summary with expandable detail rather than one enormous gallery.
- **Raw-source screenshots may expose retained marks.** Review against upstream notices before public promotion; evidence may remain private while the sanitized view is public.

## Open decisions before execution

1. Should the geometry-capable environment use a pinned Blender container, a host Blender install, or a deterministic non-Blender optimization toolchain first?
2. Which real devices should be named performance targets? Recommended minimum: Rivendell Chrome plus one real phone.
3. Is the desired mobile LOD selected automatically by capability/network, or exposed only as a comparison artifact initially? Recommended: comparison artifact first.
4. Which image generator is approved, and what budget/correction cap applies?
5. Does Jay want a second hero configurator or a smaller repeatability case? Recommended: smaller repeatability case until the generalized adapter is proven.
