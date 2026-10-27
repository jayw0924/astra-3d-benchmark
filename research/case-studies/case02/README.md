# Case 02 — Astra + Blender intake (asset not selected)

**Pending only:** no model chosen, purchased, fetched, authored, rendered, registered
or promoted. No Blender installation is authorized. No new public route or run is
created. [intake.json](intake.json) is the machine-validated, deliberately incomplete
intake template, not experimental evidence. Null means unknown, not a placeholder
identifier. All checklist items below remain open.

## Question and responsibilities

**Approved direction: Blender-first, not WebGL-first.** Can Astra use Blender to
diagnose and improve a product asset, produce a reproducible editable result, and
demonstrate the improvement through controlled renders? Refine this into a
falsifiable asset-specific question after inspecting the selected baseline; do not
presume geometry needs optimization. A justified no-change or negative result is valid.

The primary deliverables are a separate `.blend`, reproducible scripts, controlled
before/after renders and independently checked evidence. Cycles is the proposed
primary reference renderer, subject to an actual bounded compute preflight; no
Blender installation or render execution has been authorized or performed here.
Browser export is an optional, separately scoped transfer experiment, not a primary
success requirement. Cycles-versus-browser differences do not establish an Astra
improvement or failure. Compare authoring changes within the same renderer first.

Astra authors subject work. Sol prepares controls and independently verifies static,
semantic, rendering and provenance gates, plus browser gates if that lane is approved.
Jay selects the asset, approves the protocol
and budget, judges labelled comparisons, and separately authorizes integration.
Record tool access and authenticate actual model/provider/session identity from
private exports before final attribution. Sol repairs are interventions, never
unassisted Astra successes. External generators require a disclosed separate lane.

## Asset-shopping rubric (review listing/metadata before retrieval)

Use a useful product Jay cares about, structurally different from the car. For each
candidate record listing/source URL, author, offered formats, license evidence,
price if observed, uncertainty and a short justification. No asset is selected.
Score suitability 0–4 only from cited listing evidence;
unknown stays unknown rather than becoming a zero or an invented fact.

| Criterion | Prefer | Reject/block or clarify |
|---|---|---|
| Real use and contrast | Configurable product, separable useful components | Another near-identical car, no clear task |
| Rights (hard gate) | Explicit permission for intended edits and published renders | Unclear derivative, texture, image or brand rights; separately require redistribution permission before publishing source/GLB |
| Editable source | Genuine `.blend`, external textures/dependencies enumerated | GLB-only listing represented as native source |
| Detail and semantics | Meaningful hierarchy, UVs, materials and manageable complexity | Featureless mesh or unbounded repair project |
| Render feasibility | Complete Blender dependencies and a bounded reproducible render | Missing resources or impractical compute; offline shaders are not inherently disqualifying |
| Reproducibility | Stable source/version and baseline export possible | Inaccessible dependencies or provenance gaps |
| Scope and cost | One measurable intervention within approved attempts | Mandatory paid tools/installations or speculative benefit |

License and source availability are gates, not scores that can be offset by visual
appeal. `.blend` and GLB may have different redistribution permissions. Keep receipts,
private seller messages and license documents outside public artifacts; publish only
permitted attribution and necessary rights conclusions. Ask Jay before purchase or
large retrieval. Do not reuse Case 01's asset IDs, fetching aliases or intervention.

## Intake checklist — complete only after separate authorization

- [ ] **Selection/rights:** Jay's explicit choice; source page/author/version,
  license URL and retained license evidence; derivative/render publication rights,
  trademark restrictions and required credits. Public source/GLB redistribution
  is an additional gate only if that output is pursued. Stop if intended use is unclear.
- [ ] **Immutable inputs:** after actual authorized retrieval, register the source
  `.blend` and texture bundle in canonical `research/asset-manifest.json`
  using real unique IDs. Record observed retrieval timestamp, exact immutable source,
  byte count, SHA-256 and contained local path for each. Link these IDs from intake;
  never invent them now. Register a baseline GLB only if actually produced for an
  approved export lane. Hash working inputs before/after; edit only separate copies.
- [ ] **Blender preflight:** record actual executable/version, exporter/add-ons and
  availability; currently no executable was found in this backend. No installation
  permission is implied. Check units, transforms, hierarchy, names, UVs, normals,
  tangents, seams, linked resources, shader connections and packed/external textures.
