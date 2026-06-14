# Roku Emulator MVP Milestone

Goal: build Roku Stream Lab into a local Roku development runtime that can execute BrightScript and BrighterScript app code against a tested compatibility layer for the Roku APIs needed by video-streaming SceneGraph channels.

This is a roadmap, not a claim that the repo already emulates Roku OS. Each story must land with meaningful unit tests in the same change. Stories that add Roku-side BrightScript libraries should also add Rooibos coverage.

Supporting docs:

- `docs/compatibility/roku-api-matrix.md` tracks current and planned Roku API support.
- `docs/risks.md` tracks emulator risks and mitigations.
- `docs/adr/` records long-lived architecture decisions.
- `docs/fixtures/README.md` defines the fixture strategy.
- `docs/glossary.md` defines project terminology.
- `docs/releases/roadmap.md` maps milestone progress to release themes.

## Definition Of Done

- A developer can run a Roku video-streaming SceneGraph app locally on a Mac.
- BrightScript and BrighterScript code execute through the local runtime.
- `CreateObject` supports the core components needed by a streaming SceneGraph app.
- SceneGraph XML loads into a local node tree with fields, children, observers, focus, key events, and renderable state.
- A TV-shaped local UI renders enough SceneGraph output to test catalog browsing and video state transitions.
- Device info, app info, registry, filesystem, network transfer, message ports, input, and ECP have documented compatibility contracts.
- Unsupported Roku behavior fails with precise diagnostics instead of silent approximation.
- Unit tests run without a Roku device or Apple container.
- Optional parity tests can compare selected behavior against a physical Roku developer device.

## Ordered Epics

1. E1: BrightScript Runtime Bridge
2. E2: Core Roku Object Model
3. E3: SceneGraph Loader And Node Tree
4. E4: Event Loop, Message Ports, Focus, And Input
5. E5: Video Streaming Runtime
6. E6: Local Renderer And Studio Integration
7. E7: Device, App, Storage, Network, And ECP APIs
8. E8: Test Harness, Rooibos, Fixtures, And Hardware Parity
9. E9: Apple Container Packaging And Developer Workflow
10. E10: Emulator MVP Hardening And Release

## E1: BrightScript Runtime Bridge

Purpose: make BrightScript code call the host runtime instead of only executing standalone language snippets.

### E1-S1: Spike BRS Extension Points

Type: spike

Scope:
- Inspect installed `@rokucommunity/brs` APIs and source.
- Determine whether custom globals or components can be registered cleanly.
- Record whether `CreateObject` can be overridden, extended, or wrapped.

Dependencies: none

Done when:
- A short research note explains the supported integration path.
- A recommendation exists for direct injection vs prelude/wrapper.

### E1-S2: Runtime-Backed `CreateObject` In BRS

Type: story

Scope:
- Make a `.brs` fixture call `CreateObject("roDeviceInfo")`.
- Route that call to `src/runtime/rokuRuntime.mjs`.
- Preserve unsupported component diagnostics.

Dependencies: E1-S1, current host registry

Tests:
- JavaScript unit test running a BRS fixture.
- Fixture asserts `GetModel()`, `GetOSVersion()`, and unsupported component behavior.

### E1-S3: Runtime Profiles For BRS Execution

Type: story

Scope:
- Allow `runBrightScriptFile()` to receive runtime options.
- Pass `deviceInfoProfile` through to BRS-backed `CreateObject`.

Dependencies: E1-S2

Tests:
- BRS fixture sees overridden `roDeviceInfo` values.
- Separate runs do not leak runtime profile state.

### E1-S4: BrighterScript App Entry Execution

Type: story

Scope:
- Compile BrighterScript.
- Run the app entrypoint through the local runtime in a controlled mode.
- Capture logs and runtime diagnostics.

Dependencies: E1-S2, E1-S3

Tests:
- Tiny app fixture starts and emits expected logs.
- Compile diagnostics and runtime diagnostics are separated.

## E2: Core Roku Object Model

