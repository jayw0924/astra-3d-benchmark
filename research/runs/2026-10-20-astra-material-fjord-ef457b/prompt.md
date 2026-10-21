You are continuing a documented AI-assisted 3D production benchmark. This is the material-authoring work package. It must remain independently attributable and reviewable.

Read, in order:

1. research/protocol.md
2. research/asset-manifest.json
3. research/runs/2026-10-20-astra-inspection/prompt.md
4. research/runs/2026-10-20-astra-inspection/notes.md
5. research/runs/2026-10-20-astra-inspection/inventory.json
6. scripts/sanitize-model.mjs
7. scripts/validate-research.mjs
8. research/schemas/run.schema.json
9. src/lib/threeViewer.ts

The approved input is the sanitized served derivative:

public/assets/models/product.glb

The immutable upstream source is:

research/assets/upstream/CarConcept.glb

Do not modify or overwrite either input, and do not modify the web application during this work package.

Goal:

Author one original, physically plausible automotive finish as a fourth KHR_materials_variants option while preserving the three supplied variants:

- Carmine Candy
- Pearly Swirly
- Torched Graphite

Choose and name the new finish yourself. Explain the physical material model, artistic rationale, PBR parameters, and expected rendering trade-offs. Do not claim measured visual quality without a rendered visual review.

Requirements:

1. Create a new run directory under research/runs/ with a unique material-work-package run ID.
2. Preserve this exact prompt as prompt.md.
3. Create a deterministic, editable material-authoring script inside the run directory.
4. Read public/assets/models/product.glb and write a separate candidate GLB inside the run directory. Never overwrite the public or upstream models.
5. Add the new finish through KHR_materials_variants.
6. Preserve all three supplied variants and their existing material assignments.
7. The new variant must define a deterministic assignment for every currently variant-mapped primitive. Do not allow interior materials to depend on whichever finish happened to be selected previously.
8. Apply the original finish only where technically and artistically justified. Reuse an explicitly chosen existing interior treatment if the new finish is exterior-only, and document that choice.
9. Preserve geometry, hierarchy, transforms, dimensions, texture payloads, and trademark-node removals unless a serializer-only normalization is unavoidable and documented.
10. Do not reintroduce License Plate or InteriorSteeringEmblem.
11. Do not call external image or 3D generators.
12. Do not install Blender or claim Blender-authored work. If Blender remains unavailable, record that limitation.
13. Do not modify src/, public/, the immutable upstream model, licenses, manifests, protocol, or the accepted inspection run.
14. Run the authoring script twice and prove deterministic output by byte comparison or SHA-256.
15. Inspect the candidate independently and record:
    - bytes and SHA-256;
    - node, mesh, primitive, triangle, and vertex counts;
    - dimensions;
    - material and texture counts;
    - extension declarations;
    - all variant names;
    - variant mapping coverage;
    - absence of the two removed trademark-bearing nodes.
16. Compare the candidate against the approved served derivative and identify every intended and unintended difference.
17. Preserve exact commands, outputs, failures, uncertainty, elapsed time, tool versions, intervention level, and cost basis.
18. Create a complete schema-valid run.json and notes.md with per-output provenance.
19. Include this future evidence descriptor in run.json using the exact current Hermes session ID:

"sessionEvidence": {
  "path": "research/runs/<run-id>/session.jsonl",
  "sessionId": "<exact-current-session-id>"
}

The session export will be created from the host after this session ends. Do not fabricate session.jsonl. Research validation is expected to remain blocked only by the missing private export until that host step occurs; record that honestly.

Use an isolated study-data output inside the run directory rather than updating src/generated/study-data.json during this work package.

Before stopping, verify that no protected files outside the new run directory changed. Stop after producing and self-reviewing the candidate and run evidence. Do not integrate the finish into the public configurator, do not begin geometry or rendering, and do not continue automatically.

Summarize:
- chosen finish;
- implementation;
- deterministic hash;
- technical comparison;
- limitations;
- run ID;
- exact session ID;
- expected validation status.
