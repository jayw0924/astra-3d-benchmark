# Native visual inspection — evidence, not a final verdict

All nine 12-panel sheets were inspected (108 panels), followed by native 600×400 control/prior-rejected/corrected wipers and glass-edge shaded PNGs in both Estuary and Carmine. Six explicitly labelled supplements are listed in `native-comparison-manifest.json`; prior rejected images are used only under that label, never as corrected candidate evidence.

## Repair observed

The prior rejected candidate's segmented/scalloped hood-insert perimeter and bright under-edge, and broken roof/glazing-adjacent line, are substantially repaired in the corrected wipers/glass-edge pairs. The corrected hood insert now has the control's smooth broad reflections and perimeter rather than the conspicuous prior scallops. This is a visible improvement in both finishes, not a full-surface parity assertion.

## Residual localized concern

**A small stepped/notched rendered patch remains alongside the vertical panel seam immediately below the windshield's image-right lower corner.** In glass-edge native images this is around x418–423, y323–339. The control has a comparatively thin, continuous seam; both the prior rejected candidate and correction show a small rectangular/stepped bright-dark patch to its right. Carmine's red highlight makes it more conspicuous; Estuary also exposes it. The correction did not remove this local feature. The two candidate crops are similar, not pixel-identical.

Severity: **minor/localized but real**, visible on close inspection at native 600×400 and clear in the explicitly labelled 4× nearest-neighbor crops. It is much less extensive than the rejected hood scalloping and does not prevent model/variant rendering. It remains a quality deviation from control; do not call the correction fully visually equivalent. This is an image observation, not a proven causal attribution to a specific primitive or a claim of a physical gap. Parent owns the final acceptance decision.

Strongest evidence:
- `rendered/control--glass-edge--carmine--shaded.png`
- `rendered/safe--glass-edge--carmine--shaded.png` (corrected)
- prior rejected: `../2026-10-21-sol-safe-webgl-comparison/rendered/safe--glass-edge--carmine--shaded.png`
- `native-comparisons/glass-edge--carmine--native-threeway.png`
- `native-comparisons/glass-edge--carmine--seam-nearest4x.png`
- matching Estuary files under `native-comparisons/`.

## Target-by-target sheet observations

- Front three-quarter: both finishes correct; complete vehicle with generous fixed framing; broad appearance close. Whole exterior wireframe is dense/near-solid and only contextual.
- Side: no blank/missing vehicle or gross silhouette failure; subtle body/fender highlight changes remain, not global pixel parity.
- Rear three-quarter: complete rear exterior, correct finishes; no gross shape omission visible at sheet scale.
- Wheel/brake: wheel, spokes and rotor remain visible and framed. Wheel topology is reduced; mild fender/surface-highlight differences. Surrounding vehicle is intentionally cropped.
- Mirror/window: mirror and window form remain visible; reduced detail topology, small body highlight differences; opaque silhouette hides internal detail.
- Wipers: blades/arm assembly remain visible; isolated wireframe is wipers only and cannot prove hood topology. Hood scallop repair visible; residual image-right panel seam also visible natively.
- Panel seams: door outlines/handle region remain visible in both finishes, with small shading/triangulation differences. Wireframe is a topology diagnostic, not a material view.
- Interior: seats retain blue versus red variant identity through exterior glazing. Wireframe dashboard periphery is cropped by the frozen camera; primary seats are visible. Silhouette cannot validate interior forms.
- Glass edge: smooth hood/windshield boundary and roof-adjacent line repaired; small seam notch remains as above. Glass-edge wireframes are identical to control (also verified numerically), but this does not establish surrounding-panel shading parity.

All sheet panels were nonblank and correctly paired. Close-up surrounding-body cropping, dense whole-object wireframes, and opaque hidden-form silhouettes are inherited limitations of the frozen protocol, not new framing changes.
