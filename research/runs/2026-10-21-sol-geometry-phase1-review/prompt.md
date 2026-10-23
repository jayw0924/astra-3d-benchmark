# Phase 1 geometry fail-closed review

Independently review the frozen geometry protocol, measured baseline, public evidence, provenance, privacy boundary, application copy, validation code, and browser acceptance before any Astra geometry candidate begins.

Requirements:

- Inspect both tracked modifications and untracked Phase 1 artifacts directly.
- Verify every pinned model and image by exact bytes and SHA-256.
- Regenerate geometry reports from their pinned GLBs rather than trusting stored values.
- Verify public desktop and Pixel 7 evidence behavior.
- Fail on security weaknesses, provenance gaps, misleading metric semantics, incorrect immutable-control identity, or unsupported attribution.
- Apply narrowly scoped fixes with regression tests, then request a fresh independent re-review.
- Do not begin Safe WebGL or Mobile LOD candidate work.
