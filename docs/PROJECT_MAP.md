# Project map and safe command boundaries

## Additive case organization

| Location | Authority / purpose |
|---|---|
| `research/case-studies/index.json` | Case navigation; existing canonical asset/run IDs only |
| `research/case-studies/case01/` | Frozen car checkpoint index; no copied evidence |
| `research/case-studies/case02/` | Pending Astra + Blender intake/checklist; no asset or run yet |
| `research/asset-manifest.json` | Shared canonical source/derivative identity, rights and byte hashes |
| `research/runs/<real-run-id>/` | Shared canonical run records, outputs, failures and provenance |
| `research/schemas/` | Existing asset/run/report schemas plus bounded case-index/intake schema |
| `research/protocol.md` | Historical car study protocol; not a generic new-asset brief |
| `research/protocols/` | Versioned phase protocols; freeze new asset-specific protocol before authoring |
| `research/assets/` | Existing upstream research inputs, not automatically public |
| `src/`, `public/` | Published car application, generated projection and served assets; unchanged by Case 02 |
| `scripts/` | Shared validation/report/build helpers and existing car-specific aliases |
| `tests/e2e/` | Car UI, rendered-state and served-byte checks, not a generic multi-model harness |
| `research/ASTRA*_HANDOFF.md`, `ASTRA_SAFE*.md`, `SAFE_WEBGL_INTEGRATION.md`, `FROZEN_LIGHTING_CHECKPOINT.md` | Historical car instructions/checkpoints; not the Case 02 handoff |

No directory moves, evidence copies, run-ID migration or renderer abstraction is
needed for a second study. A case index is a set of links, not a second ledger.
Case 01's run list in the index is a current-checkpoint subset, not exhaustive
membership. Do not add an empty run folder: the current public-data builder expects
a real `run.json` in each direct child of `research/runs/`.

## Commands: read the target before executing

- `npm test`: unit, script tests (including case index/intake) and historical
  render-plan tests. Plan tests do not execute capture writers.
- `npm run lint`: repository ESLint.
- `node scripts/validate-case-studies.mjs [--root PATH]`: read-only AJV validation,
  unique cases, canonical asset/run references, matching intake identity and realpath
  containment (including symlink escapes). It does not reverify all run evidence,
  prove a checkpoint commit exists, approve rights or authorize promotion.
- `npm run research:validate`: strict canonical asset hashes, run schema,
  attribution and independent static-report verification; private sessions required.
- `npm run research:build`: **writes** `src/generated/study-data.json` from canonical
  runs. Case intake is deliberately excluded. Do not regenerate for planning alone.
- `npm run build`: strict local validation + projection generation + app build.
- `npm run build:app`: deployment/public build from the already validated tracked
  projection, without reading private sessions. Preserve this privacy split.
- `npm run test:e2e`: existing car acceptance harness; CPU/SwiftShader and layout
  checks do not establish production GPU speed or physical-device quality.

### Existing car-only aliases — not onboarding commands

`asset:fetch` targets `primary-product` (CarConcept); `asset:sanitize` reads
`CarConcept.glb` and writes the car derivative while removing two car-specific mark
nodes. `asset:inspect`, `asset:inspect-control` and `asset:inspect-integrated` inspect
fixed car paths. None is a generic Case 02 acquisition/import procedure. Shared
script interfaces can be considered only after their actual inputs/outputs and
existing destinations have been reviewed.

**Historical writers:** `render:compare`, `render:repair-closeups`, and
`render:refresh-metrics` all invoke
`research/runs/2026-10-20-sol-material-ab-render/capture.mjs`. They can rewrite
historical car outputs, galleries or metrics. Do not run them for Case 02 or rerun
writers inside populated historical packages. Other scripts nested under existing
run directories likewise belong to those experiments unless explicitly audited.
A future capture needs a separately scoped protocol and new unique real run package.

## Privacy and extension limit

Keep raw shopping/license/session provenance under ignored case `private/` folders
or existing ignored per-run `session.jsonl`; verify ignore behavior before writing.
Do not blanket-ignore JSONL: public command ledgers are distinct from private session
exports. No public Case 02 UI, download, dependency installation or candidate promotion
exists. The initial machine schema deliberately accepts frozen cases and pending
intake only. Extend it with tested selected-state gates when real selection occurs,
rather than building a speculative experiment platform now.

## Organization verification at the frozen checkpoint

Against `83ca4ec2e265e3d6c05bba95a7cbc6ba852966b8` plus this additive organization:

- `npm test`: 39 unit, 45 script (15 case-index/intake), 6 render-plan tests passed.
- `npm run lint` and standalone case validation passed (2 cases).
- `npm run build`: strict validation passed for the existing 20 assets / 30 runs;
  regenerated projection remained byte-identical.
- `npm run build:app` passed; both builds retained the existing large-chunk warning.
- SHA-256 inventory comparison found all 1,830 preexisting files in `research/`,
  `public/` and `src/` unchanged, including historical runs, model and preview.
- `git diff --check` passed; case-private and run-session ignore paths matched.

No browser recapture/E2E, Blender import or remote deployment was performed for
this documentation/intake-only change. No dependencies were installed.

