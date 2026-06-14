# Fixture Strategy

Fixtures are small, purpose-built apps and scripts used to prove runtime behavior. They are not sample products.

Planned layout:

```text
tests/fixtures/
  brightscript/
    standalone-success.brs
    runtime-error.brs
    create-object-device-info.brs
  apps/
    catalog-basic/
    video-basic/
    deeplink-basic/
    registry-basic/
    network-basic/
```

Rules:

- Each fixture should test one behavior or workflow.
- Prefer tiny fixtures with visible inputs and expected outputs.
- Do not use broad snapshots as the only assertion.
- Golden app fixtures should include a short README naming the story and behavior under test.
- Fixtures must not require a physical Roku, Apple container, or public network unless explicitly marked as an integration fixture.

The first planned app fixture is `tests/fixtures/apps/catalog-basic`, after BrighterScript app entry execution exists.
