# ADR 0002: Streamed engine configurator deferred

- **Status:** Deferred — not implemented
- **Decision:** Do not build Unity or Unreal streaming in phase 1.

## Entry gate

Reconsider streaming only when all of the following exist:

1. a concrete interaction or fidelity requirement the browser implementation cannot satisfy;
2. a target device and concurrency profile;
3. an operating and monthly cost budget;
4. an owner for GPU hosting, authentication, monitoring, and incident response.

## Options to evaluate later

| Option | Runtime/GPU | Session lifecycle | Network | Main tradeoff |
|---|---|---|---|---|
| Unity Render Streaming | Windows/Linux GPU build | per-user or shared sessions | WebRTC signaling and TURN | engine flexibility versus operating burden |
| Unreal Pixel Streaming | packaged UE GPU build | usually per-user session | WebRTC signaling and TURN | high-end fidelity versus GPU cost |
| Managed GPU streaming | vendor-defined | vendor orchestration | vendor edge/WebRTC | lower operations versus lock-in and variable cost |
| Self-hosted GPU instance | team-owned | custom scheduler | custom auth/signaling/TURN | maximum control versus maximum maintenance |

Before implementation, document cold start, bandwidth, authentication, concurrency, observability, data handling, failure recovery, and cost per session for every surviving option.
