import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { validateFeed } from "../scripts/rokulab.mjs";

const root = resolve(import.meta.dirname, "..");
const node = process.execPath;

assert.equal(await validateFeed(), true, "feed should be valid");
assert.ok(await stat(join(root, "bsconfig.json")), "bsconfig.json should exist");
assert.ok(await stat(join(root, "src", "source", "main.bs")), "BrighterScript source should exist");

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
