import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "public");

export function createStudioServer({ root }) {
  const projectRoot = resolve(root);

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/api/feed") {
        return json(res, JSON.parse(await readFile(join(projectRoot, "content", "feed.json"), "utf8")));
      }
      if (url.pathname === "/api/files") {
        const files = await listInterestingFiles(projectRoot);
        return json(res, { files });
      }
      if (url.pathname === "/api/file") {
        const requested = url.searchParams.get("path") ?? "";
        const absolute = safeJoin(projectRoot, requested);
        return text(res, await readFile(absolute, "utf8"), mime(absolute));
      }
      if (url.pathname === "/api/doctor") {
        const { validateFeed } = await import("../scripts/rokulab.mjs");
        return json(res, {
          feed: await validateFeed(),
          notes: [
            "Local preview validates catalog shape and stream URLs.",
            "Real BrightScript execution still requires a Roku device."
          ]
        });
      }
      if (url.pathname === "/api/package" && req.method === "POST") {
        const { packageApp } = await import("../scripts/rokulab.mjs");
        await packageApp([]);
        return json(res, { ok: true, artifact: "dist/streamlab.zip" });
      }

      const asset = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      const absolute = safeJoin(publicDir, asset);
      return sendFile(res, absolute);
    } catch (error) {
      res.writeHead(error.statusCode ?? 500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

async function sendFile(res, path) {
  const data = await readFile(path);
  res.writeHead(200, { "content-type": mime(path) });
  res.end(data);
}

function json(res, value) {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(value, null, 2));
}

function text(res, value, contentType = "text/plain") {
  res.writeHead(200, { "content-type": contentType });
  res.end(value);
}

function safeJoin(base, requested) {
  const absolute = resolve(base, requested);
  if (!absolute.startsWith(resolve(base))) {
    const error = new Error("Path escapes project root.");
    error.statusCode = 400;
    throw error;
  }
  return absolute;
}

async function listInterestingFiles(projectRoot) {
  const roots = ["roku-app", "content", "docs", "container", "scripts"];
  const files = [];
  for (const folder of roots) {
    files.push(...await walk(join(projectRoot, folder), projectRoot));
  }
  return files.sort();
}

async function walk(dir, projectRoot) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(absolute, projectRoot));
    } else {
      out.push(relative(projectRoot, absolute));
    }
  }
  return out;
}

function mime(path) {
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".brs": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8"
  }[extname(path)] ?? "application/octet-stream";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(here, "..");
  const portArg = process.argv[process.argv.indexOf("--port") + 1];
  const hostArg = process.argv[process.argv.indexOf("--host") + 1];
  const port = Number(portArg && !portArg.startsWith("--") ? portArg : process.env.STUDIO_PORT ?? 7070);
  const host = hostArg && !hostArg.startsWith("--") ? hostArg : "127.0.0.1";
  createStudioServer({ root }).listen(port, host, () => {
    console.log(`Roku Stream Lab running at http://${host}:${port}`);
  });
}
