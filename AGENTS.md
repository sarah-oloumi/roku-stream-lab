# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Shape

- `src/` is the canonical BrighterScript source tree.
- `roku-app/` is a plain BrightScript fallback snapshot for dependency-free packaging.
- `content/feed.json` powers the local Studio preview.
- `src/content/feed.json` is packaged into the Roku channel by BrighterScript.
- `studio/` is a zero-dependency browser workbench served by Node.js.
- `scripts/rokulab.mjs` is the CLI entrypoint and should stay dependency-light.
- `third_party/apple-container` is a git submodule pinned to the upstream Apple `container` source for traceability; the installed `container` CLI is still a system prerequisite.
- `.codex/skills/unit-test-roku-runtime/SKILL.md` is the repo-local skill for runtime test discipline.
- `docs/research/roku-runtime.md` records the current Roku runtime/emulation research snapshot.
- `docs/testing/roku-unit-testing.md` records the unit testing principles and subagent review brief.

## Development Rules

- Prefer BrighterScript changes in `src/`; update `roku-app/` only when maintaining the fallback snapshot.
- Keep Roku video-streaming workflows central. This project is for catalog, playback, device deploy, and streaming app iteration.
- Do not claim local Roku OS emulation. The browser preview is a companion simulator; true BrightScript/SceneGraph runtime testing requires a physical Roku.
- For runtime/emulator work, load `.codex/skills/unit-test-roku-runtime/SKILL.md` before editing.
- Every behavior change must include tests in the same change.
- Use Rooibos for Roku-side BrightScript unit tests once Roku-side runtime libraries are added.
- If `package.json` changes, update `package-lock.json` in the same change.
- Use `npm ci` for dependency installation in automation and verification.
- Do not manually edit `package-lock.json`; regenerate it with npm.
- Keep Renovate conservative: no automerge, dependency dashboard approval, and CI required.
- Apple `container` submodule updates are tag-based through `.gitmodules` `branch = <tag>`; do not move it to `main`.
- Dependency update rules live in `docs/dependencies/update-policy.md`.
- Keep generated build output out of git. `dist/` is ignored.
- Use ASCII in source/docs unless a file already has a reason not to.

## Verification

Run these when possible:

```sh
npm ci
npm run check:bs
npm test
npm audit --audit-level=high
```

Runtime/emulator changes must also explain which unit tests cover the new behavior and which Roku APIs remain unsupported.

Initialize submodules when cloning or validating from a fresh checkout:

```sh
git submodule update --init --recursive
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
