# Visual observations — FINAL candidate, no final verdict

All nine contact sheets were actually loaded and inspected, all 12 panels per sheet: front-three-quarter, side, rear-three-quarter, wheel-brake, mirror-window, wipers, panel-seams, interior and glass-edge. Columns are control/final in Estuary followed by control/final in Carmine; rows are shaded, wireframe and silhouette. Detailed per-target observations are in `visual-review.json`.

## Seam and preserved hood repair

All four `native-comparisons/*--native-pair.png` images were inspected with native 600×400 control/final panels, labels outside image pixels. Both seam nearest4x crops and all four threeways were also inspected. Threeways were tool-downscaled; the native judgments rely on the separate unscaled pairs, not those overviews.

The previous correction's small rectangular bright-dark patch beside the seam below the image-right windshield corner is absent in FINAL in both finishes. The original thin seam and antialiasing remain. The FINAL seam region visually tracks the control rather than the prior bright/stepped rectangle. Separate diagnostics show **zero changed pixels** against control in both `(415,320,425,342)` and `(418,323,424,340)` crops for both finishes. Pixel identity supports but does not replace the native visual inspection.

The hood-insert highlight remains continuous in both finishes in the wipers and glass-edge pairs. The earlier scalloped hood/glazing-adjacent degradation has not visibly returned. Wipers remain recognizable with no gross contour failure. The body, wheels, mirror/window and panel boundaries show no new obvious blocking defect in the fixed views.

## Remaining limits / concerns

- There are real triangulation and minor raster differences. Whole-frame pixel parity is neither observed nor claimed.
- Overview wireframes are very dense at this scale; filled-looking wireframes are not proof of unchanged topology.
- Interior shaded images are through real glazing, not cutaways. The isolated interior wireframe helps inspect primary forms, but opaque full-scene silhouettes hide interiors and other occluded parts.
- Sheets contain 300×200 thumbnails; the scored source frames remain exactly 600×400 DPR1. Enlarged seam crops are explicitly nearest-neighbor supplements, not new scored renders.
- No new blocking defect was observed in these requested fixed views, but this does not establish arbitrary-camera parity, real-device quality, or final acceptance. The correction budget is exhausted. No geometry edits are authorized.

Final decision and promotion remain outside this package.
