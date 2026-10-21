# Astra 3D Benchmark Showcase Implementation Plan

> **For Hermes:** Use subagent-driven development to implement this plan task-by-task. Use `grounded-citations` for asset/license research and the final findings, and strict TDD for application behavior.

**Goal:** Build a reproducible, source-backed public webpage that demonstrates and evaluates Astra on a realistic 3D product-content workflow: pre-rendered imagery, a browser-based real-time configurator, and a documented future path for streamed Unity/Unreal content.

**Architecture:** Build a static Vite + React + TypeScript site with a Three.js WebGL2 configurator, deployable without a backend. Keep research evidence outside the presentation layer in versioned `research/` records; generate the small browser-facing study index from validated records so the site cannot silently diverge from the experiment log. Use one licensed, unbranded concept-car asset as the primary candidate, one fallback/control asset, and separate sourced work from Astra-authored work in every result.

**Tech stack:** Node.js 22, npm, Vite, React, TypeScript, Three.js, Vitest, Testing Library, Playwright, Ajv, `@gltf-transform/cli`, Blender CLI, Git LFS if binary assets are committed.

---

## Current context / assumptions

- The workspace currently contains only `IDEA.md`; there is no package, Git repository, or existing application to preserve.
- The workspace root is `/workspace` in the execution environment. All paths below are relative to that root.
- “Astra” means the model/agent being benchmarked. Record the exact model identifier, provider, interface, reasoning mode, tool access, and date in every run; do not label work merely “Astra” without this metadata.
- Phase 1 includes:
  1. a gallery of offline Blender renders;
  2. one real-time Three.js product configurator;
  3. methods, run history, failures, findings, and attribution.
- Phase 1 does **not** implement Unity/Unreal streaming. It includes a clearly marked deferred card and an architecture decision record only.
- Start with WebGL2. A later experiment may swap to Three.js `WebGPURenderer`, but WebGPU is not needed to answer the first benchmark questions and would add a second variable.
- Do not begin with a branded production car. Use an unbranded, permissively licensed concept/test asset to avoid trademark, redistribution, and provenance ambiguity.
- Primary candidate to validate: Khronos glTF Sample Assets `CarConcept`, because its official description says it is an automotive concept asset with material variants: <https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/CarConcept/README.md>.
- Fallback/control candidates to validate:
  - `ToyCar`, a CC0 sample exercising clearcoat, transmission, and sheen: <https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/ToyCar/README.md>.
  - `MaterialsVariantsShoe`, a CC BY 4.0 product with three built-in variants: <https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/MaterialsVariantsShoe/README.md>.
- Poly Haven may supply CC0 HDRIs and surface textures, but every downloaded item still needs URL, license, timestamp, and SHA-256 recorded: <https://polyhaven.com/license>.
- Official Astra examples show a sensible mixed workflow: editable Blender source, scripted/rendered review, exported runtime assets, and browser/engine integration. Treat those examples as hypotheses to test, not proof that this project will achieve the same result:
  - <https://developers.openai.com/blog/how-to-build-games-with-astra.md>
  - <https://developers.openai.com/blog/architectural-visualization-with-astra.md>

## Recommended benchmark framing

Do **not** ask one vague question such as “Can Astra make 3D?” Run five bounded work packages against the same product brief:

1. **Inspect:** inventory meshes, materials, textures, dimensions, cameras, animation, extensions, and web risks in a sourced asset.
2. **Author appearance:** create three product finishes from a fixed material brief and preserve named, editable material slots.
3. **Author geometry:** create one modest, separable accessory or presentation component, such as a display plinth or roof module; do not ask for an entire photoreal car from scratch in the first study.
4. **Produce imagery:** create one studio setup and one lifestyle setup, then render a fixed shot list.
5. **Integrate:** prepare/optimize the asset and build the real-time configurator with controls, fallback states, accessibility, and measurements.

Use three clearly labeled provenance lanes:

- **Sourced baseline:** downloaded geometry/materials used unchanged except for conversion and optimization.
- **Astra-authored:** geometry, scripts, materials, lighting, or code created directly by Astra using local tools.
- **Astra-orchestrated external generation:** output from a dedicated image/texture/3D service called by Astra. Keep this optional and report the external model, cost, and terms separately; never call it “Astra alone.”

This mix is stronger than either extreme. A sourced primary asset makes the web and render tasks comparable and reproducible; Astra-authored materials, accessory geometry, render setups, and integration still test substantive 3D work. An all-generated hero car would confound agent skill, generator skill, topology cleanup, and art direction in one result.

## Success criteria

