# Apple Container Dependency

Roku Stream Lab uses Apple `container` as a local development runtime, not as an application library.

There are two pieces to that dependency:

1. The installed `container` CLI on the developer's Mac.
2. A pinned source submodule at `third_party/apple-container` for traceability and automated update review.

The submodule does not install the CLI. Developers still need the signed Apple `container` installer or another trusted install path. The submodule exists so the repo has an explicit, reviewable pointer to the upstream tool version this project is designed around.

Current pin:

```text
apple/container 1.0.0
```

Useful commands:

```sh
git submodule update --init --recursive
git -C third_party/apple-container describe --tags --always
```

## Update Policy

Renovate is configured to detect git submodule updates, but Apple `container` updates are intentionally conservative:

- no automerge
- dependency dashboard approval required
- separate `apple-container` label
- 14 day minimum release age
- CI must pass

The `.gitmodules` file records `branch = 1.0.0` intentionally. Renovate uses that value to propose newer tag updates. Because this is tag-based rather than branch-based, do not use `git submodule update --remote` for this dependency. To update manually, fetch tags in the submodule and check out the desired tag:

```sh
git -C third_party/apple-container fetch --tags
git -C third_party/apple-container checkout 1.0.0
git add .gitmodules third_party/apple-container
```

When reviewing an Apple `container` update, check upstream release notes for:

- macOS version requirement changes
- CLI flag changes affecting `scripts/rokulab.mjs`
- container build or run semantics
- networking, volume, or port publishing changes
- installer/security notes
