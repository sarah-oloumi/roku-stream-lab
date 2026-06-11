import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const runtimeDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(runtimeDir, "../..");
const brsBin = process.platform === "win32" ? "brs.cmd" : "brs";

export async function runBrightScriptFile(filePath, options = {}) {
  const cwd = resolve(options.cwd ?? process.cwd());
  const root = resolve(options.projectRoot ?? projectRoot);
  const resolvedFile = typeof filePath === "string" ? resolve(cwd, filePath) : "";
  const command = options.command ?? await findBrsCommand(root);
  const args = [...(options.brsArgs ?? []), resolvedFile].filter(Boolean);

  const validation = await validateBrightScriptFile(filePath, resolvedFile, command, args);
  if (validation) return validation;

  return runCommand(command, args, {
    cwd,
    env: options.env ?? process.env
  });
}

export async function findBrsCommand(root = projectRoot) {
  const local = join(root, "node_modules", ".bin", brsBin);
  try {
    await access(local, constants.X_OK);
    return local;
  } catch {
    return brsBin;
  }
}

async function validateBrightScriptFile(filePath, resolvedFile, command, args) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    return validationFailure("Missing BrightScript file path.", command, args);
  }

  if (extname(resolvedFile).toLowerCase() !== ".brs") {
    return validationFailure(`BrightScript runner expects a .brs file: ${resolvedFile}`, command, args);
  }

  let fileStats;
  try {
    fileStats = await stat(resolvedFile);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return validationFailure(`BrightScript file not found: ${resolvedFile}`, command, args);
    }
    return validationFailure(`Unable to inspect BrightScript file: ${resolvedFile}\n${error.message}`, command, args);
  }

  if (!fileStats.isFile()) {
    return validationFailure(`BrightScript path is not a file: ${resolvedFile}`, command, args);
  }

  return undefined;
}

function validationFailure(message, command, args) {
  return {
    status: "validation-error",
    stdout: "",
    stderr: `${message}\n`,
    command,
    args,
    code: 1,
    signal: null
  };
}

function runCommand(command, args, options) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      const detail = error?.code === "ENOENT"
        ? "BRS CLI not found. Run npm install or put brs on PATH."
        : `Unable to start BRS CLI: ${error.message}`;
      resolvePromise({
        status: "spawn-error",
        stdout,
        stderr: `${stderr}${detail}\n`,
        command,
        args,
        code: 1,
        signal: null
      });
    });

    child.on("close", (code, signal) => {
      const hasDiagnostic = containsBrsDiagnostic(`${stdout}\n${stderr}`);
      const effectiveCode = code === 0 && hasDiagnostic ? 1 : code ?? 1;
      resolvePromise({
        status: effectiveCode === 0 ? "ok" : "failed",
        stdout,
        stderr,
        command,
        args,
        code: effectiveCode,
        processCode: code,
        signal
      });
    });
  });
}

function containsBrsDiagnostic(output) {
  return /(^|\n).+\.brs\(\d+,\d+(?:-\d+)?\):\s+/i.test(output);
}