- One primary asset and one control/fallback are selected using a published scorecard and verified license evidence.
- Every external asset has source URL, immutable revision or download URL, license, author/credit, retrieval timestamp, byte count, and SHA-256.
- Every Astra run has complete inputs, exact prompt, environment, tool access, outputs, elapsed time, estimated cost if available, human interventions, outcome, and failure notes.
- The repository preserves failures as records; failed binary outputs may be omitted only when the run record explains why and retains useful logs/screenshots.
- The gallery contains at least six reproducible renders from a fixed shot list: three studio and three lifestyle/configuration images.
- The configurator supports orbit/zoom, three body finishes, two wheel/trim choices if the asset supports separable slots, reset, loading progress, and an actionable error state.
- The production GLB passes inspection with no critical validation errors, is at most 15 MB initially, and records triangle, draw-call/material, texture, and file-size metrics.
- Playwright passes on Chromium and WebKit at desktop and mobile viewport sizes with no uncaught page errors.
- On the named benchmark machine, the configurator records median load-to-first-frame, steady-state FPS, and renderer/backend. Do not invent universal performance claims from one machine.
- Methods, findings, limitations, attribution, and “what failed” are visible on the public page.

---

## Target repository layout

```text
.
├── .github/workflows/ci.yml
├── .hermes/plans/
├── docs/decisions/
│   ├── 0001-webgl-first.md
│   └── 0002-streaming-deferred.md
├── licenses/
│   └── THIRD_PARTY_ASSETS.md
├── public/assets/
│   ├── images/
│   └── models/
├── research/
│   ├── asset-candidates.md
│   ├── asset-manifest.json
│   ├── findings.md
│   ├── protocol.md
│   ├── schemas/
│   │   ├── asset-manifest.schema.json
│   │   └── run.schema.json
│   └── runs/
│       ├── README.md
│       └── 2026-10-20-baseline-smoke/
│           ├── prompt.md
│           ├── notes.md
│           └── run.json
├── scripts/
│   ├── build-study-data.mjs
│   ├── fetch-asset.mjs
│   └── validate-research.mjs
├── src/
│   ├── components/
│   │   ├── Configurator.tsx
│   │   ├── Gallery.tsx
│   │   ├── ResearchSummary.tsx
│   │   └── StatusCard.tsx
│   ├── generated/study-data.json
│   ├── lib/
│   │   ├── configuration.ts
│   │   └── metrics.ts
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── tests/e2e/showcase.spec.ts
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

# Step-by-step tasks

## Phase A — Freeze the study before building the showcase

### Task 1: Initialize the repository and application shell

**Objective:** Create a reproducible Vite/React/TypeScript project with test tooling before production code.

**Files:**
- Create: the Vite scaffold at repository root
- Create: `src/App.test.tsx`
- Modify: `package.json`

**Steps:**

1. Confirm prerequisites:

   ```bash
   node --version
   npm --version
   git --version
   blender --version || true
   ```

   Expected: Node `v22.x` or newer, npm and Git versions printed. Blender may be absent; if so, record it as a setup blocker before the render phase rather than hiding it.

2. Initialize Git and scaffold the app:

   ```bash
   git init
   npm create vite@latest . -- --template react-ts
   npm install
   npm install three ajv
   npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @types/three @gltf-transform/cli
   npx playwright install chromium webkit
   ```

   Expected: dependency install exits `0`; `package.json` contains React, Three.js, Vitest, Playwright, Ajv, and glTF Transform dependencies.

3. Add scripts to `package.json`:

   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "npm run research:validate && tsc -b && vite build",
       "lint": "eslint .",
       "test": "vitest run",
       "test:watch": "vitest",
       "test:e2e": "playwright test",
       "research:build": "node scripts/build-study-data.mjs",
       "research:validate": "node scripts/validate-research.mjs",
       "asset:inspect": "gltf-transform inspect public/assets/models/product.glb"
     }
   }
   ```

4. Write `src/App.test.tsx` first:

   ```tsx
   import { render, screen } from '@testing-library/react';
   import { describe, expect, it } from 'vitest';
   import App from './App';

   describe('App', () => {
     it('identifies the page as an Astra 3D benchmark', () => {
       render(<App />);
       expect(screen.getByRole('heading', { level: 1, name: /Astra 3D benchmark/i })).toBeInTheDocument();
     });
   });
   ```

5. Run RED:

   ```bash
   npm test -- --run src/App.test.tsx
   ```

   Expected: FAIL because the scaffold heading does not say “Astra 3D benchmark”.

6. Replace `src/App.tsx` with the minimal passing shell:

   ```tsx
   export default function App() {
     return (
       <main>
         <h1>Astra 3D benchmark</h1>
       </main>
     );
   }
   ```

7. Run GREEN and full checks:

   ```bash
   npm test -- --run src/App.test.tsx
   npm run build
   ```

   Expected: one passing test and a successful Vite production build.

8. Commit:

   ```bash
   git add .
   git commit -m "chore: scaffold Astra 3D benchmark site"
   ```

### Task 2: Write the benchmark protocol

**Objective:** Freeze questions, prompts, scoring, interventions, and stopping rules before running Astra.

**Files:**
- Create: `research/protocol.md`
- Create: `docs/decisions/0001-webgl-first.md`
- Create: `docs/decisions/0002-streaming-deferred.md`

**Required content for `research/protocol.md`:**

