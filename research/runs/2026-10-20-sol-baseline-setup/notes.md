# Notes — baseline setup

## Result

The current chat ran as `gpt-5.6-sol` through `openai-codex`, not Astra. It established the repository, research protocol, provenance schemas, asset scorecard, pinned CarConcept asset, Three.js/WebGL2 configurator, and test foundation. These outputs are baseline infrastructure and must not be described as Astra-authored.

## Verified asset observations

- Exact upstream asset: 10,267,996 bytes; SHA-256 `659c592e20aba7afa920db7d14ad767874741384c215ee1df23a5e1c5e1c411c`.
- Served derivative: 10,190,148 bytes; SHA-256 `67b7986109c72f6fcc61745e4e2eef25833fbf5c43fa6ffc0f0cf4e9d9e91f41`.
- `gltf-transform inspect` on the served derivative reported glTF 2.0, `KHR_materials_variants`, required KTX2 texture support, 639,585 render vertices per pass, 162,646 upload vertices, 28 materials, 14 textures, and no animations.
- The served derivative physically excludes the trademark-bearing `License Plate` and `InteriorSteeringEmblem` nodes and their pruned resources; removal is not deferred to runtime.

## Blockers and limits

- Blender is not installed in the Docker execution backend, so no Blender-authored render is claimed.
- The host-side Hermes executable and credentials are not mounted into this backend.
- A verified Astra run therefore requires a fresh host-side Hermes session in the same project directory.
- Initial Playwright browser installation failed because `/tmp` filled; the retry succeeded with the browser cache under the project-local ignored `.cache/` directory.
- Real Chromium and mobile Chromium loaded the KTX2 asset, reached the ready state, changed the material-variant control, and completed without page errors or failed first-party requests. A local screenshot confirmed that the car is visible, correctly framed, and the control panel is legible.
- The exact upstream GLB was moved outside the public tree. A deterministic sanitizer removed the trademark-bearing `License Plate` and `InteriorSteeringEmblem` nodes and pruned their unreferenced resources from the served derivative; both files have separate byte counts and SHA-256 records in the asset manifest.
- Independent review found and drove fixes to semantic research validation, actual Hermes JSONL evidence parsing, provenance lanes, asset records, third-party transcoder licensing, material-change sequencing, GPU resource disposal, keyboard operation, and text contrast. The failed review findings remain visible in session history rather than being rewritten as first-pass success.

## Human intervention

No corrective solution was supplied during the run. The user provided the research goal, preference for Astra, and quality/effort/time balancing criterion.
