# Estuary Enamel — material-authoring work package

## Decision and scope

Run `2026-10-20-astra-material-estuary-49b949` produced a technically valid, deterministic **Estuary Enamel** candidate as a fourth `KHR_materials_variants` option. The persisted private Hermes export independently verifies session `20261020_161843_49b949`, model `gpt-6-astra`, and billing provider `openai-codex`.

This is technical acceptance, not visual acceptance. No rendering, geometry authoring, browser integration, external generation, package installation, or Blender work occurred. Outcome remains `partial` pending a controlled blind A/B render and runtime measurements.

## Physical model and artistic intent

Estuary is a solid-pigment blue-green dielectric basecoat under a glossy dielectric clearcoat, with a darker coordinated exterior accent. This is an artistic hypothesis, not a rendered observation or measured paint formulation.

| Parameter | Main (material 28) | Accent (material 29) |
|---|---|---|
| Linear RGB + alpha | `[0.018, 0.105, 0.085, 1]` | `[0.012, 0.025, 0.023, 1]` |
| Metallic | `0` | `0` |
| Base roughness | `0.32` | `0.36` |
| Clearcoat factor | `1` | `1` |
| Clearcoat roughness | `0.12` | `0.12` |
| Alpha mode | `OPAQUE` | `OPAQUE` |
| Double-sided | `true` | `true` |

The factors are linear-light values. No emission, transmission, iridescence, or new texture slots are added. The recipe deliberately omits flake or orange-peel microstructure. Clearcoat cost, highlight readability, saturation, close-up quality, and lighting response remain unmeasured.

## Assignment policy

All original materials, default assignments, and three supplied variants are preserved.

- Seven `Paint 1 Carmine` primitives map to **Estuary Enamel Main**.
- Nine `Paint 2 Carmine` primitives map to **Estuary Enamel Accent**.
- Nine variant-mapped interior primitives reuse sourced **Interior 3 Graphite** (material 26).
- All other primitives retain their original defaults.

Every previously variant-mapped primitive has exactly one assignment for each of four variants. Data-level transition simulation from every supplied variant reaches the same Estuary assignment state. This is not a browser-rendered transition test.

## Reproducibility and technical comparison

From the project root:

```sh
node research/runs/2026-10-20-astra-material-estuary-49b949/author-material.mjs
node research/runs/2026-10-20-astra-material-estuary-49b949/inspect-candidate.mjs
node --test research/runs/2026-10-20-astra-material-estuary-49b949/material.test.mjs
```

`author-material.mjs` accepts only the pinned served-input hash. It creates a fresh run-local inode and atomically replaces `candidate.glb`, preventing writes through pre-existing symlinks or hardlinks. The regression test exercises the hardlink case.

Independent review reproduced SHA-256 `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f` twice, at **10,191,496 bytes**. The inspector does not import or execute the author and now writes nothing; it reports to stdout.

| Metric | Served input | Candidate |
|---|---:|---:|
| Nodes / meshes / primitives | 99 / 95 / 107 | 99 / 95 / 107 |
| Triangles | 213,195 | 213,195 |
| Unique POSITION vertices | 162,646 | 162,646 |
| Render index entries | 639,585 | 639,585 |
| Materials | 28 | 30 |
| Texture objects / embedded images | 14 / 14 | 14 / 14 |
| Variants / mapped primitives per variant | 3 / 25 | 4 / 25 |

World dimensions remain exactly `2.5423209977504473 × 1.1488961344483861 × 4.357385993003845` metres. The BIN payload is byte-identical, SHA-256 `233f4278d9cf0d5d974060875ed3157866fb697e354c8cfd529c238f223cb1b3`. Removing exactly two appended materials, one variant, and 25 mappings reconstructs the source JSON. The remaining 1,348-byte change is JSON re-encoding/padding and updated container lengths. Both removed trademark-bearing node names remain absent.

## Evidence and provenance

- `candidate.glb`: **mixed** — sourced geometry, textures, original materials, and interior treatment plus Astra-authored material records and mappings.
- `prompt.md`: **non_astra_authored_baseline**.
- Original authoring/evidence artifacts began as Astra outputs; files changed during independent Sol review are now classified **mixed** in `run.json`.
- `session.jsonl`: private validation input, not a public output; mode `0600`, Git-ignored.
- `session-evidence.sha256`: publishable integrity record, SHA-256 `4fe5ba9c345779665b0d7de2403c19144b030777d3ad1937ceee4f5861ddaa49`.
- Historical `commands.jsonl` remains immutable. Its earlier missing-export validation failure is superseded by the current successful global validation and must not be read as current state.
- `protected-before.json` and `protected-verification.json` describe the original Astra work-package boundary. Later evidence integration and independent-review edits are declared post-run changes, not silently included in the historical no-change assertion.

The full persisted session ran from `2026-10-20T23:18:53.988048+00:00` through `2026-10-20T23:27:56.894495+00:00` (542.906447 seconds). The export reports 135,091 input, 16,015 output, 674 reasoning, and 2,510,592 cache-read tokens. Billing mode is `subscription_included`; actual charged cost is unavailable (`null`), so the record does not claim a zero economic cost. No external generator charge was incurred.

Blender was unavailable (`ENOENT`). glTF Transform parsing is evidence of readability, not full Khronos conformance. Intervention level remains 0 for the Astra work package; post-run Sol evidence integration and security hardening are disclosed through mixed provenance.