```markdown
# Astra 3D Benchmark Protocol

## Research questions
1. Can Astra correctly inspect and explain an unfamiliar production-style 3D asset?
2. Can Astra author editable, technically valid material variants from a fixed brief?
3. Can Astra add modest geometry without damaging naming, scale, normals, UVs, or separability?
4. Can Astra produce reproducible studio and lifestyle renders from a fixed shot list?
5. Can Astra optimize and integrate the asset into an accessible, performant browser configurator?

## Fixed inputs
- Primary asset: pending scorecard decision
- Control asset: pending scorecard decision
- Target delivery: static website, Three.js WebGL2
- Viewports: 1440×900 desktop and 390×844 mobile
- Image outputs: 2400×1600 PNG masters plus web derivatives

## Allowed tools
Record, per run, every tool Astra can use. A run is invalid if tool access is unknown.

## Intervention levels
- 0: prompt only
- 1: clarification without solution
- 2: explicit diagnosis or requested correction
- 3: human edits the output
- 4: human replaces the approach

## Outcome labels
- pass
- pass_with_intervention
- partial
- fail
- blocked

## Scoring rubric (0–4 each)
- requirement completion
- visual fidelity
- technical validity
- editability
- runtime performance
- reproducibility
- provenance completeness

## Stopping rules
- Maximum three correction rounds per work package.
- Stop immediately on license uncertainty, destructive overwrite without backup, repeated invalid output, or undisclosed external generation.
- Preserve the last useful output and document the stop reason.
```

**Verification:**

```bash
test -s research/protocol.md
grep -q "Maximum three correction rounds" research/protocol.md
grep -q "WebGL2" docs/decisions/0001-webgl-first.md
grep -q "deferred" docs/decisions/0002-streaming-deferred.md
```

Expected: exit code `0` for all commands.

**Commit:**

```bash
git add research/protocol.md docs/decisions
 git commit -m "docs: freeze 3D benchmark protocol and scope"
```

### Task 3: Define machine-valid research records

**Objective:** Make missing provenance and incomplete run metadata fail validation.

**Files:**
- Create: `research/schemas/asset-manifest.schema.json`
- Create: `research/schemas/run.schema.json`
- Create: `research/asset-manifest.json`
- Create: `research/runs/README.md`
- Create: `scripts/validate-research.mjs`
- Test: `scripts/validate-research.test.mjs`

**Required asset fields:** `id`, `title`, `kind`, `sourceUrl`, `immutableUrl`, `author`, `license`, `licenseUrl`, `retrievedAt`, `bytes`, `sha256`, `localPath`, `status`.

**Required run fields:** `id`, `title`, `startedAt`, `endedAt`, `model`, `provider`, `interface`, `reasoningMode`, `tools`, `workPackage`, `inputAssets`, `promptPath`, `outputPaths`, `elapsedSeconds`, `cost`, `interventionLevel`, `outcome`, `failureNotes`, `reviewer`.

1. Write a test that creates a temporary run record without `model`, invokes `scripts/validate-research.mjs`, and expects a non-zero exit code containing `/model`.
2. Run RED:

   ```bash
   node --test scripts/validate-research.test.mjs
   ```

   Expected: FAIL because the validator does not exist.

3. Implement the validator with Ajv. It must:
   - validate `research/asset-manifest.json`;
   - recursively find `research/runs/*/run.json`;
   - reject unknown outcome labels;
   - verify every declared `promptPath` exists;
   - verify every local asset marked `available` exists;
   - print `Research validation passed: X assets, Y runs` on success.

4. Run GREEN:

   ```bash
   node --test scripts/validate-research.test.mjs
   npm run research:validate
   ```

   Expected: test PASS and `Research validation passed: 0 assets, 0 runs` for the initial empty records.

5. Commit:

   ```bash
   git add research scripts package.json
   git commit -m "feat: validate asset provenance and benchmark runs"
   ```

### Task 4: Research and select the primary asset

**Objective:** Choose one primary and one control asset from official sources without downloading unverified binaries into the application.

**Files:**
- Create: `research/asset-candidates.md`
- Modify: `research/asset-manifest.json`
- Create or modify: `licenses/THIRD_PARTY_ASSETS.md`

**Scorecard:** Score each candidate 0–4 and multiply by the listed weight.

| Criterion | Weight |
|---|---:|
| License clarity and redistribution rights | 20 |
| Named/separable configurable parts or variants | 20 |
| Visual/product relevance | 15 |
| Web-ready format and extension support | 15 |
| Realistic company workflow | 15 |
| Optimization headroom | 10 |
| Low trademark/brand risk | 5 |

**Procedure:**

1. Evaluate `CarConcept`, `ToyCar`, and `MaterialsVariantsShoe` with the same table and source template.
2. For each candidate, save:
   - official repository page;
   - license page/file;
   - available source and runtime formats;
   - whether the Blender/source file exists;
   - named material/mesh/variant inventory if published;
   - binary size;
   - known extension requirements.
3. Prefer `CarConcept` if its license and downloadable source/runtime files validate and its variant structure is usable. Select `ToyCar` as the car-shaped control. Use the shoe only if the car assets fail the configurability gate.
4. State the decision and rejected alternatives in `research/asset-candidates.md`; do not erase rejected candidates.
5. Record exact credits in `licenses/THIRD_PARTY_ASSETS.md`.

**Verification:**

