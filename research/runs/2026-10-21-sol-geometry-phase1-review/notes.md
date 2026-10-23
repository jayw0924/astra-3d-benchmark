# Phase 1 geometry review notes

## Verdict

Passed after two fail-closed correction cycles. Independent specification/provenance review passed initially. Independent code/data-integrity review found four blocking issue classes; all were reproduced, fixed under regression coverage, and accepted by a fresh independent reviewer. No Astra geometry candidate work began during review.

## Blocking findings and corrections

1. **Symlink containment:** the reporter's lexical path guard allowed a project-relative symlink to resolve outside the project. A red regression test proved the escape. The reporter now resolves both root and source through `realpath` and rejects resolved paths outside the root.
2. **Immutable identity:** protocol v1 used an identifier not present in the manifest. It now pins `web-product-estuary`, exact path, 10,191,496 bytes, and SHA-256 `bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f`.
3. **Report integrity:** schema and manifest checks could accept fabricated measured counts. A red regression test proved this. Research validation now invokes the independent reporter for every geometry report and requires a deep exact match to the pinned available GLB.
4. **Metric semantics:** public and explanatory copy used “render vertices” and “upload vertices” for static file counts. Report/schema fields and current explanations now use `submittedTriangleIndices` and `positionAccessorEntries`, explicitly stating that these are not GPU-upload, unique-transformed-vertex, vertex-shader-work, or draw-call measurements.
5. **Residual terminology:** the first re-review found one public evidence card and three earlier explanatory records still using legacy terms. Those were corrected and protected by component and repository-level terminology tests.

## Independent verification

The final reviewer reported no security concerns or logic errors and verified:

- resolved-path containment;
- exact immutable-control identity;
- byte-for-byte regeneration of all three geometry reports;
- consistent static geometry-count terminology;
- 23 script tests, 18 unit tests, and 6 render-plan tests;
- research validation for 12 assets and 10 runs at the review checkpoint;
- ESLint, TypeScript, Git diff checks, and direct SHA-256/report comparisons.

The reviewer suggested including `src/App.tsx` in the direct terminology scanner in addition to rendered-component assertions; that coverage was added before final validation.

## Attribution and privacy

The review, fixes, tests, and publication corrections are Sol-authored non-Astra work. Evidence images that contain sourced geometry or the Astra-authored Estuary material retain mixed provenance. Private session JSONL evidence remains ignored and is not part of public artifacts or the clean deployment build.