Purpose: implement the minimum `CreateObject` component set needed before SceneGraph can run.

### E2-S1: `roMessagePort`

Type: story

Scope:
- Implement queue semantics for posted events.
- Support deterministic waiting/polling without real time sleeps.

Dependencies: E1-S2

Tests:
- FIFO event delivery.
- Empty queue behavior.
- Unsupported timeout behavior is explicit if not implemented.

### E2-S2: `roAppInfo`

Type: story

Scope:
- Read app metadata from manifest/package context.
- Expose supported app info methods through `CreateObject("roAppInfo")`.

Dependencies: E1-S2

Tests:
- Manifest fixture maps to expected app info.
- Missing manifest fields receive documented defaults or diagnostics.

### E2-S3: `roRegistry` And `roRegistrySection`

Type: story

Scope:
- Implement local per-app persistent key/value storage.
- Support test-isolated storage roots.

Dependencies: E1-S2

Tests:
- Read/write/delete behavior.
- Isolation between app IDs and test runs.

### E2-S4: `roFileSystem`

Type: story

Scope:
- Implement package and writable sandbox path model.
- Deny host filesystem escape.

Dependencies: E1-S2

Tests:
- Reads from package fixture.
- Writes only to allowed local sandbox.
- Path traversal fails clearly.

### E2-S5: `roUrlTransfer`

Type: story

Scope:
- Implement deterministic HTTP request support for feeds and metadata.
- Add timeout/error handling suitable for tests.

Dependencies: E1-S2

Tests:
- Local HTTP fixture request succeeds.
- HTTP error and DNS/network failure diagnostics are explicit.

## E3: SceneGraph Loader And Node Tree

Purpose: parse SceneGraph XML and represent it as a tested local node tree.

### E3-S1: Spike SceneGraph XML Contract

Type: spike

Scope:
- Research XML component syntax used by common Roku streaming apps.
- Decide parser strategy and component registry shape.

Dependencies: E1-S4

Done when:
- Supported XML subset is documented.
- Unsupported XML features are listed.

### E3-S2: XML Component Parser

Type: story

Scope:
- Parse component name, extends, script includes, interface fields, and child nodes.

Dependencies: E3-S1

Tests:
- XML fixture parses into expected component definition.
- Unsupported XML emits precise diagnostics.

### E3-S3: `roSGNode` Base Node

Type: story

Scope:
- Implement node type, fields, children, parent, and basic field access.
- Support `CreateObject("roSGNode", "ContentNode")` or equivalent runtime path.

Dependencies: E2-S1, E3-S2

Tests:
- Field set/get.
- Child append/remove.
- Unknown node type fails clearly.

### E3-S4: Core Node Types For Streaming Apps

Type: story

Scope:
- Add `Scene`, `Group`, `Rectangle`, `Label`, `Poster`, `ContentNode`, `MarkupGrid`, `RowList`, `Timer`, `Task`, and `Video` shells.

Dependencies: E3-S3

Tests:
- Each supported node exposes documented fields.
- Unsupported fields are diagnosed or stored according to the selected contract.

## E4: Event Loop, Message Ports, Focus, And Input

Purpose: make app interaction work like a TV remote-driven SceneGraph app.

### E4-S1: Field Observers

Type: story

Scope:
- Implement `ObserveField` and observer callbacks.
- Schedule observer events deterministically.

Dependencies: E3-S3, E2-S1

Tests:
- Observer receives field changes in order.
- No event fires when value does not change, if that matches the selected contract.

### E4-S2: SceneGraph Task Scheduling

Type: story

Scope:
- Implement a local task model for deterministic tests.
- Define supported thread-like behavior without pretending to mirror Roku internals.

Dependencies: E4-S1

Tests:
- Task state transitions.
- Task output field observer behavior.

### E4-S3: Focus Model

Type: story

Scope:
- Track focused node.
- Support focusable lists/grids needed for catalog browsing.

Dependencies: E3-S4, E4-S1

