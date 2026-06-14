# Roku Emulator Risk Register

This register tracks risks that could change emulator scope, design, or schedule. Keep mitigations concrete and update this file when a spike resolves a risk.

| ID | Risk | Impact | Likelihood | Mitigation | Owner Story |
| --- | --- | --- | --- | --- | --- |
| R1 | RokuCommunity BRS may not expose clean hooks for runtime-backed `CreateObject`. | High | Medium | Run E1-S1 before BRS integration; choose direct injection only if supported, otherwise use a documented wrapper/prelude path. | E1-S1 |
| R2 | SceneGraph behavior may be much larger than the initial node model suggests. | High | High | Start with a documented XML/node subset, golden fixtures, and explicit unsupported diagnostics. | E3-S1, E3-S4 |
| R3 | Exact Roku event loop timing may be hard to reproduce locally. | High | Medium | Use deterministic scheduling and fake clocks for unit tests; document differences from physical devices. | E4-S1, E7-S4 |
| R4 | Browser playback cannot match Roku codec, DRM, RAF ad, or certification behavior. | High | High | Limit MVP to video state, URL validation, and non-DRM browser playback; keep DRM/certification unsupported in matrix. | E5 |
| R5 | Host filesystem/network access could accidentally exceed Roku sandbox semantics. | Medium | Medium | Implement explicit package/sandbox roots and deterministic network profiles. | E2-S4, E2-S5 |
| R6 | Compatibility docs may drift from implementation. | Medium | Medium | Require API stories to update `docs/compatibility/roku-api-matrix.md` in the same change as code/tests. | E10-S1 |
| R7 | Physical Roku parity tests may be flaky or hard to automate. | Medium | Medium | Keep hardware tests optional/manual or opt-in CI; never make them required for unit test runs. | E8-S4 |
| R8 | Apple container may add platform/version constraints unrelated to emulator correctness. | Medium | Medium | Keep unit tests independent of Apple container; use container only for workflow packaging/runtime command. | E9 |
| R9 | Scope creep may turn the emulator into an unbounded Roku OS clone attempt. | High | Medium | Keep stories small, update the matrix, and mark unsupported areas honestly. | all |
