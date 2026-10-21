# Third-party assets

## CarConcept

- **Local file:** `public/assets/models/product.glb`
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

## Basis Universal transcoder

- **Local files:** `public/basis/basis_transcoder.js`, `public/basis/basis_transcoder.wasm`
- **Source package:** distributed with Three.js `0.186.1` from the Basis Universal project by Binomial LLC
- **License:** Apache License 2.0
- **Upstream:** <https://github.com/BinomialLLC/basis_universal>
- **Changes:** none; files are redistributed byte-for-byte from the installed Three.js package.

Local copies of the Apache 2.0 license and Basis Universal notice are retained at `licenses/upstream/Basis-Universal-APACHE-2.0.txt` and `licenses/upstream/Basis-Universal-NOTICE.md`.
