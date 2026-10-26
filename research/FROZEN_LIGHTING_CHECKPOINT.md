# Approved lighting checkpoint — frozen before grounding/material diagnosis

Baseline Git commit: `ffe0a56982a0bb22c34d705b1c00f0a62d147a0f` (Publish refined lighting methods, preview, and research closeout). Working tree was clean when this checkpoint was recorded on 2026-10-26T19:18:52Z. No tag, commit or history change is implied by this document.

Accepted model: `public/assets/models/product-estuary-safe.glb`, 9,239,404 bytes, SHA-256 `01b2c67ee3554de0182538e29127ea3b80405841107bee69b931b63797eac3c4`. Selected presentation: `grounded-studio-refined`, ACESFilmic exposure1.05, existing material parameters and wheel treatment. Original Estuary control and prior evidence remain immutable.

Jay approved this as a published presentation checkpoint while explicitly noting remaining geometry/material issues. It is subjective approval, not photorealism, arbitrary-view parity, mobile-device quality, or production-GPU performance certification.

## Next bounded work

1. Investigate reported hovering as its own viewer-grounding defect. Measure actual transformed tire/ground distances and shadow bias/normal-bias/filter effects before changing anything. Preserve model bytes/materials and chosen illumination. Correct only demonstrated contact placement or shadow treatment, with test-first regressions and actual paired captures. Do not assume the three-millimetre configured floor offset is the entire visual cause.
2. Read-only material/control inspection under identical frozen lighting. Separate paint/glass/wheel response from simplification artifacts; do not alter geometry/materials during diagnosis.
3. Blender workflow is a potential independent inspection/reference stage, not a prerequisite for diagnosis or a promised fix. The current Docker backend reports no Blender executable or bpy. Installing tools, adding mounts, importing/exporting or changing source assets requires a separately scoped step. Any later Blender render is a distinct renderer result, not proof of browser equivalence.

No commit, push, remote deployment, GLB replacement, material tuning, or broad geometry changes are authorized by this checkpoint. Historical capture settings/results must not be rewritten to match subsequent grounding changes.
