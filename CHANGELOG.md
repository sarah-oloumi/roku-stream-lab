# Changelog

All notable changes to Roku Stream Lab are documented here.

This project follows semantic versioning.

## [0.1.0] - 2026-06-11

### Added

- Local Studio web UI for inspecting project files, previewing the streaming catalog, navigating with remote-style controls, and testing video playback in the browser.
- BrighterScript-first source tree in `src/` with `bsconfig.json`, `.bs` component scripts, imports, namespaces, and source maps.
- Plain BrightScript fallback snapshot in `roku-app/` for dependency-free packaging.
- Roku SceneGraph sample channel with catalog loading, grid selection, and `Video` playback.
- `rokulab` CLI for doctor checks, serving the Studio, packaging, deploy, remote keypresses, and Apple `container` wrappers.
- Apple `container` image with Node.js, `zip`, `curl`, and BrighterScript installed.
- Initial tests for feed validation, CLI help, packaging, and BrighterScript project presence.
