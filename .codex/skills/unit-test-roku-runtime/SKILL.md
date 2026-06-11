---
name: unit-test-roku-runtime
description: Use when adding or changing Roku runtime, BrightScript interpreter, SceneGraph, OS API compatibility, device profile, ECP, packaging, deployment, or local Studio behavior in this repository. Requires test-first or test-same-change development, small deterministic tests, and Rooibos coverage for Roku-side BrightScript behavior where applicable.
---

# Unit Test Roku Runtime

Use this skill before changing runtime behavior. Runtime behavior includes BrightScript execution, SceneGraph nodes, mocked Roku OS APIs, device profiles, ECP endpoints, video state, package/deploy flows, and Studio behavior that represents those systems.

## Non-Negotiables

- Every behavior change gets tests in the same change.
- Prefer a failing test first. If that is impractical, add the test before calling the work done.
- Test public contracts, not private implementation details.
- Tests must be deterministic, local, and fast unless explicitly marked as device/integration tests.
- Do not use a real Roku device for unit tests.
- Do not require Apple `container` for unit tests.
- Do not hide missing runtime support behind broad snapshots. Assert the specific state, event, field, or error.

## Test Layers

1. **JavaScript unit tests**: Local runtime host, parsers, compatibility shims, Studio API, packaging, ECP simulator, device profiles.
2. **Rooibos tests**: BrightScript-side libraries and behavior meant to run inside Roku app code.
3. **Golden fixture tests**: Tiny Roku app fixtures with expected local-runtime node tree, fields, events, logs, and device API responses.
4. **Physical Roku parity tests**: Optional/manual or later CI hardware lane. Never block unit test speed on physical devices.

## Test Design Rules

- Test behaviors, not methods.
- Test state and outputs before interactions or mocks.
- Use real lightweight collaborators when they are fast and deterministic.
- Use test doubles only at process, network, clock, filesystem, device, or hardware boundaries.
- Keep each test complete and concise: all important inputs are visible in the test, irrelevant setup is hidden in helpers.
- Prefer named fixtures over magic literals.
- Make unsupported behavior explicit with tests that assert a clear diagnostic.
- Add regression tests for every bug fix.

## Roku Runtime Expectations

For each emulated Roku feature, define:

- Public API being emulated, for example `CreateObject("roDeviceInfo")` or `roSGNode.ObserveField`.
- Supported methods, fields, and events.
- Unsupported methods, fields, and events with explicit diagnostics.
- Deterministic default device profile.
- Tests for at least one success path and one unsupported/error path.

## Rooibos Rule

Use Rooibos for BrightScript unit tests when behavior belongs inside Roku-side app code. Keep Rooibos tests separate from JavaScript host tests, and make the host test command able to run without a Roku device.

## Before Finishing

Run the relevant checks:

```sh
npm run check:bs
npm test
```

If Rooibos has been added or touched, also run the Rooibos test command documented in `docs/testing/roku-unit-testing.md`.
