# Public render gallery repair

## Root cause

The deployed section was not experiencing failed image requests: `src/App.tsx` rendered three text-only status cards and contained no `<img>` elements. The blank panels were therefore the implemented placeholder-like layout, despite being labeled “Captured and verified.”

## Repair

The public gallery now serves exact copies of three verified Candidate A renders, revealed before this package as Estuary Enamel:

- viewer-light front three-quarter;
- neutral-light front three-quarter;
- neutral-light mirror and paint close-up.

No image was regenerated or edited. Each public image is registered in the asset manifest with its exact byte count, SHA-256, mixed provenance, inherited license, and source render package. Application code, styling, accessible alt text, and regression coverage are Sol-authored and are not attributed to Astra.

## Acceptance

All acceptance gates passed. Unit and repository tests, ESLint, research validation/build, TypeScript, and the Vite production build succeeded. Real desktop and Pixel 7 Chromium checks each loaded all three exact 600×400 gallery images with non-zero natural dimensions, loaded the configured GLB, switched to Estuary, and reported no page errors or failed requests. The mobile viewport check also passed.