```bash
npm run research:validate
grep -q "Decision" research/asset-candidates.md
grep -q "CarConcept" research/asset-candidates.md
grep -q "ToyCar" research/asset-candidates.md
grep -q "MaterialsVariantsShoe" research/asset-candidates.md
```

Expected: validation passes and all candidates remain documented.

**Commit:**

```bash
git add research licenses
 git commit -m "docs: select licensed benchmark assets"
```

### Task 5: Implement reproducible asset acquisition

**Objective:** Download from an immutable URL, verify bytes/hash, and refuse silent source drift.

**Files:**
- Create: `scripts/fetch-asset.mjs`
- Test: `scripts/fetch-asset.test.mjs`
- Modify: `research/asset-manifest.json`

**Behavior:** `node scripts/fetch-asset.mjs <asset-id>` reads the manifest, downloads to a temporary file, calculates SHA-256, compares it with the manifest, then atomically writes `localPath`. It must fail before writing when the hash differs.

**TDD cycle:**

1. Test a local HTTP fixture whose bytes do not match the manifest and assert:
   - exit is non-zero;
   - stderr includes `SHA-256 mismatch`;
   - destination does not exist.
2. Run RED:

   ```bash
   node --test scripts/fetch-asset.test.mjs
   ```

   Expected: FAIL because the fetcher does not exist.
3. Implement the behavior using Node built-ins only (`fetch`, `crypto`, `fs/promises`).
4. Run GREEN:

   ```bash
   node --test scripts/fetch-asset.test.mjs
   node scripts/fetch-asset.mjs primary-product
   sha256sum public/assets/models/source-product.glb
   ```

   Expected: test PASS; downloaded hash exactly equals `research/asset-manifest.json`.
5. Inspect the asset:

   ```bash
   npm exec gltf-transform inspect public/assets/models/source-product.glb
   ```

   Expected: a printed scene/mesh/material/texture inventory and no unreadable-file error. Save relevant metrics into the manifest or `research/asset-candidates.md`.
6. If the binary is committed and exceeds normal Git comfort, enable Git LFS only for `.glb`, `.blend`, and render masters; do not LFS JSON, markdown, or web images.
7. Commit:

   ```bash
   git add scripts research public/assets/models licenses .gitattributes
   git commit -m "feat: add verified benchmark asset acquisition"
   ```

## Phase B — Establish the baseline and run Astra

### Task 6: Create a baseline smoke run

**Objective:** Prove the run-record workflow before spending time on creative work.

**Files:**
- Create: `research/runs/2026-10-20-baseline-smoke/prompt.md`
- Create: `research/runs/2026-10-20-baseline-smoke/notes.md`
- Create: `research/runs/2026-10-20-baseline-smoke/run.json`

**Prompt:** Ask Astra only to inspect the primary GLB and return a structured inventory; forbid edits and forbid external generation.

**Required review checks:** Compare Astra’s reported scene count, meshes/primitives, materials, textures, dimensions, animation, and extensions against `gltf-transform inspect` and Blender’s scene statistics. Mark every incorrect item in `notes.md`.

**Verification:**

```bash
npm run research:validate
jq -e '.outcome | IN("pass", "pass_with_intervention", "partial", "fail", "blocked")' research/runs/2026-10-20-baseline-smoke/run.json
```

Expected: validation passes and `jq` prints `true`.

**Commit:**

```bash
git add research/runs/2026-10-20-baseline-smoke
 git commit -m "research: record baseline asset inspection run"
```

### Task 7: Run the material-authoring benchmark

**Objective:** Test material reasoning without changing geometry.

**Files:**
- Create: `research/briefs/materials.md`
- Create: one directory per attempt under `research/runs/`
- Produce: `work/materials/<run-id>/product.blend`
- Produce: `work/materials/<run-id>/material-preview.png`

**Fixed brief:** Three finishes on the same body slot:

- `oxide-red`: deep warm red metallic paint, clearcoat, medium orange-peel roughness;
- `graphite`: near-black neutral metallic paint, tighter roughness, no crushed reflections;
- `pearl-white`: warm white multilayer finish, subtle pearl response, no emissive cheat.

Trim, glass, tires, and lights must remain unchanged. All materials must be named and editable. If textures are generated or downloaded, record their provenance and tool/model.

**Validation commands:**

```bash
blender -b work/materials/<run-id>/product.blend --python scripts/blender/validate_scene.py
npm exec gltf-transform inspect work/materials/<run-id>/product.glb
```

Expected: validator reports three named body finishes, no missing textures, finite dimensions, outward/consistent normals where testable, and no geometry count change from the approved baseline.

**Commit:** Commit prompts, records, validation script, and approved small deliverables. Do not commit unneeded caches.

### Task 8: Run the modest geometry-authoring benchmark

**Objective:** Test geometry generation/editing without letting the task balloon into whole-car generation.

**Files:**
- Create: `research/briefs/accessory.md`
- Create: run directories and records under `research/runs/`
- Produce: a separable named object in the Blender source and export

