# Roku Stream Lab

Roku Stream Lab is an early local Studio for Roku video streaming apps. It helps you inspect BrightScript and BrighterScript source, preview catalog data, package a sideloadable Roku app, and deploy to a real Roku device.

Current release: `0.1.0`.

It can run directly with Node.js, or inside Apple `container` when the Apple `container` CLI is installed and started.

What works locally:

- edit and inspect the Roku app package
- write modern BrighterScript in `src/` and compile it to Roku-compatible BrightScript
- preview video catalog data in a TV-shaped browser workbench
- test catalog focus movement with remote-style controls
- validate feed shape and playback URLs
- package a sideloadable Roku ZIP
- deploy and send remote keypresses to a real Roku developer device

Important: this does not emulate Roku OS, and the browser preview does not execute BrightScript. Real BrightScript execution, SceneGraph rendering, codecs, DRM, RAF ads, Roku Pay, and certification behavior still require an actual Roku device.

## Requirements

- macOS 26 or newer on Apple silicon for Apple `container`
- Apple `container` installed and started
- Node.js 20+ if running outside the container
- BrighterScript via `npm install` when running outside the container
- A Roku device in developer mode for sideloading and true runtime testing

## Quick Start

```sh
cp .env.example .env
npm install
npm run doctor
npm run serve
```

Open `http://127.0.0.1:7070`.

## Apple Container Workflow

Apple `container` is optional for running the local Studio. It gives you a reproducible Linux toolchain for the Node server and packaging flow; it does not make Roku OS run locally.

```sh
container system start
npm run container-build
npm run container-run
```

Then open `http://127.0.0.1:7070`.

The Apple container mounts this repo at `/workspace`, so edits on your Mac are visible inside the workbench.

The upstream Apple `container` source is pinned as a git submodule at `third_party/apple-container` for traceability and Renovate review. It does not replace the installed `container` CLI. See `docs/dependencies/apple-container.md`.

## BrighterScript Workflow

`src/` is the canonical modern source tree. It supports `.bs`, imports, namespaces, source maps, and compiler diagnostics through RokuCommunity BrighterScript.

```sh
npm run check:bs
npm run build:bs
npm run watch:bs
```

The BrighterScript config lives at `bsconfig.json`. Builds stage compiled BrightScript into `dist/staging` and write the sideloadable app to `dist/streamlab.zip`.

The `roku-app/` folder is a plain BrightScript fallback snapshot so the repo can still package without installed dependencies. Once `brighterscript` is installed, `npm run package` prefers the BrighterScript build.

## Package A Roku App

```sh
npm run package
```

This writes:

```text
dist/streamlab.zip
```

## Deploy To A Roku Device

Enable developer mode on the Roku, note its IP address, and set:

```sh
export ROKU_DEV_TARGET=192.168.1.100
export ROKU_DEV_PASSWORD='your-developer-password'
```

Then run:

```sh
node scripts/rokulab.mjs deploy
```

Only one app can be sideloaded at a time on a Roku developer device, so each deploy replaces the previous sideloaded channel.

## Send Remote Keys

```sh
node scripts/rokulab.mjs remote Home
node scripts/rokulab.mjs remote Select
node scripts/rokulab.mjs remote Back
```

## Project Layout

```text
.github/workflows/ci.yml     CI using npm ci, BrighterScript checks, tests, and audit gate
AGENTS.md                  instructions for AI coding agents
CHANGELOG.md               release history
LICENSE                    MIT license
VERSION                    current release version
container/Dockerfile       Apple container image
content/feed.json          local Studio catalog source
docs/dependencies/         dependency policy notes
bsconfig.json              BrighterScript compiler config
src/                       canonical BrighterScript app source
roku-app/                  plain BrightScript fallback snapshot
scripts/rokulab.mjs        CLI for package/deploy/container workflows
studio/                    local browser workbench
tests/                     zero-dependency verification
third_party/apple-container pinned Apple container source submodule
renovate.json              conservative dependency automation
```

## Next Milestones

- Roku debug protocol viewer
- ECP device discovery
- Roku WebDriver integration for physical-device automation
- channel art generator and Streaming Store asset checklist
- HLS/DASH manifest linting and media ladder reports
