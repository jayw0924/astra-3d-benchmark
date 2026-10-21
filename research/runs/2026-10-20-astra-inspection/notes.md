# Astra inspection — evidence and review

## Decision / status

Technical inspection completed and attribution is verified from the authentic host-side session export. No model or application source edits, external generators, installs, rendering, or material/geometry authoring were performed by Astra. Independent post-run integration updated the generated public study index and `.gitignore`; both changes are explicitly separated from Astra-authored inspection output.

## Identity, scope, time, and infrastructure exclusions

Runtime context identifies model `gpt-6-astra`, provider `openai-codex`, interface Hermes TUI with Docker terminal backend, session `20261020_155206_63fb07`. The final host export contains exactly one record and independently matches that session ID, model, and `billing_provider: openai-codex`; semantic research validation passes. The redacted export remains private because it still contains full messages and the system prompt: it is mode `0600`, ignored by Git, omitted from public outputs, and represented publicly by `session-evidence.sha256`. Reasoning mode and cost are not exposed, so neither is invented.

The workspace mount maps host `/home/jay/projects/external/configurator-demo` to backend `/workspace`; UID/GID are 1000:1000. Git branch is main with no commits and a pre-existing untracked baseline. No reliable tracked Git diff exists; checksums are used for protected files.

Earlier missing-workspace attempts are **excluded infrastructure preflights, not Astra capability failures**, per the user. Their exact prior session IDs/times were not supplied and are not invented. This session's first workspace check succeeded. During this work package six relative-path reads through execute_code returned file-not-found; direct terminal mount checks and absolute `/workspace/...` reads recovered, in the required order. This path-resolution preflight is also excluded from capability scoring. It remains in the transcript. File search for AGENTS.md returned irrelevant directory entries; a direct Python directory check found no root AGENTS.md, CLAUDE.md, or .cursorrules. These tool irregularities are preserved, not silently treated as asset errors.

Timing in run.json is wall-clock from the first successful workspace/tool check at 2026-10-20T22:55:57Z through the persisted session end at 2026-10-20T23:05:42Z. It excludes preceding inaccessible-workspace attempts and is not pure reasoning or CPU time. Cost is unknown, not zero. No corrective human solution was supplied within the inspection turn; post-run evidence integration and review are represented as mixed/non-Astra provenance rather than as benchmark intervention (level 0).

## Tool access

Used: terminal, read_file, search_files, write_file, execute_code, skill_view, tool_describe/tool_call (session_search). Available interface capabilities also include patch, browser_exec, vision_analyze, web_search/web_extract, delegation, clarification, connection management, memory/skill management, text-to-speech and deferred desktop/browser-vault/cron/project/process/todo/X tools. These interface capabilities are not proof of installed 3D applications; no external generation tool was invoked.

Verified locally: Node v26.10.0, npm 11.19.1, Python 3.13.15, glTF Transform CLI/core/extensions/functions 4.5.1, Three.js via existing package imports. Exact package versions and probes are retained in environment.json. Blender CLI, bpy, assimp, gltf_validator executable, toktx, basisu CLI, trimesh, and numpy are unavailable in the probed backend. Basis WASM/JS is supplied by the application; lack of a basisu CLI does not imply lack of browser KTX2 decoding. No Blender comparison or render is claimed. No dedicated Khronos Validator conformance pass is claimed: `gltf-transform inspect` is an inventory, not a complete conformance certification.

## Reproducible evidence

- `inspect.mjs`: read-only GLB parser/inventory; decodes actual POSITION float32 data, applies full ancestor transforms with Three.js matrices, checks finite positions and index ranges, reads KTX2 headers, and records hierarchy/materials/variant mappings. Unsupported sparse accessors fail explicitly. It asserts one scene and TRIANGLES for these exact inputs; it is not a general glTF validator.
- `inventory.json`: full machine-readable inventory of both files, all hierarchy entries, primitive counts/attributes, original material JSON, texture/image records, extension lists, world bounds, and hashes.
- `asset-inspect.txt`: exact `npm run asset:inspect` output; `independent-inspect.txt`: independent script output.
- `environment.json`, `verification.json`, and command logs: actual tool versions, command return codes, protected-file hash comparison, and semantic/schema validation.
- `study-data.json`: isolated research build showing one evidence-verified Astra run. The private transcript is not embedded in generated public data.

