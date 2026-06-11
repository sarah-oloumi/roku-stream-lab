# Dependency Update Policy

Dependency updates should be deliberate, reviewable, and backed by CI.

## General Rules

- Use `npm ci` in automation.
- Do not manually edit `package-lock.json`; regenerate it with npm.
- Keep Renovate conservative: no automerge, dependency dashboard approval, and CI required.
- Review release notes for toolchain changes before merging dependency PRs.

## Apple Container Submodule

Renovate is configured to detect git submodule updates, but Apple `container` updates are intentionally conservative:

- no automerge
- dependency dashboard approval required
- separate `apple-container` label
- 14 day minimum release age
- CI must pass

The `.gitmodules` file records `branch = 1.0.0` intentionally. Renovate uses that value to propose newer tag updates. Because this is tag-based rather than branch-based, do not use `git submodule update --remote` for this dependency.

To update manually, fetch tags in the submodule and check out the desired tag:

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
