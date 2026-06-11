# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Shape

- `src/` is the canonical BrighterScript source tree.
- `roku-app/` is a plain BrightScript fallback snapshot for dependency-free packaging.
- `content/feed.json` powers the local Studio preview.
- `src/content/feed.json` is packaged into the Roku channel by BrighterScript.
- `studio/` is a zero-dependency browser workbench served by Node.js.
- `scripts/rokulab.mjs` is the CLI entrypoint and should stay dependency-light.

## Development Rules

- Prefer BrighterScript changes in `src/`; update `roku-app/` only when maintaining the fallback snapshot.
- Keep Roku video-streaming workflows central. This project is for catalog, playback, device deploy, and streaming app iteration.
- Do not claim local Roku OS emulation. The browser preview is a companion simulator; true BrightScript/SceneGraph runtime testing requires a physical Roku.
- If `package.json` changes, update `package-lock.json` in the same change.
- Keep generated build output out of git. `dist/` is ignored.
- Use ASCII in source/docs unless a file already has a reason not to.

## Verification

Run these when possible:

```sh
npm run check:bs
npm test
```

If npm or BrighterScript is unavailable, run the zero-dependency test with Node:

```sh
node tests/cli.test.mjs
```

Run the Studio locally with:

```sh
npm run serve
```

Then open `http://127.0.0.1:7070`.

## Release Notes

- Keep `VERSION`, `package.json`, and `CHANGELOG.md` aligned.
- Use semantic versioning.
- Document every user-visible change in `CHANGELOG.md`.
