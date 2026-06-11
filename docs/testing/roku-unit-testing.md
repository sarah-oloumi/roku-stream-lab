# Roku Unit Testing Principles

Use this guide for all runtime and emulator work in this repository.

## Core Principles

- Tests should improve developer speed and confidence.
- Small tests should be fast, deterministic, and easy to run frequently.
- Write tests against public behavior, not implementation details.
- Do not count file-existence, doc-presence, or repo-policy checks as unit tests.
- Prefer state/output assertions over interaction assertions.
- Test behaviors, not one test per method.
- Tests should be complete enough to understand the important inputs and concise enough to hide irrelevant setup.
- A test should only need to change when the intended behavior changes.
- A bug fix should include the missing regression test.
- A new unsupported runtime case should include a test for the exact diagnostic.

## Required Test Types

- JavaScript unit tests for local runtime host behavior.
- Rooibos tests for Roku-side BrightScript behavior.
- Fixture tests for SceneGraph XML/component loading and expected node state.
- Contract tests for OS/device API shims such as `roDeviceInfo`.

## Rooibos Policy

Rooibos is the standard for BrightScript-side unit tests. When adding Roku-side library code, include Rooibos tests and document the command here.

Initial command placeholder:

```sh
npm run test:brs
```

This command is not wired yet. The next Rooibos setup change must add the dependency, command, sample test, and CI coverage.

## Subagent Review Brief

When a subagent reviews a runtime change, give it only:

- the changed files
- this testing guide
- `.codex/skills/unit-test-roku-runtime/SKILL.md`
- the exact feature contract being implemented

Ask it to answer:

- What public behavior is covered?
- What public behavior is missing tests?
- Are tests asserting state/output rather than private implementation?
- Are unsupported cases explicit?
- Can the tests run locally without Roku hardware or Apple `container`?

## Sources For Principles

The principles are distilled from the unit testing, test doubles, and larger testing guidance in Software Engineering at Google chapters 12-14:

- https://abseil.io/resources/swe-book/html/ch12.html
- https://abseil.io/resources/swe-book/html/ch13.html
- https://abseil.io/resources/swe-book/html/ch14.html