Re-run from project root: `node research/runs/2026-10-20-astra-inspection/inspect.mjs`. In-memory sanitizer replay uses the baseline's exact NodeIO registration, node disposal, prune, and binary serialization operations, without writing either model. Its result exactly matches served SHA-256 `67b7986109c72f6fcc61745e4e2eef25833fbf5c43fa6ffc0f0cf4e9d9e91f41`. Both original input hashes match the asset manifest. This verifies the stated deterministic derivative provenance, including serializer normalization; it does not claim retained GLB JSON bytes are unchanged.

## Inventory and comparison

| Metric | Upstream | Served |
|---|---:|---:|
| Bytes | 10,267,996 | 10,190,148 |
| Scenes | 1 | 1 |
| Nodes (all reachable) | 101 | 99 |
| Meshes | 97 | 95 |
| Mesh primitives (all indexed TRIANGLES) | 109 | 107 |
| Triangles per scene/pass | 213,347 | 213,195 |
| Render vertices (index entries, no vertex-cache allowance) | 640,041 | 639,585 |
| Unique POSITION accessor vertices | 162,766 | 162,646 |
| Materials | 29 | 28 |
| glTF texture objects | 15 | 14 |
| Embedded KTX2 images | 14 | 14 |
| Cameras / animations / skins | 0 / 0 / 0 | 0 / 0 / 0 |

The independent served counts reproduce CLI's 639,585 render vertices and 162,646 upload vertices, 28 materials, 14 images/textures, and absent animations. Mesh count is not primitive count or draw-call count. Upload vertices are not triangles. Exact counts derive from binary/JSON, not manually counting terminal rows.

Served world-axis-aligned dimensions X/Y/Z: **2.542320998 × 1.148896134 × 4.357385993 metres** under glTF unit convention. Bounds min [-1.271408303, -0.000241077, -1.940231204], max [1.270912694, 1.148655057, 2.417154789]. These agree with CLI bounds to its printed precision. This is geometry extent, including mirrors, not an independently measured manufacturing specification. Upstream dimensions are effectively identical; minute floating-point differences arise after serializer transform normalization.

Hierarchy: root `BodyUnderside` carries the source axis conversion (source root matrix rotates local coordinates). Named child subassemblies include `BodyRearPanelsColor1` with rear hatch/window/light parts; `BodyHood` with hood internals/headlights; `BodyDoorRColor1` and `BodyDoorLColor1` with windows, mirrors, handles, and interior; `InteriorSteeringCylinder` with wheel components; four `WheelFrontL`, `WheelFrontR`, `WheelRearL`, `WheelRearR` grouping nodes containing rim, brake, disc, and tire geometry. Root-local bounds alone would be wrong. Named nodes survive despite some meshes and tire nodes being unnamed; do not assume every mesh/material has a unique name. No supplied animation/rig means separability is not proof of validated opening/steering animation or correct mechanical pivots.

All three variants survive: Carmine Candy, Pearly Swirly, Torched Graphite. In the served file 25 primitives carry variant mappings. Material families include Paint 1, Paint 2, and Interior 3 in each finish, plus glass, mechanical hardware, interior surfaces, dashboard, signal/brake/headlights, mirror, brakes/discs, tires, and rims. Full physically based values and texture bindings are preserved in inventory.json. Glass is OPAQUE alphaMode with transmissionFactor=1 and doubleSided, not alpha-blended glass. Carmine Paint 1 has metalness default 1, roughness 0.25, clearcoat 1. Pearl Paint 1 includes clearcoat and iridescence; graphite Paint 2 also uses iridescence. Emissive-strength extensions affect the dashboard and lamps; there are no punctual-light objects.

