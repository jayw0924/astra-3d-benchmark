# Reusable harness lessons (local note, not a global skill edit)

Scope prohibits modifying profile skill files. Parent may incorporate these after review:

- Fix a comparison matrix as tested data, pin both GLBs, and derive model transforms and all cameras from the control only. Save the control spec before loading a candidate.
- Keep live mesh ancestors enabled for isolated wireframe details; replace ancestor material with color/depth-write-disabled material instead of setting ancestor visibility false.
- Record `renderer.info` with `autoReset=false`, explicitly reset once before the top-level render, and explain internal transmission prepasses; a top-level render can submit the model twice.
- Measure synchronous cold model-material compile before any model render. PMREM setup renders are a distinct setup operation, not a model render.
- Persist both render/finish CPU duration and render/finish/RAF wall duration. In this headless SwiftShader environment RAF intervals reached many seconds while submission timing stayed milliseconds; neither is production GPU throughput.
- Checkpoint every capture and every complete measured context. Multi-session software runs may be terminated; resume missing sessions one process at a time rather than fabricate or discard completed samples.
- Preserve failed request records even when decoded models render. Repair only the affected capture subset, retain superseded raw records, and distinguish historical errors from active-session errors.
- Dense whole-car wireframe and opaque detail silhouettes can be nonblank yet uninformative. Use isolated detail topology, shaded native PNGs and contact-sheet review to establish target visibility; never equate pixel-content checks with visual acceptance.