- [ ] **Optional browser/export preflight (not a primary authoring gate):** record `extensionsUsed`/`extensionsRequired`, all
  `KHR_materials_variants` mappings, animation and semantic invariants. Check KTX2 /
  `KHR_texture_basisu` import/export support, decoder availability and browser texture
  color spaces. Do not assume Blender preserves compressed textures or variant
  mappings. Any decompression/re-encoding is a separate attributed transformation
  with hashes, settings and loss/extension checks. Unsupported required extensions
  block progress rather than being silently stripped.
- [ ] **Protocol and attempt budget before authoring:** freeze an asset-specific
  versioned protocol in `research/protocols/`; define hypothesis, one variable,
  immutable control, acceptance tolerances, fixed shots/cameras, material/semantic
  invariants, capture count, timing/cost reporting and maximum attempts. Jay must
  approve the numeric budget first (no more than the existing three correction-round
  ceiling without explicit protocol change). Record initial attempt versus corrections,
  wall time versus active time, unknown cost and intervention levels separately.
- [ ] **Private provenance:** use ignored `research/case-studies/case02/private/`
  for shopping receipts/transcripts/working license evidence. Actual run session
  exports use existing ignored `research/runs/**/session.jsonl`. Check `git check-ignore`
  before writing sensitive files. Neither private directory nor sessions enter
  `public/`, `src/generated/` or galleries. Public commands ledgers are not transcripts.
- [ ] **One-pair render preflight before any matrix:** persist one actual
  Blender control/candidate image pair with scene/source hashes, camera and object
  matrices, materials, lights/world, render engine/version, resolution, samples,
  seed and color-management settings. Verify saved evidence and fixed invariants
  before batching. Record wall time separately from active or billed time. Test
  practical CPU render cost on Gondor before selecting a larger workload.
- [ ] **Optional browser telemetry preflight:** persist one actual
  control/candidate PNG pair and same-render camera position/quaternion/projection,
  controls target, model transforms, applied material indices, floor/shadow/renderer
  state, viewport/DPR and hashes. Read both records back; assert actual paired runtime
  invariants, nonblank images and expected nonzero count. Equal harness requests or
  checked UI controls are not proof. If this fails, stop before a batch.

## Staged workflow and stop conditions

1. Rights/selection and immutable intake, then read-only source inspection.
2. Read-only Blender inspection, dependency checks and a reproducible baseline
   render. A saved-copy/reopen check must preserve scene dependencies and intended
   structure. Optional glTF round-trip differences are conversion effects, not
   Astra improvement, and do not block the primary lane unless it depends on them.
3. Freeze one authoring brief and budget, then one bounded Astra intervention.
   Keep geometry, material edits, lighting/presentation and delivery optimization
   in distinct work packages. A bundled treatment cannot establish single-variable causality.
4. Independent static reproduction, matched same-renderer comparison and Jay's review.
   Blender/offline beauty does not prove glTF or browser equivalence. Software-GPU
   timing is diagnostic, not production speedup; unavailable metrics stay unavailable.
5. Preserve failures and rejected versions. Registration, authorship authentication,
   technical verification, subjective acceptance and promotion are separate gates.
   Integrate only under a new explicit authorization; commit/push/deploy are separate.

Stop on unclear rights, missing tools/extensions/resources, wrong/unknown authorship,
source hash change, destructive overwrite, semantic regression, telemetry failure,
repeated invalid output, budget exhaustion, undisclosed external generation or
negligible benefit versus the accepted control. Keep the last useful output and
record the actual stop reason; do not spend remaining attempts just to force success.

## Registration boundary

The current schema deliberately accepts only frozen references and **pending** intake,
not an experiment lifecycle. Once Jay chooses an asset, extend the intake/schema
with tested selected-state invariants in a separately scoped change; do not fill
nulls with fake IDs merely to pass validation. Add only real completed/blocked run
records in canonical `research/runs/`, conforming to the existing run schema. Then
link IDs here and regenerate the public projection only when a real registered run
requires it. Do not create an empty run directory: the current builder reads a
`run.json` from every direct child of `research/runs/`.
