# Roku Stream Lab

Roku Stream Lab is a local workbench for building BrightScript/SceneGraph video streaming apps on a Mac with Apple `container`.

It gives you an Android Studio-like loop for the parts Roku can safely support locally:

- edit and inspect the Roku app package
- preview the video catalog in a TV-shaped browser simulator
- test focus movement with remote-style controls
- validate feed shape and playback URLs
- package a sideloadable Roku ZIP
- deploy and send remote keypresses to a real Roku developer device
- run the workbench inside Apple `container`

Important: this does not emulate Roku OS. Real BrightScript execution, SceneGraph rendering, codecs, DRM, RAF ads, Roku Pay, and certification behavior still require an actual Roku device.

## Requirements

- macOS 26 or newer on Apple silicon for Apple `container`
- Apple `container` installed and started
- Node.js 20+ if running outside the container
- A Roku device in developer mode for sideloading and true runtime testing

## Quick Start

```sh
cp .env.example .env
npm run doctor
npm run serve
```

Open `http://127.0.0.1:7070`.

## Apple Container Workflow

```sh
container system start
npm run container-build
npm run container-run
```

Then open `http://127.0.0.1:7070`.

The container mounts this repo at `/workspace`, so edits on your Mac are visible inside the workbench.

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
container/Dockerfile       Apple container image
content/feed.json          local Studio catalog source
docs/PLAN.md               researched plan and constraints
roku-app/                  sideloadable BrightScript app
scripts/rokulab.mjs        CLI for package/deploy/container workflows
studio/                    local browser workbench
tests/                     zero-dependency verification
```

## Next Milestones

- live BrightScript diagnostics through `brighterscript`
- Roku debug protocol viewer
- ECP device discovery
- Roku WebDriver integration for physical-device automation
- channel art generator and Streaming Store asset checklist
- HLS/DASH manifest linting and media ladder reports
