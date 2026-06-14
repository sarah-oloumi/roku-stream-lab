# Glossary

## Apple Container

Apple's local container tooling for macOS. In this project it is a workflow/runtime wrapper, not the emulator itself.

## BrightScript Runtime Bridge

The integration layer that lets BrightScript code call Roku Stream Lab's host runtime APIs, beginning with runtime-backed `CreateObject`.

## Compatibility Matrix

The living table in `docs/compatibility/roku-api-matrix.md` that records which Roku APIs are supported, partial, planned, spike-only, or unsupported.

## Emulator

The long-term local runtime target: execute BrightScript/BrighterScript and enough SceneGraph/Roku API behavior to test video-streaming apps locally. It is not a redistributed Roku OS.

## Golden Fixture

A tiny app or script with specific expected runtime behavior. Golden fixtures should use targeted assertions, not broad unreviewed snapshots.

## Host Runtime

The JavaScript runtime code under `src/runtime/` that models Roku components and behavior on the development machine.

## Local Studio

The browser UI served from `studio/`. Today it is a local workbench; later it should gain a runtime mode for inspecting emulator state.

## Parity Test

An optional comparison between local runtime behavior and a physical Roku developer device. Parity tests are not unit tests and should not run unless explicitly enabled.

## Roku-Side Code

BrightScript or BrighterScript code that is meant to run inside a Roku app context.

## SceneGraph Shell

A minimal local implementation of a SceneGraph node or component that exposes documented fields/events without claiming full Roku OS rendering parity.