Extensions used in both files: KHR_materials_clearcoat, KHR_materials_emissive_strength, KHR_materials_iridescence, KHR_materials_transmission, KHR_materials_variants, KHR_texture_basisu, KHR_texture_transform. Only KHR_texture_basisu is required. No Draco or meshopt compression is declared in these selected GLBs; upstream availability of other formats is not evidence this asset uses them.

All 14 images are embedded KTX2; there are no external buffer/image URIs. Resolutions range from 32×32 through 2048×2048 (also rectangular textures); individual dimensions/mip counts/byte sizes are in inventory.json. CLI identifies UASTC normal/metallic-roughness textures and ETC1S color/occlusion/emissive/iridescence-thickness textures. Source has 15 texture objects but only 14 images; these are distinct concepts. Removing the two nodes removes one material and two primitives but does not reduce embedded image count. No visual texture decoding/logo audit was performed; successful named-node removal alone is not a legal certification that every possible mark is absent.

## Baseline corrections and risks (not changed)

1. `research/asset-candidates.md:11` says weights are published in protocol.md, but they are absent there; they are in the scorecard header and original plan. Recalculated weighted totals are correct: CarConcept 370, shoe 315, ToyCar 270. The issue is the reference, not arithmetic.
2. The original plan's empty-workspace/no-Git assumption is obsolete. Its unbranded-input premise needs qualification: upstream contains trademark-bearing nodes; the served derivative removes them. Its three-finish-authoring brief is superseded by the handoff's one original finish preserving three supplied variants. No later work package is authorized here.
3. The variants are **not body-paint-only**: Interior 3 is variant-mapped too. A future requirement to preserve interior must explicitly distinguish original full variants from a newly authored paint-only finish.
4. `src/lib/threeViewer.ts:221-230` saves/restores only rim colors and sets bright metalness=1/roughness=0.24 for both rim materials. Source Rim1 has metallicFactor=0, roughness=0.4; Rim2 has metallicFactor default 1, roughness=0.049. Thus bright/reset is a runtime-authored treatment, not a faithful restoration of sourced rim values. This is a static code/asset mismatch, not a browser behavior measurement in this run.
5. `src/lib/threeViewer.ts:184-185` still attempts runtime plate hiding, but the served asset already excludes both target nodes. The redundant guard is not the actual trademark-removal mechanism.
6. Existing geometry/material counts in baseline notes are confirmed, not corrected. Their successful browser tests are historical baseline claims, not re-run performance evidence here. CLI inspection alone does not prove absence of all glTF validation errors.

Web risks: 107 primitives imply substantial potential draw submission work even though there are only 28 materials; transmission and double-sided materials can add passes/cost. 213,195 triangles and 162,646 upload vertices are plausible desktop loads, not evidence of mobile FPS. Wipers alone use 24,336 triangles and 30,429 vertices; inspect visually before any decimation. KTX2 requires loader/transcoder availability, correct deployment paths/MIME/CSP, and device-specific transcode support; GPU texture memory is not compressed transfer size. Current loader configures `/basis/` and detects renderer support. Paint/iridescence/transmission appearance depends on lighting/tone mapping; current runtime has direct/hemisphere lights and no environment map. It runs a continuous requestAnimationFrame loop, so offscreen/idle cost warrants later measurement. All are inspection-derived risks, not observed performance regressions. No FPS/load-to-first-frame, visual fidelity, mobile GPU, browser compatibility, normals/manifoldness, or Blender editability claims are made.

## Validation and attribution result

The evidence capture script now preserves `run.json` and `protected-before.json`, runs `npm run research:validate`, and writes an isolated study build under this run directory. Re-running it cannot remove the integrated `sessionEvidence` descriptor or restore the obsolete missing-evidence expectation. Current validation passes with two assets and two runs; the isolated build reports one evidence-verified Astra run.

The original protected-file capture found no Astra changes outside this run directory. Post-review integration intentionally changed only `src/generated/study-data.json` and `.gitignore`; `verification.json` reports these separately rather than repeating the obsolete `protectedChanges: []` claim. Both GLBs remain byte-identical to their manifest hashes. Independent fail-closed review passed with no blockers. The inspection package is accepted; no materials, geometry, renders, or web integration changes follow automatically.
