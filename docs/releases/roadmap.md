# Release Roadmap

This file maps emulator milestone progress to expected release themes. Exact versions can change, but each release should be honest about supported and unsupported Roku behavior.

## 0.1.x: Local Workbench Foundation

Status: current

Theme:
- BrighterScript compile/package/deploy workflow.
- Local Studio preview.
- Standalone `.brs` runner.
- Host-side `roDeviceInfo` and `CreateObject` registry.
- Emulator roadmap and compatibility tracking.

## 0.2.0: BrightScript Runtime Bridge

Expected scope:
- E1-S1 through E1-S3.
- BRS-backed `CreateObject("roDeviceInfo")`.
- Runtime profile overrides visible from BrightScript fixtures.
- Rooibos setup may land here if ready.

## 0.3.0: Core Roku Object Shims

Expected scope:
- `roMessagePort`, `roAppInfo`, `roRegistry`, `roFileSystem`, and `roUrlTransfer` partial support.
- Expanded compatibility matrix.
- Fixture strategy in active use.

## 0.4.0: SceneGraph Node Tree

Expected scope:
- XML parser subset.
- `roSGNode` base behavior.
- Core streaming app node shells.
- Field observers.

## 0.5.0: Input, Focus, And Catalog Runtime

Expected scope:
- Focus model.
- Remote key events.
- Catalog fixture can navigate locally.
- Runtime trace format begins.

## 0.6.0: Video Runtime MVP

Expected scope:
- `Video` node state machine.
- Stream URL validation.
- Browser media adapter for non-DRM sample playback.
- Playback events.

## 0.7.0: Studio Runtime Mode And ECP

Expected scope:
- Studio runtime mode with node tree/log/focus/video inspection.
- Local ECP query and keypress endpoints.
- Deep-link launch model.

## 1.0.0: Emulator MVP

Expected scope:
- Compatibility matrix is complete for MVP APIs.
- Golden fixtures cover catalog, navigation, playback, registry, network, and deep link workflows.
- Optional physical Roku parity lane exists.
- Apple container workflow can run the Studio/runtime mode.
- Release notes clearly state limitations around DRM, codecs, Roku Pay, RAF ads, and certification behavior.
