#!/usr/bin/env node
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { once } from "node:events";
import zlib from "node:zlib";
import { runBrightScriptFile } from "../src/runtime/brightscriptRunner.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "roku-app");
const srcDir = join(root, "src");
const distDir = join(root, "dist");
const stagingDir = join(distDir, "staging");
const defaultZip = join(distDir, "streamlab.zip");
const feedPath = join(root, "content", "feed.json");
const bsconfigPath = join(root, "bsconfig.json");

const commands = {
  doctor,
  package: packageApp,
  "build:bs": buildBrighterScript,
  "check:bs": checkBrighterScript,
  "watch:bs": watchBrighterScript,
  "run-brs": runBrightScript,
  serve,
  deploy,
  remote,
  "container-build": containerBuild,
  "container-run": containerRun,
  help
};

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  const action = commands[command];
  if (!action) {
    fail(`Unknown command "${command}". Run "rokulab help".`);
  }
  await action(args);
}

export async function doctor() {
  const checks = [];
  checks.push(check("Node.js >= 20", Number(process.versions.node.split(".")[0]) >= 20));
  checks.push(check("Roku manifest", await exists(join(appDir, "manifest"))));
  checks.push(check("SceneGraph entry", await exists(join(appDir, "source", "main.brs"))));
  checks.push(check("BrighterScript config", await exists(bsconfigPath)));
  checks.push(check("BrighterScript source", await exists(join(srcDir, "source", "main.bs"))));
  checks.push(check("Content feed", await validateFeed()));

  const bsc = findBsc();
  checks.push(check("BrighterScript compiler", Boolean(bsc), "Optional locally until you run npm install; container image installs bsc globally."));

  const container = spawnSync("container", ["--version"], { encoding: "utf8" });
  checks.push(check("Apple container CLI", container.status === 0, "Install apple/container and run container system start."));

  const target = env("ROKU_DEV_TARGET");
  checks.push(check("ROKU_DEV_TARGET", Boolean(target), "Optional until you deploy to a physical Roku."));

  printChecks(checks);
  if (checks.some((item) => !item.ok && !item.optional)) {
    process.exitCode = 1;
  }
}

export async function packageApp(args = []) {
  const output = resolve(valueAfter(args, "--out") ?? defaultZip);
  const noBsc = args.includes("--no-bsc");
  await mkdir(dirname(output), { recursive: true });
  if (!noBsc && await buildWithBsc(output)) {
    const hash = createHash("sha256").update(await readFile(output)).digest("hex").slice(0, 12);
    console.log(`Packaged with BrighterScript -> ${relative(root, output)} (${hash})`);
    return;
  }

  const sourceDir = await exists(stagingDir) ? stagingDir : appDir;
  const files = await listFiles(sourceDir);
  const entries = [];

  for (const absolute of files) {
    const local = slash(relative(sourceDir, absolute));
    const data = await readFile(absolute);
    entries.push({ name: local, data });
  }

  await writeZip(output, entries);
  const hash = createHash("sha256").update(await readFile(output)).digest("hex").slice(0, 12);
  console.log(`Packaged ${entries.length} files -> ${relative(root, output)} (${hash})`);
}

export async function buildBrighterScript() {
  runBsc(["--project", "bsconfig.json"]);
}

export async function checkBrighterScript() {
  runBsc(["--project", "bsconfig.json", "--create-package", "false", "--copy-to-staging", "false"]);
}

export async function watchBrighterScript() {
  runBsc(["--project", "bsconfig.json", "--watch"]);
}