**Brief constraints:** Create a simple product-display plinth or one separable accessory. It must have real-world dimensions, clean normals, sensible pivot/origin, no non-manifold geometry unless explicitly justified, one named material, and a stated triangle budget.

**Stopping condition:** After three correction rounds, preserve the result and score it; do not silently hand-fix it into a pass.

**Verification:** Extend `scripts/blender/validate_scene.py` test-first to reject an intentionally malformed fixture, then validate the candidate. Expected: the approved object is separable, dimensionally plausible, and within budget.

**Commit:**

```bash
git add research scripts/blender work/<approved-small-artifacts>
 git commit -m "research: record Astra geometry authoring benchmark"
```

### Task 9: Create the reproducible render pipeline

**Objective:** Generate fixed studio and lifestyle shots from Blender rather than hand-saving screenshots.

**Files:**
- Create: `scripts/blender/render_shots.py`
- Create: `research/briefs/render-shot-list.md`
- Test: `scripts/blender/tests/test_render_shots.py`
- Produce: `public/assets/images/*.webp`
- Preserve masters outside the web bundle or with Git LFS: `work/renders/masters/*.png`

**Shot list:**

1. studio-front-three-quarter;
2. studio-rear-three-quarter;
3. studio-detail;
4. lifestyle-day;
5. lifestyle-dusk;
6. lifestyle-material-comparison.

Every shot specifies camera name, focal length, resolution, color transform, samples, lighting source, finish, and seed where applicable.

**TDD cycle:**

1. Create a tiny `.blend` fixture with no required camera and assert the script exits non-zero naming the missing camera.
2. Run RED with Blender background Python tests.
3. Implement the minimal named-camera and output-path logic.
4. Run GREEN on the fixture.
5. Render one low-sample smoke frame and verify it is a non-empty image of exact dimensions.
6. Render finals only after smoke passes; save render duration and Blender version in the run record.

**Verification:**

```bash
identify public/assets/images/*.webp
```

Expected: exactly six web images, all decodable, with documented dimensions. If ImageMagick is unavailable, use a Node image metadata script and test it.

**Commit:**

```bash
git add scripts research public/assets/images
 git commit -m "feat: add reproducible benchmark render gallery"
```

### Task 10: Optimize and validate the runtime asset

**Objective:** Produce `public/assets/models/product.glb` without overwriting the source or losing required material slots.

**Files:**
- Create: `scripts/optimize-model.mjs`
- Test: `scripts/optimize-model.test.mjs`
- Produce: `public/assets/models/product.glb`
- Modify: `research/asset-manifest.json`

**Behavior:** Copy from the approved export, run deterministic glTF Transform operations, preserve required names, and emit before/after metrics plus SHA-256. Start with deduplication, pruning, texture resizing/compression, and mesh compression only when the target browsers decode it successfully.

**TDD cycle:**

1. Test that the script refuses to use the same input and output path.
2. Run RED.
3. Implement the guard and metrics record.
4. Run GREEN.
5. Optimize a copy and inspect both source and output.

**Verification:**

```bash
npm exec gltf-transform inspect work/approved/product.glb > /tmp/source-inspect.txt
npm exec gltf-transform inspect public/assets/models/product.glb > /tmp/runtime-inspect.txt
npm run research:validate
npm run asset:inspect
```

Expected: output is at most 15 MB, required mesh/material names remain, no critical errors, and provenance points from runtime file to approved source and optimization command.

**Commit:**

```bash
git add scripts research public/assets/models/product.glb
 git commit -m "feat: add validated web runtime asset"
```

## Phase C — Build the public showcase

### Task 11: Add the page information architecture

**Objective:** Present outputs first, then methods and evidence, without turning the site into a generic AI landing page.

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`
- Create: `src/components/StatusCard.tsx`

**Required section order:**

1. concise benchmark title and current verdict/status;
2. rendered gallery;
3. live configurator;
4. what Astra did vs what was sourced;
5. methods and scoring;
6. run log, failures, and findings;
7. deferred streaming track;
8. credits/licenses.

**Design constraints:** Neutral editorial/product-visualization aesthetic; no fake terminal chrome, neon gradients, excessive glassmorphism, autoplay audio, scroll hijacking, or claims unsupported by run records.

**TDD cycle:**

1. Add tests for the section headings and a visible “Deferred” label on streaming.
2. Run RED.
3. Implement semantic sections with anchor navigation and `StatusCard`.
4. Run GREEN and the full test suite.
5. Commit:

   ```bash
   git add src
   git commit -m "feat: add benchmark showcase structure"
   ```

### Task 12: Add the responsive render gallery

**Objective:** Show the six fixed outputs with configuration and provenance captions.

**Files:**
- Create: `src/components/Gallery.tsx`
- Create: `src/components/Gallery.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**TDD cycle:**

1. Test that each gallery item exposes:
   - descriptive alt text;
   - shot/configuration label;
   - provenance label (`Astra-authored`, `sourced`, or `mixed`);
   - width and height to prevent layout shift.
2. Run RED.
3. Implement with native `<figure>`, `<picture>`, `<img loading="lazy">`, and `<figcaption>`.
4. Run GREEN.
5. Verify keyboard focus and 390 px layout in Playwright.
6. Commit.

