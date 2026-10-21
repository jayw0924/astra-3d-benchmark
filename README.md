# AI-assisted 3D benchmark

This repository contains a reproducible, evidence-backed case study of Astra assisting a realistic 3D content workflow. It includes a controlled baseline, three evidence-verified Astra runs, a blind material comparison, and the selected Estuary Enamel integration.

## Current scope

- licensed source-asset selection, deterministic sanitization, and provenance;
- completed Astra-assisted asset inspection and two isolated material candidates;
- a completed 30-image blind browser-render comparison with a recorded pre-reveal decision;
- a Three.js/WebGL2 configurator serving Estuary Enamel as the selected fourth finish;
- modest standalone geometry authoring remains unperformed because Blender was unavailable;
- methods, failures, interventions, findings, and credits;
- a deferred—not simulated—Unity/Unreal streaming track.

## Commands

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

Research records are validated with:

```bash
npm run research:validate
```

See `research/protocol.md` and `.hermes/plans/2026-10-20_202749-astra-3d-benchmark-showcase.md`.
