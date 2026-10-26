# Third-party assets

## CarConcept

- **Local model files:** `public/assets/models/product.glb` (sanitized baseline), `public/assets/models/product-estuary.glb` (preserved Estuary control), and `public/assets/models/product-estuary-safe.glb` (accepted geometry derivative).
- **Title:** CarConcept
- **Original public-domain model:** Unity Fan
- **Additional upstream credit:** DGG is credited in Khronos model metadata
- **glTF conversion, material work, and optimization:** Eric Chadwick
- **License:** Creative Commons Attribution 4.0 International (`CC-BY-4.0`)
- **Source:** <https://github.com/KhronosGroup/glTF-Sample-Assets/tree/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept>
- **License record:** <https://github.com/KhronosGroup/glTF-Sample-Assets/blob/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept/LICENSE.md>
- **Immutable download:** <https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/15cd02d304e54cb42a4db4eefe719f76190f4b68/Models/CarConcept/GLB/CarConcept.glb>
- **Changes in this project:** The served derivative removes the trademark-bearing `License Plate` and `InteriorSteeringEmblem` nodes and prunes their unreferenced resources using `scripts/sanitize-model.mjs`. The exact upstream GLB is retained outside `public/` at `research/assets/upstream/CarConcept.glb`. Further material or geometry changes must be recorded in the corresponding benchmark run.

Khronos, glTF, and 3D Commerce marks are owned by their respective holders. Their inclusion in the upstream sample asset does not imply endorsement of this independent benchmark.

Local copies of the upstream license record and referenced legal-mark notice are retained at `licenses/upstream/CarConcept-LICENSE.md` and `licenses/upstream/LicenseRef-LegalMark-Khronos.txt`.

The derivatives retain the above source attribution and CC BY 4.0 lineage. Estuary material authoring and geometry optimization are separately recorded as evidence-verified Astra work; viewer lighting, browser capture, review, and application integration are Sol-authored work. See `research/asset-manifest.json` for exact identities and per-asset provenance. The public PNGs under `public/assets/renders/` and `public/assets/study/` inherit the depicted model's attribution; historical evidence images are not silently replaced when the live viewer lighting changes. Included marks in raw upstream evidence remain subject to the separate legal notice; removal of named nodes is not a general legal certification.

## Basis Universal transcoder

- **Local files:** `public/basis/basis_transcoder.js`, `public/basis/basis_transcoder.wasm`
- **Source package:** distributed with Three.js `0.186.1` from the Basis Universal project by Binomial LLC
- **License:** Apache License 2.0
- **Upstream:** <https://github.com/BinomialLLC/basis_universal>
- **Changes:** none; files are redistributed byte-for-byte from the installed Three.js package.

Local copies of the Apache 2.0 license and Basis Universal notice are retained at `licenses/upstream/Basis-Universal-APACHE-2.0.txt` and `licenses/upstream/Basis-Universal-NOTICE.md`. Exact distribution copies are shipped at `public/licenses/Basis-Universal-APACHE-2.0.txt` and `public/licenses/Basis-Universal-NOTICE.md`, linked from public Credits. This distribution check is not legal certification.

## Current viewer preview

`public/assets/viewer/refined-estuary-native.png` is an exact native 850×778 copy of the existing Sol capture `research/runs/2026-10-26-sol-lighting-integration/after-refined-chromium-estuary-enamel-native.png`, not a new render or controlled before/after comparison. It inherits CarConcept CC BY 4.0 attribution above, with Astra Estuary material and Safe geometry contributions retained; refined lighting, capture and public copying are Sol-authored. Historical material and Safe comparison PNGs remain unchanged. Identity and source are registered as `refined-viewer-preview` in the asset manifest.