Tests:
- Focus movement through a simple grid.
- Focus loss and invalid focus targets fail predictably.

### E4-S4: Remote Key Events

Type: story

Scope:
- Route Up, Down, Left, Right, Select, Back, Play/Pause, Rewind, FastForward, and Home-like commands.
- Map Studio remote controls into runtime events.

Dependencies: E4-S3

Tests:
- Key events call `onKeyEvent`.
- Focus changes match expected fixture.
- Unsupported keys are ignored or diagnosed by contract.

## E5: Video Streaming Runtime

Purpose: support Roku apps built for video streaming, without claiming codec/DRM parity.

### E5-S1: Video Node State Machine

Type: story

Scope:
- Implement `Video` states such as stopped, buffering, playing, paused, finished, and error.
- Accept `ContentNode` playback metadata.

Dependencies: E3-S4, E4-S1

Tests:
- State transitions for play, pause, resume, stop.
- Invalid content emits error state.

### E5-S2: Stream URL Validation

Type: story

Scope:
- Validate stream URL shape and supported protocols.
- Do not implement DRM or codec certification behavior.

Dependencies: E5-S1

Tests:
- HLS/DASH-like fixture URLs accepted by contract.
- Missing or unsupported URL fails clearly.

### E5-S3: Browser Media Adapter

Type: story

Scope:
- Connect local `Video` node state to browser playback where possible.
- Surface unsupported codec/DRM limitations in the UI.

Dependencies: E5-S1, E6-S1

Tests:
- Host-side state tests with a fake media adapter.
- Browser smoke test for a non-DRM sample stream.

### E5-S4: Playback Events

Type: story

Scope:
- Emit buffering, position, duration, error, and completion events.

Dependencies: E5-S1, E5-S3

Tests:
- Deterministic fake-clock event sequence.
- Error event for failed stream.

## E6: Local Renderer And Studio Integration

Purpose: render enough SceneGraph to make the local Studio useful as an emulator UI.

### E6-S1: Renderer Architecture Spike

Type: spike

Scope:
- Decide DOM vs Canvas renderer for SceneGraph nodes.
- Define render tree contract.

Dependencies: E3-S4

Done when:
- Renderer choice and tradeoffs are documented.
- First supported node set is listed.

### E6-S2: Render Basic Nodes

Type: story

Scope:
- Render `Scene`, `Group`, `Rectangle`, `Label`, `Poster`, and `ContentNode`-driven list labels.

Dependencies: E6-S1

Tests:
- Render tree unit tests.
- Browser screenshot or DOM assertions for a fixture scene.

### E6-S3: Render Lists And Grids

Type: story

Scope:
- Render `MarkupGrid` or `RowList` enough for a video catalog.
- Show focus state.

Dependencies: E4-S3, E6-S2

Tests:
- Fixture catalog renders expected visible items.
- Remote navigation updates focused item.

### E6-S4: Studio Runtime Mode

Type: story

Scope:
- Add a Studio mode that runs the local runtime and shows logs, node tree, focused node, and video state.

Dependencies: E4-S4, E5-S1, E6-S3

Tests:
- Studio API returns runtime status.
- Browser smoke test can load runtime mode.

## E7: Device, App, Storage, Network, And ECP APIs

Purpose: round out Roku OS APIs streaming apps commonly touch.

### E7-S1: Expand `roDeviceInfo`

Type: story

Scope:
- Add display mode, UI resolution, locale, country, network state, RIDA/ad tracking, and model display info.

Dependencies: E1-S2

Tests:
- Contract tests per added method.
- Unsupported device methods remain explicit.

### E7-S2: ECP Query Server

Type: story

Scope:
- Serve selected ECP endpoints locally: `/query/device-info`, `/query/apps`, `/keypress/{key}`, and `/launch/{appId}`.

Dependencies: E4-S4, E7-S1

Tests:
- HTTP endpoint contract tests.
- Keypress endpoint routes into runtime input.

### E7-S3: App Launch And Deep Link Model