### Task 13: Implement configuration state as pure tested logic

**Objective:** Keep product options and reset behavior independent of Three.js rendering.

**Files:**
- Create: `src/lib/configuration.ts`
- Create: `src/lib/configuration.test.ts`

**Complete initial interface:**

```ts
export const finishes = ['oxide-red', 'graphite', 'pearl-white'] as const;
export const trims = ['bright', 'dark'] as const;

export type Finish = (typeof finishes)[number];
export type Trim = (typeof trims)[number];

export type ProductConfiguration = {
  finish: Finish;
  trim: Trim;
};

export const defaultConfiguration: ProductConfiguration = {
  finish: 'oxide-red',
  trim: 'bright',
};

export function resetConfiguration(): ProductConfiguration {
  return { ...defaultConfiguration };
}
```

**TDD cycle:**

1. Test accepted values, defaults, reset returning a fresh object, and parsing invalid URL query values back to defaults.
2. Run RED.
3. Implement only enough to pass.
4. Run GREEN and refactor once green.
5. Commit:

   ```bash
   git add src/lib
   git commit -m "feat: define tested product configuration state"
   ```

### Task 14: Build the Three.js configurator loader states

**Objective:** Load the GLB with progress, error, and disposal behavior before adding visual options.

**Files:**
- Create: `src/components/Configurator.tsx`
- Create: `src/components/Configurator.test.tsx`
- Modify: `src/App.tsx`

**TDD cycle:**

1. Test initial accessible status `Loading 3D model`, successful `3D model ready`, and an error message with a retry button. Mock the loader boundary, not Three.js internals.
2. Run RED.
3. Implement:
   - one canvas;
   - `WebGLRenderer` with capped device pixel ratio;
   - `GLTFLoader`;
   - orbit controls;
   - resize observer;
   - animation loop only while needed;
   - disposal of controls, renderer, geometries, materials, and textures on unmount;
   - a static poster/fallback when WebGL2 is unavailable.
4. Run GREEN.
5. Add a Playwright smoke assertion that the ready state appears and no page errors fire.
6. Commit.

### Task 15: Map material slots and add configurator controls

**Objective:** Apply finishes and trim choices by verified material/mesh names, never by fragile child index.

**Files:**
- Modify: `src/components/Configurator.tsx`
- Modify: `src/components/Configurator.test.tsx`
- Create: `src/data/material-map.ts`

**Implementation rule:** Generate `material-map.ts` from the approved asset inventory or copy verified exact names from the inventory. If required names are absent, show a visible configuration error; do not silently recolor the first mesh.

**TDD cycle:**

1. Test exact map resolution, missing-slot failure, finish selection, trim selection, reset, and URL query synchronization.
2. Run RED.
3. Implement controls as native radio groups and a reset button.
4. Run GREEN.
5. Playwright-test each control by asserting the selected label and screenshot change; use a deterministic camera and animation disabled in test mode.
6. Commit.

### Task 16: Capture honest runtime metrics

**Objective:** Record device-scoped load and rendering measurements without presenting them as universal claims.

**Files:**
- Create: `src/lib/metrics.ts`
- Create: `src/lib/metrics.test.ts`
- Modify: `src/components/Configurator.tsx`
- Modify: `src/components/ResearchSummary.tsx`

**Metrics:** model bytes, load-to-first-frame milliseconds, rolling median FPS after warmup, renderer backend/string, viewport, DPR, user agent, and timestamp. Keep measurements client-side unless the user later approves telemetry; allow copying/downloading JSON.

**TDD cycle:**

1. Test the median calculation with odd/even samples and rejection of non-finite values.
2. Run RED.
3. Implement pure calculation and a browser adapter.
4. Run GREEN.
5. Verify displayed text says “on this device” and does not claim global performance.
6. Commit.

### Task 17: Generate and render the study evidence index

**Objective:** Publish methods and run summaries from validated research records instead of duplicating claims in JSX.

**Files:**
- Create: `scripts/build-study-data.mjs`
- Create: `scripts/build-study-data.test.mjs`
- Generate: `src/generated/study-data.json`
- Create: `src/components/ResearchSummary.tsx`
- Create: `src/components/ResearchSummary.test.tsx`
- Modify: `src/App.tsx`

**Generated fields only:** run id/title, date, work package, model, tool list, intervention level, outcome, score summary, public failure note, and public output links. Exclude secrets, local absolute paths, hidden reasoning, tokens, and credentials.

**TDD cycle:**

1. Test deterministic sorting and secret-field rejection using fixtures.
2. Run RED.
3. Implement the generator.
4. Run GREEN twice and verify identical output hash:

   ```bash
   npm run research:build
   sha256sum src/generated/study-data.json
   npm run research:build
   sha256sum src/generated/study-data.json
   ```

   Expected: both hashes match.
5. Render a compact methods summary, outcome table, failure notes, and links to source prompts/records where publishable.
6. Commit.

### Task 18: Add credits, limitations, and findings

**Objective:** Make provenance and uncertainty as visible as visual output.

