# Geometry toolchain preflight

Verify the pinned, locally available toolchain before any scored Astra geometry run.

Requirements:

- Record project root, source hash, Node/npm, glTF Transform, meshoptimizer, official glTF Validator, Playwright, and browser versions.
- State clearly that Blender/bpy and standalone `gltfpack` are unavailable.
- Demonstrate that the pinned glTF Transform/meshoptimizer path can perform a deterministic simplification probe from the immutable Estuary control without modifying it.
- Run the official validator and report its exact error/warning/info counts and its KTX2 support limitation.
- Parse and report the probe with the independent geometry reporter.
- Label probe outputs as infrastructure evidence, not scored Safe WebGL or Mobile LOD candidates.
- Do not invoke Astra or begin a scored candidate package.