Type: story

Scope:
- Model app launch parameters and deep-link arguments.

Dependencies: E7-S2, E1-S4

Tests:
- Launch parameters reach app code.
- Malformed launch payloads fail clearly.

### E7-S4: Network And Clock Profiles

Type: story

Scope:
- Add deterministic locale, time, clock, timezone, network, and offline profiles.

Dependencies: E2-S5, E7-S1

Tests:
- Fake clock controls timers and app-visible time.
- Offline profile causes network APIs to fail predictably.

## E8: Test Harness, Rooibos, Fixtures, And Hardware Parity

Purpose: make emulator behavior trustworthy and prevent drift.

### E8-S1: Rooibos Setup

Type: story

Scope:
- Add Rooibos dependency and command.
- Add first Roku-side unit test for a tiny BrightScript helper.

Dependencies: none

Tests:
- Rooibos command runs locally as documented.
- CI runs Rooibos where possible without hardware.

### E8-S2: Golden App Fixtures

Type: story

Scope:
- Add tiny app fixtures for catalog, navigation, playback, registry, network, and deep link.

Dependencies: E1-S4, E3-S4

Tests:
- Fixture expected outputs are specific and reviewed.
- No broad snapshots without targeted assertions.

### E8-S3: Runtime Trace Format

Type: story

Scope:
- Define stable trace output for logs, CreateObject calls, node changes, key events, and video events.

Dependencies: E4-S4, E5-S4

Tests:
- Trace events are ordered and serializable.
- Sensitive values are redacted where needed.

### E8-S4: Physical Roku Parity Lane

Type: story

Scope:
- Add optional manual or opt-in CI tests against a real Roku developer device.
- Compare selected device API and app behavior with local runtime fixtures.

Dependencies: E8-S2, E8-S3

Tests:
- Parity tests are skipped unless target credentials are provided.
- Failures report local vs physical differences.

## E9: Apple Container Packaging And Developer Workflow

Purpose: make the emulator easy to run consistently on macOS with Apple container.

### E9-S1: Container Runtime Command

Type: story

Scope:
- Add a command to run Studio plus runtime inside Apple container.
- Mount workspace and expose the Studio/runtime ports.

Dependencies: E6-S4

Tests:
- CLI command assembly unit tests.
- Documentation covers prerequisite Apple `container` install.

### E9-S2: Container Health Checks

Type: story

Scope:
- Add health endpoint and `doctor` checks for container runtime mode.

Dependencies: E9-S1

Tests:
- Health endpoint returns runtime status.
- Doctor reports missing container CLI clearly.

### E9-S3: Developer Onboarding Flow

Type: story

Scope:
- Make `npm ci`, `npm test`, `npm run serve`, and container commands the documented happy path.

Dependencies: E9-S2

Tests:
- CLI help includes runtime commands.
- README examples match actual commands.

## E10: Emulator MVP Hardening And Release

Purpose: make the first emulator milestone releasable and honest.

### E10-S1: Compatibility Matrix

Type: story

Scope:
- Document supported Roku components, methods, fields, events, and known unsupported areas.

Dependencies: E1 through E7 stories that add API surface

Tests:
- Matrix generation or validation checks supported contract metadata.

### E10-S2: Error And Diagnostic UX

Type: story

Scope:
- Standardize runtime error messages and Studio diagnostics.

Dependencies: E6-S4, E8-S3

Tests:
- Unsupported API errors include component, method, and story/matrix hint.

### E10-S3: Performance Baseline

Type: story

Scope:
- Measure startup, fixture load, key event latency, and render update latency.

Dependencies: E6-S4

Tests:
- Benchmarks are opt-in and do not make unit tests flaky.

### E10-S4: MVP Release

Type: story

Scope:
- Update version, changelog, README, compatibility matrix, and release assets.
- Create GitHub release.

Dependencies: E10-S1, E10-S2, E10-S3

Tests:
- Full local verification passes.
- Release notes state emulator limitations clearly.