export async function runBrightScript(args = []) {
  const file = args[0];
  if (!file) {
    fail("Usage: rokulab run-brs <path-to-file.brs>");
  }

  const result = await runBrightScriptFile(file, {
    cwd: process.cwd(),
    projectRoot: root
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== "ok") {
    process.exit(result.code ?? 1);
  }
}

export async function serve(args = []) {
  const port = Number(valueAfter(args, "--port") ?? env("STUDIO_PORT") ?? 7070);
  const host = valueAfter(args, "--host") ?? "127.0.0.1";
  const { createStudioServer } = await import("../studio/server.mjs");
  const server = createStudioServer({ root });
  server.listen(port, host, () => {
    console.log(`Roku Stream Lab running at http://${host}:${port}`);
  });
}

export async function deploy(args = []) {
  const target = valueAfter(args, "--target") ?? env("ROKU_DEV_TARGET");
  const password = valueAfter(args, "--password") ?? env("ROKU_DEV_PASSWORD");
  const username = valueAfter(args, "--username") ?? env("ROKU_DEV_USERNAME") ?? "rokudev";
  const zip = resolve(valueAfter(args, "--zip") ?? defaultZip);

  if (!target || !password) {
    fail("Set ROKU_DEV_TARGET and ROKU_DEV_PASSWORD, or pass --target and --password.");
  }
  if (!(await exists(zip))) {
    await packageApp(["--out", zip]);
  }

  const boundary = `----rokulab-${Date.now()}`;
  const zipData = await readFile(zip);
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="mysubmit"\r\n\r\nInstall\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="archive"; filename="${basename(zip)}"\r\nContent-Type: application/zip\r\n\r\n`),
    zipData,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const response = await requestBuffer({
    hostname: target,
    port: 80,
    method: "POST",
    path: "/plugin_install",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length
    }
  }, body);

  console.log(`Deploy response ${response.statusCode}`);
  console.log(response.body.toString("utf8").slice(0, 1200));
}

export async function remote(args = []) {
  const target = valueAfter(args, "--target") ?? env("ROKU_DEV_TARGET");
  const key = args.find((arg) => !arg.startsWith("--")) ?? "Home";
  if (!target) fail("Set ROKU_DEV_TARGET or pass --target.");

  const response = await requestBuffer({
    hostname: target,
    port: 8060,
    method: "POST",
    path: `/keypress/${encodeURIComponent(key)}`
  });
  console.log(`Sent ${key}: HTTP ${response.statusCode}`);
}

export async function containerBuild() {
  run("container", ["build", "--tag", "roku-stream-lab:latest", "--file", "container/Dockerfile", "."], root);
}

export async function containerRun(args = []) {
  const port = valueAfter(args, "--port") ?? env("STUDIO_PORT") ?? "7070";
  run("container", [
    "run",
    "--rm",
    "--name",
    "roku-stream-lab",
    "--volume",
    `${root}:/workspace`,
    "--publish",
    `127.0.0.1:${port}:7070`,
    "roku-stream-lab:latest"
  ], root);
}

export function help() {
  console.log(`Roku Stream Lab

Usage:
  rokulab doctor
  rokulab build:bs
  rokulab check:bs
  rokulab watch:bs
  rokulab run-brs <path-to-file.brs>
  rokulab serve [--host 127.0.0.1] [--port 7070]
  rokulab package [--out dist/streamlab.zip] [--no-bsc]
  rokulab deploy [--target ip] [--password pass] [--zip dist/streamlab.zip]
  rokulab remote <Home|Up|Down|Left|Right|Select|Back|Play> [--target ip]
  rokulab container-build
  rokulab container-run [--port 7070]
`);
}

export async function validateFeed() {
  try {
    const feed = JSON.parse(await readFile(feedPath, "utf8"));
    return Array.isArray(feed.items) && feed.items.every((item) => item.title && item.streamUrl);
  } catch {
    return false;
  }
}

function env(name) {
  return process.env[name];
}

function check(name, ok, hint = "") {
  return { name, ok, hint, optional: hint.startsWith("Optional") };
}

function printChecks(checks) {
  for (const item of checks) {
    const icon = item.ok ? "ok" : item.optional ? "warn" : "fail";
    console.log(`${icon.padEnd(4)} ${item.name}${item.ok || !item.hint ? "" : ` - ${item.hint}`}`);
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await listFiles(path));
    } else {
      out.push(path);
    }
  }
  return out.sort();
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

async function buildWithBsc(output) {
  const bsc = findBsc();
  if (!bsc) {
    console.log("BrighterScript compiler not found; packaging plain BrightScript snapshot from roku-app/.");
    return false;
  }
  const result = spawnSync(bsc, ["--project", "bsconfig.json", "--outFile", output], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe"
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    fail("BrighterScript build failed.");
  }
  return true;
}

function runBsc(args) {
  const bsc = findBsc();
  if (!bsc) {
    fail("BrighterScript compiler not found. Run npm install, install brighterscript globally, or use the Apple container image.");
  }
  run(bsc, args, root);
}

function findBsc() {
  const local = join(root, "node_modules", ".bin", process.platform === "win32" ? "bsc.cmd" : "bsc");
  if (spawnSync(local, ["--version"], { encoding: "utf8" }).status === 0) {
    return local;
  }
  if (spawnSync("bsc", ["--version"], { encoding: "utf8" }).status === 0) {
    return "bsc";
  }
  return undefined;
}

function run(command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: "inherit" });
  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function slash(path) {
  return path.replaceAll("\\", "/");
}

function requestBuffer(options, body = Buffer.alloc(0)) {
  return new Promise((resolvePromise, reject) => {
    const req = httpRequest(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolvePromise({ statusCode: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    if (body.length) req.write(body);
    req.end();
  });
}

async function writeZip(output, entries) {
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const data = Buffer.from(entry.data);
    const crc = crc32(data);
    const compressed = zlib.deflateRawSync(data, { level: 9 });
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, compressed);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(8, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(compressed.length, 20);
    header.writeUInt32LE(data.length, 24);
    header.writeUInt16LE(name.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(offset, 42);
    central.push(header, name);
    offset += local.length + name.length + compressed.length;
  }

  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  await writeFile(output, Buffer.concat([...chunks, ...central, end]));
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
