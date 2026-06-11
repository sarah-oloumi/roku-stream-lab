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
