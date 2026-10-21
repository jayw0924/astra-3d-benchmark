# Fjord Enamel — material-authoring work package

## Decision and scope

Run `2026-10-20-astra-material-fjord-ef457b` produced a technically valid, deterministic **Fjord Enamel** candidate as a fourth `KHR_materials_variants` option. The persisted private Hermes export independently verifies session `20261020_162838_ef457b`, model `gpt-6-astra`, and billing provider `openai-codex`.

This is technical acceptance, not visual acceptance. No rendering, geometry authoring, browser integration, external generation, package installation, or Blender work occurred. Outcome remains `partial` pending a controlled blind A/B render and runtime measurements.

Fjord is a related, bluer monochrome simplification of the Estuary recipe family, not an orthogonal concept. Its environment had visibility into the earlier Estuary run. The Fjord candidate was nevertheless built from the pinned public baseline, not from the Estuary candidate; stripping Fjord's additions reconstructs that baseline. Do not claim blind conceptual independence.

## Physical model and artistic intent

Fjord is a deep blue-green solid-color dielectric basecoat beneath a transparent dielectric clearcoat. It is an artistic hypothesis, not rendered evidence or a measured manufacturer formula.

| Parameter | Value |
|---|---|
| Linear base color + alpha | `[0.018, 0.105, 0.125, 1]` |
| Metallic | `0` |
| Base roughness | `0.32` |
| Clearcoat factor | `1` |
| Clearcoat roughness | `0.12` |
| Alpha mode | `OPAQUE` |
| Double-sided | `true` |
| New texture maps | none |

One new material replaces both source paint families only for the new variant: 16 exterior primitives form a monochrome treatment. Nine variant-mapped interior primitives reuse sourced **Interior 3 Graphite** (material 26). Every previously mapped primitive has exactly one assignment in all four variants. This is data-level coverage, not a browser-rendered transition test.

The design deliberately omits flake and orange-peel microstructure. Shader cost, panel readability, tone-mapped color, close-up quality, and lighting response remain unmeasured.

## Reproducibility and technical comparison

From the project root:

```sh
node research/runs/2026-10-20-astra-material-fjord-ef457b/author-material.mjs candidate.glb
node research/runs/2026-10-20-astra-material-fjord-ef457b/author-material.mjs candidate-repeat.glb
node research/runs/2026-10-20-astra-material-fjord-ef457b/review.mjs
node --test research/runs/2026-10-20-astra-material-fjord-ef457b/material.test.mjs
```

The author accepts only `candidate.glb` or `candidate-repeat.glb` and the pinned served-input hash. It creates a fresh run-local inode and atomically replaces the selected target, preventing writes through pre-existing symlinks or hardlinks. The regression test exercises the hardlink case.

Both candidate files are byte-identical, SHA-256 `1eaba8fe0cbecfcf45a0ec83337979f6db1bb08ad98b6cef8de6d97e9ab790c3`, at **10,191,212 bytes**. `review.mjs` does not import or execute the author and now writes nothing; it reports to stdout.

| Metric | Served input | Candidate |
|---|---:|---:|
| Nodes / meshes / primitives | 99 / 95 / 107 | 99 / 95 / 107 |
| Triangles | 213,195 | 213,195 |
| Unique POSITION vertices | 162,646 | 162,646 |
| Render index entries | 639,585 | 639,585 |
| Materials | 28 | 29 |
| Texture objects / embedded images | 14 / 14 | 14 / 14 |
| Variants / mapped primitives per variant | 3 / 25 | 4 / 25 |

World dimensions remain exactly `2.5423209977504473 × 1.1488961344483861 × 4.357385993003845` metres. The BIN payload and all original geometry, textures, materials, defaults, and variant mappings remain unchanged. Removing one appended material, one variant, and 25 mappings reconstructs the source JSON. The remaining 1,064-byte change is JSON re-encoding/padding and updated container lengths. Both removed trademark-bearing node names remain absent.

## Evidence and provenance

- `candidate.glb` and `candidate-repeat.glb`: **mixed** — sourced geometry, textures, original materials, and interior treatment plus Astra-authored material and mapping additions.
- `prompt.md`: **non_astra_authored_baseline**.
- Original authoring/evidence artifacts began as Astra outputs; files changed during independent Sol review are now classified **mixed** in `run.json`.
- `session.jsonl`: private validation input, not a public output; mode `0600`, Git-ignored.
- `session-evidence.sha256`: publishable integrity record, SHA-256 `fddef8b529bc168495b9bce1bdee61e6a0e43b79a6b840460ca3ec1236cc4f03`.
- Historical `commands.jsonl` remains immutable. Its earlier missing-export validation failures and cross-run discovery are superseded by current successful global validation but remain evidence of the actual workflow.
- `protected-before.json` and `protected-verification.json` describe the original Astra work-package boundary. Later evidence integration and independent-review edits are declared post-run changes.

The full persisted session ran from `2026-10-20T23:29:52.347998+00:00` through `2026-10-20T23:42:51.151837+00:00` (778.803839 seconds). The export reports 245,268 input, 16,143 output, 1,052 reasoning, and 2,040,192 cache-read tokens. Billing mode is `subscription_included`; actual charged cost is unavailable (`null`), so the record does not claim a zero economic cost. No external generator charge was incurred.

Blender was unavailable. glTF Transform parsing is evidence of readability, not full Khronos conformance. Intervention level remains 0 for the Astra work package; post-run Sol evidence integration and security hardening are disclosed through mixed provenance.
