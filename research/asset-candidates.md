# Asset candidate study

## Decision

Use Khronos **CarConcept** as the primary benchmark asset and **ToyCar** as the documented fallback/control. CarConcept scored highest because it combines realistic automotive complexity, named component hierarchy, web-ready glTF delivery, and three supplied material variants. The public presentation must hide or replace logo-bearing elements, retain attribution, and state that Khronos and 3D Commerce do not endorse this project.[1][2]

This is a weighted project decision, not a general quality ranking.

## Scorecard

Each category is scored 0–4, multiplied by its published weight in `research/protocol.md`.

| Candidate | License ×20 | Configurability ×20 | Visual ×15 | Web-ready ×15 | Workflow ×15 | Optimization ×10 | Brand risk ×5 | Total /400 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| CarConcept | 3 | 4 | 4 | 4 | 4 | 4 | 2 | **370** |
| MaterialsVariantsShoe | 3 | 3 | 3 | 4 | 3 | 3 | 3 | **315** |
| ToyCar | 4 | 1 | 2 | 4 | 2 | 3 | 4 | **270** |

## CarConcept

- **License:** CC BY 4.0 for the model and textures; separate notice applies to included Khronos/3D Commerce marks.[1][2]
- **Runtime formats:** split glTF variants, GLB, and compressed KTX2/Draco options are supplied by the official repository.[1]
- **Configuration:** `KHR_materials_variants` supplies Carmine Candy, Pearly Swirly, and Torched Graphite. The hierarchy includes separate doors, hood, hatch, wheels, interior, glass, and lights.[1]
- **Selected immutable artifact:** optimized GLB at Khronos commit `15cd02d304e54cb42a4db4eefe719f76190f4b68`.
- **Verified upstream artifact:** `research/assets/upstream/CarConcept.glb`, 10,267,996 bytes, SHA-256 `659c592e20aba7afa920db7d14ad767874741384c215ee1df23a5e1c5e1c411c`.
- **Verified served derivative:** `public/assets/models/product.glb`, 10,190,148 bytes, SHA-256 `67b7986109c72f6fcc61745e4e2eef25833fbf5c43fa6ffc0f0cf4e9d9e91f41`.
- **Derivative inspection:** glTF 2.0; 1 scene; 639,585 submitted triangle indices for one complete pass; 162,646 distinct POSITION accessor entries; 28 materials; 14 KTX2 textures; no animation; `KHR_texture_basisu` required. The two geometry values are static file-structure counts, not GPU-upload or shader-work measurements.
- **Risk treatment:** deterministically remove the `License Plate` and `InteriorSteeringEmblem` nodes and their unreferenced resources from the served derivative, preserve credits, retain the exact upstream bytes outside `public/`, and do not imply endorsement.

## ToyCar

- **License:** CC0 1.0.[3]
- **Strength:** simplest redistribution and branding posture; material features include clearcoat, transmission, and sheen.[3]
- **Limitation:** no supplied `KHR_materials_variants`; fewer meaningful product components.
- **Disposition:** fallback/control if CarConcept mark treatment or KTX2 delivery becomes disproportionate.

## MaterialsVariantsShoe

- **License:** CC BY 4.0, attributed to Shopify.[4]
- **Strength:** a compact `KHR_materials_variants` example with midnight, beach, and street configurations.[4]
- **Limitation:** a single product mesh provides less geometry/hierarchy depth than the vehicle workflow.
- **Disposition:** retained as a material-variant control, not the hero asset.

## Sources

1. [Khronos CarConcept README](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept/README.md)
2. [Khronos CarConcept license record](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept/LICENSE.md)
3. [Khronos ToyCar README](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/ToyCar/README.md)
4. [Khronos MaterialsVariantsShoe README](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/MaterialsVariantsShoe/README.md)