**Files:**
- Modify: `research/findings.md`
- Modify: `src/components/ResearchSummary.tsx`
- Modify: `src/App.test.tsx`
- Modify: `licenses/THIRD_PARTY_ASSETS.md`

**Required findings structure:**

```markdown
# Findings

## Decision summary
## What Astra completed reliably
## Where Astra needed intervention
## What failed
## Material authoring findings
## Geometry authoring findings
## Render-production findings
## Web-integration findings
## Time and cost
## Threats to validity
## Next experiment
```

Every external factual claim gets an inline citation and generated sources list during execution using the `grounded-citations` skill. Every benchmark claim must link to one or more run IDs. Clearly separate observation, interpretation, and open question.

**TDD cycle:** Add a UI test that “What failed,” “Threats to validity,” and credits are present; run RED; render them; run GREEN.

**Commit:**

```bash
git add research src licenses
 git commit -m "docs: publish grounded findings and limitations"
```

### Task 19: Add the streaming track as a deferred decision, not a stub integration

**Objective:** Preserve the roadmap without pretending the streaming demo exists.

**Files:**
- Modify: `docs/decisions/0002-streaming-deferred.md`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

**ADR must compare:**

- Unity Render Streaming/WebRTC;
- Unreal Pixel Streaming/WebRTC;
- managed GPU streaming provider;
- self-hosted GPU instance.

For each, record required GPU/runtime, session lifecycle, signaling/TURN, authentication, concurrency, cold-start, bandwidth, observability, cost model, and security. Define the later entry gate: a concrete interaction that browser Three.js cannot satisfy, a target concurrency, a budget, and an operator/hosting plan.

**Verification:** The site says `Deferred — not implemented` and contains no fake launch button, iframe, or inactive controls.

**Commit:**

```bash
git add docs/decisions/0002-streaming-deferred.md src
 git commit -m "docs: define deferred streamed configurator track"
```

## Phase D — End-to-end validation and delivery

### Task 20: Add browser tests

**Objective:** Verify the public experience, not only units.

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/showcase.spec.ts`

**Required scenarios:**

1. page headings and section order;
2. gallery image load and alt text;
3. model reaches ready state;
4. finish and trim controls update state;
5. reset returns defaults;
6. invalid URL options fall back safely;
7. mobile layout does not overflow horizontally;
8. WebGL failure shows poster and explanation;
9. streaming is visibly deferred;
10. zero uncaught page errors and zero failed first-party asset requests.

**TDD cycle:** Add one scenario at a time, watch it fail for the intended reason, make the smallest fix, rerun that scenario, then rerun all scenarios.

**Commands:**

```bash
npm run dev -- --host 127.0.0.1
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=webkit
```

Expected: all scenarios pass in both projects.

**Commit:**

```bash
git add playwright.config.ts tests src
 git commit -m "test: cover benchmark showcase end to end"
```

### Task 21: Add CI quality gates

**Objective:** Make research and application drift block merges.

**Files:**
- Create: `.github/workflows/ci.yml`

**Pipeline order:**

1. checkout with Git LFS if used;
2. setup Node 22 with npm cache;
3. `npm ci`;
4. `npm run research:validate`;
5. `npm test`;
6. `npm run lint`;
7. `npm run build`;
8. install Playwright browsers;
9. `npm run test:e2e`;
10. upload Playwright report on failure.

**Verification:**

```bash
npm ci
npm run research:validate
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected: every command exits `0`; production output is under `dist/`.

**Commit:**

```bash
git add .github package-lock.json
 git commit -m "ci: gate showcase and research integrity"
```

### Task 22: Conduct final evidence and asset audit

**Objective:** Ensure the published story matches the repository and actual outputs.

**Files:**
- Modify as needed: `research/findings.md`, run records, manifest, credits

**Audit checklist:**

- [ ] Every displayed image maps to a render run and fixed shot.
- [ ] Every published benchmark claim maps to run IDs.
- [ ] Every external claim has a valid citation.
- [ ] Asset hashes match files on disk.
- [ ] Every CC BY item has complete attribution.
- [ ] No branded asset lacks explicit rights.
- [ ] “Astra-authored” excludes external generators.
- [ ] Failed attempts remain visible.
- [ ] No secrets, API keys, local absolute paths, hidden reasoning, or private screenshots are published.
- [ ] Source `.blend` or reproducible generation script is retained for approved authored work.
- [ ] Runtime GLB is derived from a named approved source.
- [ ] Streaming remains labeled deferred.

**Commands:**

```bash
npm run research:validate
sha256sum public/assets/models/*.glb public/assets/images/*
npm test
npm run build
npm run test:e2e
```

Expected: hashes match the manifest, tests pass, and the build succeeds.

**Commit:**

```bash
git add research licenses src public
 git commit -m "docs: complete benchmark evidence audit"
```

### Task 23: Deploy a preview and verify the deployed target

**Objective:** Verify the actual hosted artifact, not only localhost.

**Files:**
- Create the chosen static-host configuration only after the host is selected, e.g. `vercel.json` or deployment workflow.

**Procedure:**

