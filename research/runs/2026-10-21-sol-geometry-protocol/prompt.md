# Geometry protocol work package

Freeze the geometry-inspection and WebGL-optimization measurement contract before any scored Astra candidate run.

Requirements:

- Preserve the selected Estuary integration as the immutable control.
- Distinguish triangles, indexed render vertices, uploaded POSITION vertices, primitives, and measured draw calls.
- Define Safe WebGL and Mobile LOD candidate roles without pre-judging that smaller geometry is better.
- Require visual, semantic, reproducibility, browser, and attribution gates.
- Encode geometry reports in a strict schema and make repository validation discover reports recursively.
- Add failing validator tests before implementation.
- Correct the existing protocol's stale 2400×1600-only language to disclose the accepted 600×400 controlled browser matrix.
- Do not launch Astra or modify model assets in this package.
