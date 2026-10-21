# Astra execution handoff — superseded

This restart document has been retired. It originally launched the first Astra inspection, but that inspection and the subsequent material, comparison-render, and public-integration packages are complete. Do not use the former launch prompts as the current project plan.

## Current verified state

- The immutable source and sanitized three-variant baseline remain recorded in `research/asset-manifest.json`.
- The evidence-verified Astra inspection is in `research/runs/2026-10-20-astra-inspection/`.
- Astra authored two isolated, deterministic material candidates: Estuary Enamel and Fjord Enamel.
- A Sol-authored controlled browser harness produced 30 blind renders under matched conditions.
- Jay recorded a slight preference for Candidate A before reveal; Candidate A was Estuary Enamel.
- The public configurator serves an exact byte copy of the selected Estuary candidate as a fourth finish. Fjord remains the documented alternative.
- Standalone geometry authoring was not performed because Blender was unavailable.
- Unity/Unreal streaming remains explicitly deferred and is not simulated.

The canonical current records are:

1. `research/runs/2026-10-20-sol-material-ab-render/run.json`
2. `research/runs/2026-10-20-sol-estuary-integration/run.json`
3. `src/generated/study-data.json`

## If the study continues

Create a new, separately timed work package rather than resuming an old Astra session. The clearest remaining experiment is modest separable geometry authoring in an environment with Blender available. Preserve the existing model assets and completed run directories, record a new prompt and run ledger, export authentic session evidence before claiming Astra authorship, and stop for review before public integration.

Run the repository gates from the project root after any new package:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Private redacted session exports remain local evidence unless publication is explicitly approved. Public generated data must contain only the validated run projection, never the private transcript or its descriptor.