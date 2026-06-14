# Roku API Compatibility Matrix

This matrix is the living contract for emulator support. Every story that adds, changes, or removes Roku API behavior must update this file in the same change.

Status values:

- `supported`: implemented and covered by unit tests.
- `partial`: implemented for a documented subset and covered by tests.
- `planned`: not implemented yet, but in the milestone roadmap.
- `spike`: needs research before implementation.
- `unsupported`: intentionally unavailable or out of scope for the emulator.

## Runtime Entry Points

| API | Status | Story | Tests | Notes |
| --- | --- | --- | --- | --- |
| Standalone `.brs` execution | partial | pre-roadmap | `tests/brightscriptRunner.test.mjs` | Uses RokuCommunity BRS. Does not include SceneGraph or Roku OS APIs. |
| Host runtime object registry | partial | pre-roadmap | `tests/rokuRuntime.test.mjs` | Supports host-side `createObject("roDeviceInfo")`; not injected into BRS yet. |
| BRS-backed `CreateObject` | planned | E1-S2 | planned | Depends on E1-S1 spike. |
| BrighterScript app entry execution | planned | E1-S4 | planned | Requires runtime-backed `CreateObject` and runtime profiles. |

## BrightScript Components

| Component | Status | Story | Supported Surface | Tests | Notes |
| --- | --- | --- | --- | --- | --- |
| `roDeviceInfo` | partial | pre-roadmap, E7-S1 | `GetModel`, `GetModelType`, `GetFriendlyName`, `GetDeviceUniqueId`, `GetOSVersion`, `GetVersion`, `IsRIDADisabled` | `tests/rokuDeviceInfo.test.mjs`, `tests/rokuRuntime.test.mjs` | Defaults are deterministic and synthetic. `GetDeviceUniqueId()` defaults to `000000000000`. |
| `roMessagePort` | planned | E2-S1 | planned | planned | Needed for SceneGraph event delivery. |
| `roAppInfo` | planned | E2-S2 | planned | planned | Should map from manifest/app context. |
| `roRegistry` | planned | E2-S3 | planned | planned | Must be isolated per app/test root. |
| `roRegistrySection` | planned | E2-S3 | planned | planned | Paired with `roRegistry`. |
| `roFileSystem` | planned | E2-S4 | planned | planned | Must not escape package/sandbox roots. |
| `roUrlTransfer` | planned | E2-S5 | planned | planned | Deterministic local HTTP fixtures first. |
| `roSGScreen` | planned | E3/E4 | planned | planned | Requires SceneGraph node tree and event model. |
| `roSGNode` | planned | E3-S3 | planned | planned | Base for SceneGraph runtime. |
| `roInput` | planned | E7-S3 | planned | planned | Needed for launch/deep-link payloads. |

## SceneGraph Nodes

| Node | Status | Story | Tests | Notes |
| --- | --- | --- | --- | --- |
| XML component definitions | spike | E3-S1 | planned | Parser strategy must be chosen first. |
| `Scene` | planned | E3-S4 | planned | Depends on `roSGNode`. |
| `Group` | planned | E3-S4 | planned | Basic container node. |
| `Rectangle` | planned | E3-S4 | planned | Needed for basic rendering tests. |
| `Label` | planned | E3-S4 | planned | Needed for catalog/text rendering. |
| `Poster` | planned | E3-S4 | planned | Needed for video thumbnails. |
| `ContentNode` | planned | E3-S4 | planned | Needed for catalog and video metadata. |
| `MarkupGrid` | planned | E3-S4, E6-S3 | planned | Catalog navigation target. |
| `RowList` | planned | E3-S4, E6-S3 | planned | Common streaming app catalog pattern. |
| `Timer` | planned | E3-S4, E7-S4 | planned | Should use deterministic fake clock. |
| `Task` | planned | E4-S2 | planned | Must not pretend to mirror Roku threading internals. |
| `Video` | planned | E5-S1 | planned | State-machine first; browser media adapter later. |

## Event, Input, And ECP

| API | Status | Story | Tests | Notes |
| --- | --- | --- | --- | --- |
| Field observers | planned | E4-S1 | planned | Required for SceneGraph behavior. |
| Focus model | planned | E4-S3 | planned | Required for remote navigation. |
| Remote key events | planned | E4-S4 | planned | Up, Down, Left, Right, Select, Back, Play/Pause first. |
| `/query/device-info` | planned | E7-S2 | planned | Backed by `roDeviceInfo` profile. |
| `/query/apps` | planned | E7-S2 | planned | Backed by app registry/context. |
| `/keypress/{key}` | planned | E7-S2 | planned | Routes into runtime input. |
| `/launch/{appId}` | planned | E7-S2, E7-S3 | planned | Needed for deep-link testing. |

## Video Streaming

| Feature | Status | Story | Tests | Notes |
| --- | --- | --- | --- | --- |
| Video node state machine | planned | E5-S1 | planned | No codec/DRM parity claim. |
| Stream URL validation | planned | E5-S2 | planned | HLS/DASH URL shape first. |
| Browser media adapter | planned | E5-S3 | planned | Use fake adapter for unit tests. |
| Playback events | planned | E5-S4 | planned | Use fake clock for deterministic events. |
| DRM, RAF ads, Roku Pay, certification behavior | unsupported | none | none | Requires physical Roku/device ecosystem behavior and is out of local emulator MVP scope. |

## Test And Parity

| Area | Status | Story | Tests | Notes |
| --- | --- | --- | --- | --- |
| JavaScript runtime tests | supported | ongoing | `npm test` | Required for host runtime behavior. |
| Rooibos setup | planned | E8-S1 | planned | Required for Roku-side BrightScript libraries. |
| Golden app fixtures | planned | E8-S2 | planned | Avoid broad snapshots; use targeted assertions. |
| Runtime trace format | planned | E8-S3 | planned | Logs, object creation, node changes, key events, video events. |
| Physical Roku parity lane | planned | E8-S4 | planned | Optional/manual or opt-in CI only. |