## Immediate Next Stories

1. E1-S1: Spike BRS Extension Points.
2. E1-S2: Runtime-Backed `CreateObject` In BRS.
3. E1-S3: Runtime Profiles For BRS Execution.
4. E8-S1: Rooibos Setup can run in parallel because it does not depend on BRS injection.

## Dependency Summary

| Story | Depends On | Can Start When |
| --- | --- | --- |
| E1-S1 | none | now |
| E1-S2 | E1-S1, current host registry | BRS extension path is chosen |
| E1-S3 | E1-S2 | BRS can call runtime-backed `CreateObject` |
| E1-S4 | E1-S2, E1-S3 | runtime profiles work in BRS |
| E2-S1 | E1-S2 | BRS integration can create runtime objects |
| E2-S2 | E1-S2 | manifest fixture contract is chosen |
| E2-S3 | E1-S2 | app identity model exists or is stubbed |
| E2-S4 | E1-S2 | package/sandbox root contract is chosen |
| E2-S5 | E1-S2 | local HTTP fixture strategy exists |
| E3-S1 | E1-S4 | app entry execution exists |
| E3-S2 | E3-S1 | XML subset is documented |
| E3-S3 | E2-S1, E3-S2 | message ports and XML parsing exist |
| E3-S4 | E3-S3 | base node contract exists |
| E4-S1 | E3-S3, E2-S1 | nodes and message ports exist |
| E4-S2 | E4-S1 | observers exist |
| E4-S3 | E3-S4, E4-S1 | core nodes and observers exist |
| E4-S4 | E4-S3 | focus model exists |
| E5-S1 | E3-S4, E4-S1 | video node shell and observers exist |
| E5-S2 | E5-S1 | video state machine exists |
| E5-S3 | E5-S1, E6-S1 | video state and renderer strategy exist |
| E5-S4 | E5-S1, E5-S3 | media adapter exists |
| E6-S1 | E3-S4 | core node types exist |
| E6-S2 | E6-S1 | renderer strategy exists |
| E6-S3 | E4-S3, E6-S2 | focus and basic rendering exist |
| E6-S4 | E4-S4, E5-S1, E6-S3 | input, video state, and catalog rendering exist |
| E7-S1 | E1-S2 | BRS integration can create device info |
| E7-S2 | E4-S4, E7-S1 | input and expanded device profile exist |
| E7-S3 | E7-S2, E1-S4 | ECP launch and app entry execution exist |
| E7-S4 | E2-S5, E7-S1 | network and device profile contracts exist |
| E8-S1 | none | now |
| E8-S2 | E1-S4, E3-S4 | app execution and core nodes exist |
| E8-S3 | E4-S4, E5-S4 | input and playback events exist |
| E8-S4 | E8-S2, E8-S3 | golden fixtures and trace format exist |
| E9-S1 | E6-S4 | Studio runtime mode exists |
| E9-S2 | E9-S1 | container runtime command exists |
| E9-S3 | E9-S2 | health checks exist |
| E10-S1 | E1 through E7 API stories | supported API surface is broad enough to document |
| E10-S2 | E6-S4, E8-S3 | Studio runtime and trace format exist |
| E10-S3 | E6-S4 | runtime mode exists |
| E10-S4 | E10-S1, E10-S2, E10-S3 | MVP hardening stories are complete |

- E1 must produce BRS integration before app entry execution and most object-model work can be validated in BrightScript.
- E2 object shims provide the foundation for SceneGraph runtime behavior.
- E3 SceneGraph nodes depend on the object model and XML spike.
- E4 eventing depends on nodes and message ports.
- E5 video depends on nodes, observers, and eventing.
- E6 rendering depends on SceneGraph and input.
- E7 ECP and app/device APIs depend on input, device profiles, and app execution.
- E8 test infrastructure supports all epics and can start early.
- E9 container workflow should wrap a useful runtime, not lead it.
- E10 release hardening depends on the emulator being demonstrable.
