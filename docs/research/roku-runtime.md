# Roku Runtime Research Snapshot

This repo is moving from a local Studio preview toward a Roku compatibility runtime. The target is not Roku OS redistribution. The target is a clean-room local development runtime that executes app code against documented BrightScript, SceneGraph, and public Roku interfaces.

## Current Reality

- The Studio at `http://127.0.0.1:7070` is a Node-served browser UI.
- The `run-brs` CLI command can execute standalone `.brs` language scripts through RokuCommunity BRS.
- The Studio browser preview does not interpret BrightScript.
- It does not execute SceneGraph components.
- It does not emulate Roku OS.
- Apple `container` is currently an optional way to run the Node server and packaging toolchain. It is not itself the emulator.

## Runtime Target

Build a compatibility runtime in layers:

1. BrightScript execution harness.
2. SceneGraph XML/component loader.
3. SceneGraph node tree, fields, observers, focus, key events, and render mapping.
4. Public Roku component shims such as `roDeviceInfo`, `roAppInfo`, `roRegistry`, `roFileSystem`, `roUrlTransfer`, `roSGScreen`, `roSGNode`, `roMessagePort`, and `roInput`.
5. Configurable device profiles for resolution, model, firmware, locale, network state, display mode, and advertising identifier behavior.
6. Local ECP-compatible server for selected query and keypress endpoints.
7. Golden fixture tests that compare local behavior with expected public contracts.
8. Optional hardware parity tests against real Roku devices.

## Existing Tooling

- RokuCommunity BrighterScript compiles `.bs` to Roku-compatible BrightScript and provides static diagnostics.
- RokuCommunity BRS is an off-Roku BrightScript interpreter. It is a possible foundation for language execution, but it does not emulate Roku UI, Roku Store, or content playback.
- RokuCommunity Rooibos is the intended test framework for Roku-side BrightScript unit tests in this project.

## Current Runtime Slices

- `src/runtime/brightscriptRunner.mjs` runs standalone `.brs` files through RokuCommunity BRS.
- `src/runtime/rokuDeviceInfo.mjs` defines a deterministic, partial `roDeviceInfo` host profile for local runtime work. It supports `GetModel`, `GetModelType`, `GetFriendlyName`, `GetDeviceUniqueId`, `GetOSVersion`, `GetVersion`, and `IsRIDADisabled`.
- `src/runtime/rokuRuntime.mjs` defines the first tiny host-side `CreateObject` registry boundary. It currently supports only `roDeviceInfo`, performs case-insensitive lookup for that component name, preserves canonical component names in metadata, and passes runtime `deviceInfoProfile` overrides through to the `roDeviceInfo` factory.
- The registry is intentionally host-runtime only in this slice. It does not inject `CreateObject` into BRS and does not load or emulate SceneGraph components.
- The default device profile is intentionally synthetic and stable. It is meant for repeatable local tests and user-selectable emulator profiles, not for impersonating a physical Roku model.
- `GetOSVersion()` returns an object with `major`, `minor`, `revision`, and `build` string fields. `GetVersion()` is kept as the deprecated legacy string shape because older apps may still call it.
- `GetDeviceUniqueId()` returns `000000000000` by default, matching the modern deprecated behavior instead of inventing a persistent device identifier.
- Device profile overrides are explicit and limited to the documented profile fields: `model`, `modelType`, `friendlyName`, `deviceUniqueId`, `osVersion`, `version`, and `isRIDADisabled`.
- Unsupported `ifDeviceInfo` methods remain unsupported in this slice. Add each new method with a documented contract and focused unit coverage.
- Unsupported registry components return `undefined` from `createObject(componentName)` and throw a precise `RangeError` from `requireObject(componentName)`. Unknown names should not be approximated to nearby Roku components.

## Public API Areas To Model First

- `CreateObject`
- `roSGScreen`
- `roSGNode`
- `roMessagePort`
- `roDeviceInfo`
- `roAppInfo`
- `roRegistry` and `roRegistrySection`
- `roFileSystem`
- `roUrlTransfer`
- `roInput`
- SceneGraph `Scene`, `Group`, `Rectangle`, `Label`, `ContentNode`, `MarkupGrid`, `Video`, `Timer`, and `Task`
- ECP `/query/device-info`, `/query/apps`, `/keypress/{key}`, and `/launch/{appId}`

## Testing Contract

- Every compatibility feature starts with a documented public contract and tests.
- Unit tests run locally without Roku hardware.
- Unsupported Roku behavior should fail with precise diagnostics, not silent approximations.
- Physical Roku tests are parity checks, not the baseline unit test mechanism.

## Sources

- Roku BrightScript language reference: https://developer.roku.com/dev/docs/brightscript-language-reference
- Roku SceneGraph reference index: https://developer.roku.com/dev/docs/brightscript-language-reference
- Roku `ifDeviceInfo`: https://developer.roku.com/dev/docs/ifdeviceinfo
- Roku External Control Protocol: https://developer.roku.com/dev/docs/external-control-api
- RokuCommunity BRS: https://github.com/rokucommunity/brs
- RokuCommunity BrighterScript: https://github.com/rokucommunity/brighterscript
- RokuCommunity Rooibos: https://github.com/rokucommunity/rooibos
