# UI polish closeout

Scope: presentation-only changes from clean `90458684debbb4d6b76c693d8379fc0622687611`.
Public title: **AI-assisted 3D Workflow Lab**, Case 01 · CarConcept — materials,
optimization & imagery. Domain, repository, historical run/model IDs and authorship
are unchanged. No new research experiment, asset generation or promotion.

## Changes and causes

- Mobile hero: the one-column grid retained its automatic min-content minimum,
  oversized tightly led heading and intrinsic child widths. Explicit zero-minimum
  tracks/items and bounded wrapping typography fix it; removed `main` overflow
  hiding rather than masking clipped content.
- Mobile navigation: the previous breakpoint explicitly hid all but Geometry.
  Native horizontally scrollable links now expose geometry, configurator, imagery,
  workflows, methods and evidence. Keyboard focus scrolls each link into view;
  links have 44px minimum height and visible focus. No menu state or dependency.
- Decision-first findings directly after the hero link existing result, source,
  viewer, workflow and evidence anchors. Modest Safe savings, interpretive imagery
  and mask-scoped pixel preservation are distinguished; limitations remain visible.
- Angle sampling/source settings, protected pixel counts and repeat measurements
  use native disclosure. Existing detailed settings, failures, attribution,
  unknown cloud costs and cache ambiguity remain retained. Fidelity, frozen
  reflections and edge-spill warnings remain visible beside the images.
- Current published-viewer status replaces stale local-only UI wording. Existing
  canonical public HTML was retrieved successfully before this edit; this is not
  a changed research acceptance gate. README title/deployment-provider wording
  updated only; historical records remain untouched.

## Verification

- RED → GREEN evidence: `work/ui-polish/{hero,nav,findings,disclosure}-*.log`.
- `npm test`: **104 passed** (47 unit, 51 script, 6 render-plan).
- `npm run lint`: passed.
- `npm run research:validate`: passed, **38 assets / 34 runs**.
- `node scripts/validate-case-studies.mjs`: **2 cases** validated (index/intake only).
- `npm run build` and `npm run build:app`: passed. Existing >500 kB viewer chunk
  warning remains; no dependency or renderer changes.
- Production preview served exact `dist/index.html` bytes (`cmp` passed).
- Production-focused E2E: **8 passed**: six new tests across 390, 320 and 1365px,
  plus existing workflow checks in desktop and Pixel 7 layout emulation. Checks
  cover descendant hero bounds/scroll widths, document width with all disclosures
  expanded, keyboard navigation and links, title, disclosure activation and no
  uncaught page errors. The workflow test also decodes/hash-checks its native PNG.
- **2,229 protected files** under `public`, `research` and `src/generated` were
  SHA-256 pinned before editing and are unchanged afterward, including security
  headers, model/image bytes, ledger and public projection. Baseline and logs:
  `work/ui-polish/`. Worktree/.git ownership remains UID 1000. No staged changes.

## Visual review

Actual production screenshots were inspected at desktop **1365×900** and mobile
**390×900**, covering hero/header, findings, location/source pairing, protected
comparison and workflow index: no clipping or unreadable wrapping found in scope.
Ten page/section captures plus two existing native-workflow captures are saved in
`work/ui-polish/screenshots/`. Tall section captures hide only the sticky header
via Playwright screenshot-only styling to avoid overlay artifacts; hero viewport
captures retain the real header. Full native images and text remain unchanged.

Host-visible screenshot examples:

- `/home/jay/projects/external/configurator-demo/work/ui-polish/screenshots/1365-hero.png`
- `/home/jay/projects/external/configurator-demo/work/ui-polish/screenshots/390-hero.png`
- `/home/jay/projects/external/configurator-demo/work/ui-polish/screenshots/1365-findings.png`
- `/home/jay/projects/external/configurator-demo/work/ui-polish/screenshots/390-findings.png`

UI E2Es intentionally abort unchanged GLB requests. They do **not** certify viewer
health, GPU rendering, runtime performance or physical-device fidelity. No heavy
viewer rerun was performed. No Git stage, commit, push or deployment performed;
this is a locally verified, publication-ready UI change awaiting parent review.
