import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { validateFeed } from "../scripts/rokulab.mjs";

const root = resolve(import.meta.dirname, "..");
const node = process.execPath;

assert.equal(await validateFeed(), true, "feed should be valid");
assert.ok(await stat(join(root, "AGENTS.md")), "AGENTS.md should exist");
assert.ok(await stat(join(root, "CHANGELOG.md")), "CHANGELOG.md should exist");
assert.ok(await stat(join(root, "LICENSE")), "LICENSE should exist");
assert.ok(await stat(join(root, "VERSION")), "VERSION should exist");
assert.ok(await stat(join(root, "package-lock.json")), "package-lock.json should exist");
assert.ok(await stat(join(root, ".gitmodules")), ".gitmodules should exist");
assert.ok(await stat(join(root, ".github", "workflows", "ci.yml")), "CI workflow should exist");
assert.ok(await stat(join(root, "renovate.json")), "renovate.json should exist");
assert.ok(await stat(join(root, "docs", "dependencies", "apple-container.md")), "Apple container dependency docs should exist");
assert.ok(await stat(join(root, "docs", "research", "roku-runtime.md")), "Roku runtime research docs should exist");
assert.ok(await stat(join(root, "docs", "testing", "roku-unit-testing.md")), "Roku unit testing docs should exist");
assert.ok(await stat(join(root, ".codex", "skills", "unit-test-roku-runtime", "SKILL.md")), "Repo-local unit test skill should exist");
assert.ok(await stat(join(root, "bsconfig.json")), "bsconfig.json should exist");
assert.ok(await stat(join(root, "src", "source", "main.bs")), "BrighterScript source should exist");

const unitTestSkill = await readFile(join(root, ".codex", "skills", "unit-test-roku-runtime", "SKILL.md"), "utf8");
assert.match(unitTestSkill, /name: unit-test-roku-runtime/);
assert.match(unitTestSkill, /Every behavior change gets tests/);
assert.match(unitTestSkill, /Rooibos/);

const runtimeResearch = await readFile(join(root, "docs", "research", "roku-runtime.md"), "utf8");
assert.match(runtimeResearch, /does not interpret BrightScript/);
assert.match(runtimeResearch, /RokuCommunity BRS/);
assert.match(runtimeResearch, /RokuCommunity Rooibos/);

const testingGuide = await readFile(join(root, "docs", "testing", "roku-unit-testing.md"), "utf8");
assert.match(testingGuide, /Write tests against public behavior/);
assert.match(testingGuide, /Subagent Review Brief/);
assert.match(testingGuide, /npm run test:brs/);

const help = spawnSync(node, ["scripts/rokulab.mjs", "help"], { cwd: root, encoding: "utf8" });
assert.equal(help.status, 0);
assert.match(help.stdout, /Roku Stream Lab/);
assert.match(help.stdout, /check:bs/);

const packaged = spawnSync(node, ["scripts/rokulab.mjs", "package"], { cwd: root, encoding: "utf8" });
assert.equal(packaged.status, 0, packaged.stderr);
assert.match(packaged.stdout, /Packaged/);

const zipPath = join(root, "dist", "streamlab.zip");
const zip = await readFile(zipPath);
assert.equal(zip.slice(0, 4).toString("hex"), "504b0304", "zip should start with a local file header");
assert.ok((await stat(zipPath)).size > 1000, "zip should contain the Roku app");

console.log("All CLI tests passed.");
