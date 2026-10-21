# ADR 0001: WebGL2-first real-time baseline

- **Status:** Accepted
- **Decision:** Build the first real-time configurator with Three.js `WebGLRenderer` targeting WebGL2.

## Context

The first study needs a stable browser baseline that can be exercised across desktop and mobile browsers. WebGPU would introduce a second renderer variable before the asset, interaction model, and performance budget are understood.

## Consequences

- WebGL2 is the measured baseline.
- Renderer, browser, GPU string, viewport, and DPR are recorded with performance results.
- A later WebGPU experiment must reuse the same asset, camera, interactions, and benchmark procedure.
- WebGPU is adopted only if profiling identifies a relevant bottleneck or feature that WebGL2 cannot meet.