1. Deploy `dist/` to the selected static host.
2. Read back the deployment URL.
3. Run Playwright against `BASE_URL=<preview-url>`.
4. Verify model and image requests use cacheable immutable paths and correct MIME types.
5. Verify direct navigation, mobile layout, credits, and deferred streaming text.
6. Record deployment URL and Git commit SHA in the final research run or release notes.

**Expected:** deployed Chromium/WebKit suite passes with no first-party 404s and no page exceptions.

**Commit:**

```bash
git add <host-config> README.md
 git commit -m "chore: add verified showcase deployment"
```

---

# Tests / validation matrix

| Layer | Tool | Exact gate |
|---|---|---|
| Research schemas | Node test + Ajv | Missing required provenance/run fields fail |
| Asset acquisition | Node test + SHA-256 | Hash mismatch never writes destination |
| Blender scene | Blender background Python | Named slots, dimensions, geometry checks, no missing textures |
| glTF | `gltf-transform inspect` | File readable, required names/extensions known, no critical issue |
| Pure app logic | Vitest | defaults, parsing, reset, material mapping, metrics |
| Components | Testing Library | semantics, statuses, controls, evidence content |
| Browser | Playwright | GLB loads, controls work, no errors, mobile fallback |
| Build | TypeScript + Vite | clean production build |
| Research/application sync | deterministic generator | two generated hashes match |
| Deployment | Playwright against preview URL | hosted assets and behavior match local build |

For every code behavior, use the vertical RED → GREEN → REFACTOR cycle and commit immediately after the full targeted and regression suites pass. Do not write a batch of tests and then a batch of production code.

# Risks and tradeoffs

1. **A car is visually strong but technically expensive.** Glass, clearcoat, many parts, and high texture/triangle counts make it a good stress test but a poor first geometry-from-scratch task. Mitigation: use a licensed concept car as baseline and keep Astra’s first geometry task small.
2. **Asset license ambiguity can invalidate the public demo.** “Free download” is not enough. Mitigation: official source only, immutable URL, copied license/credit, SHA-256, and a blocked status when rights are unclear.
3. **Astra may use external generation without making it obvious.** That would confound the benchmark. Mitigation: provenance lanes, exact tool inventory, and invalidation when tool access is unknown.
4. **Material appearance is renderer-dependent.** A Blender material and Three.js material may not match exactly. Mitigation: fixed color management, environment maps, documented translation, and side-by-side screenshots rather than unsupported “pixel perfect” claims.
5. **WebGPU can distract from the research question.** It may improve some workloads but introduces renderer and browser variability. Mitigation: WebGL2 baseline first; profile before adding a WebGPU branch.
6. **Visual tests are brittle.** GPU/driver differences change pixels. Mitigation: deterministic camera/lighting, broad thresholds, semantic assertions first, and manual approval for final visual quality.
7. **Large binaries make Git awkward.** Mitigation: Git LFS or reproducible fetch scripts; never commit cache/intermediate files just because they exist.
8. **A polished site can overstate weak research.** Mitigation: outputs first, but failures, intervention level, sourced-vs-authored labels, methods, and threats to validity remain one click or scroll away.
9. **One asset cannot prove general 3D competence.** Mitigation: call this a case study and retain the control asset; add another category only after the first protocol is stable.
10. **Streaming creates operational burden.** It requires GPU lifecycle, WebRTC signaling/TURN, auth, concurrency controls, monitoring, and cost management. Mitigation: defer until a browser limitation and business case are explicit.

# Open questions and decision gates

These do not block scaffolding or protocol work, but they must be resolved before the named phase:

1. **Exact Astra access path:** Codex/Desktop agent, API model, or another interface? Resolve before Task 6 so runs record accurate model/tool metadata.
2. **Primary asset:** Approve the scorecard’s winner before Task 5. Current direction is an unbranded `CarConcept`, not a branded commercial car.
3. **Publishing rights:** Is the final site public, unlisted, or internal? Resolve before adding external references, screenshots, or any client-like branding.
4. **Benchmark machine:** Name the device/browser used for formal performance results before Task 16.
5. **Human baseline:** If the project aims to compare Astra with a person, define who performs the same fixed tasks and under what time/tool constraints. Otherwise report Astra results without implying superiority.
6. **External generators:** Decide whether Tripo/Meshy/etc. are allowed in a separate orchestrated lane. Default: not allowed in the “Astra-authored” lane.
7. **Deployment target:** Vercel, Cloudflare Pages, GitHub Pages, or internal hosting. Resolve before Task 23; the application remains static-host portable.
8. **Source asset retention:** If upstream source includes `.blend`, decide whether to commit with LFS or reproducibly fetch it. Runtime GLB alone is insufficient for editability claims.
9. **Aesthetic direction:** Default to a neutral, editorial automotive/product-study look. Any brand styling must be supplied explicitly and must not imply association with a real automaker.

# Definition of done

The work is complete only when the deployed page has passed the hosted Playwright suite, the runtime asset and external inputs match their recorded hashes, all published findings link to run evidence, all licenses/credits are present, failed attempts remain documented, and the streamed-engine track is honestly marked deferred rather than simulated.
