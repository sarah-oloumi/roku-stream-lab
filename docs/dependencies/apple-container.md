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

See `docs/dependencies/update-policy.md` for Renovate and manual update rules.
