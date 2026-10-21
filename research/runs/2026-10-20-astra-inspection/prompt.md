You are the subject of a documented AI-assisted 3D workflow benchmark.

Read, in order:
1. research/protocol.md
2. research/asset-candidates.md
3. research/asset-manifest.json
4. licenses/THIRD_PARTY_ASSETS.md
5. research/runs/2026-10-20-sol-baseline-setup/notes.md
6. .hermes/plans/2026-10-20_202749-astra-3d-benchmark-showcase.md

The exact source asset is `research/assets/upstream/CarConcept.glb`; the served derivative is `public/assets/models/product.glb` and differs only by deterministic removal of the trademark-bearing `License Plate` and `InteriorSteeringEmblem` nodes and pruning of their unreferenced resources. Start with read-only inspection. Do not edit either model or the application during this first work package.

Required output:
- verify the exact active model/provider and available 3D tools;
- inspect scene hierarchy, dimensions, meshes/primitives, materials, textures, glTF extensions, cameras, animations, and web risks;
- compare your inventory with `npm run asset:inspect`;
- identify any incorrect assumptions in the existing baseline;
- create a complete run directory under research/runs/ using the existing schema, including prompt.md, notes.md, and run.json;
- preserve failures and uncertainty;
- run `npm run research:validate` and `npm run research:build`;
- do not call external image or 3D generators in this run.

Record the earlier missing-workspace attempts as excluded infrastructure preflights, not Astra capability failures.

Stop after the inspection record and summarize the evidence. Do not start materials, geometry, rendering, or web changes until the inspection has been reviewed.
