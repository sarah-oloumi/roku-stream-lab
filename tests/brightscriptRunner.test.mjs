import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { runBrightScriptFile } from "../src/runtime/brightscriptRunner.mjs";

const root = resolve(import.meta.dirname, "..");
const fixturesDir = join(root, "tests", "fixtures", "brightscript");
const nodeBinDir = dirname(process.execPath);
const runnerEnv = {
  ...process.env,
  PATH: `${nodeBinDir}${process.env.PATH ? `:${process.env.PATH}` : ""}`
};

function runnerOptions(extra = {}) {
  return {
    cwd: root,
    projectRoot: root,
    env: runnerEnv,
    ...extra
  };
}

{
  const result = await runBrightScriptFile(
    join(fixturesDir, "standalone-success.brs"),
    runnerOptions()
  );

  assert.equal(result.status, "ok", result.stderr);
  assert.equal(result.code, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /stream-lab runner fixture/);
  assert.match(result.stdout, /answer=\s*42/);
}

{
  const result = await runBrightScriptFile(
    join(fixturesDir, "runtime-error.brs"),
    runnerOptions()
  );

  assert.equal(result.status, "failed");
  assert.equal(result.code, 1);
  assert.equal(result.processCode, 0);
  assert.match(result.stdout, /before runtime failure/);
  assert.match(`${result.stdout}\n${result.stderr}`, /runtime-error\.brs/i);
  assert.match(`${result.stdout}\n${result.stderr}`, /attempted on non-function/i);
}

{
  const missingPath = join(fixturesDir, "does-not-exist.brs");
  const result = await runBrightScriptFile(missingPath, runnerOptions());

  assert.equal(result.status, "validation-error");
  assert.equal(result.stdout, "");
  assert.equal(result.code, 1);
  assert.match(result.stderr, /BrightScript file not found/);
  assert.match(result.stderr, /does-not-exist\.brs/);
}

{
  const result = await runBrightScriptFile("package.json", runnerOptions());

  assert.equal(result.status, "validation-error");
  assert.equal(result.stdout, "");
  assert.equal(result.code, 1);
  assert.match(result.stderr, /expects a \.brs file/);
  assert.match(result.stderr, /package\.json/);
}

{
  const help = spawnSync(process.execPath, ["scripts/rokulab.mjs", "help"], {
    cwd: root,
    encoding: "utf8",
    env: runnerEnv
  });

  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /run-brs <path-to-file\.brs>/);
}

{
  const run = spawnSync(process.execPath, [
    "scripts/rokulab.mjs",
    "run-brs",
    join(fixturesDir, "standalone-success.brs")
  ], {
    cwd: root,
    encoding: "utf8",
    env: runnerEnv
  });

  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /stream-lab runner fixture/);
  assert.match(run.stdout, /answer=\s*42/);
}

console.log("All BrightScript runner tests passed.");
