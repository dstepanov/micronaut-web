import { createReadStream, promises as fs } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const rootDirectory = path.join(projectDirectory, "dist");
const basePath = normalizeBasePath(process.env.ASTRO_BASE);
const port = Number(process.env.PLAYWRIGHT_PORT || 4339);

createServer(async (request, response) => {
  const requestPath = new URL(request.url || "/", "http://localhost").pathname;
  const relativePath = relativeRequestPath(requestPath);
  if (relativePath === undefined) {
    response.writeHead(404).end();
    return;
  }

  const file = await resolveFile(relativePath);
  if (!file) {
    response.writeHead(404).end();
    return;
  }

  response.writeHead(200, { "content-type": contentType(file) });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(
    `Serving ${rootDirectory} at http://127.0.0.1:${port}${basePath}`,
  );
});

function relativeRequestPath(requestPath: string): string | undefined {
  if (basePath !== "/") {
    const withoutTrailingSlash = basePath.slice(0, -1);
    if (requestPath === withoutTrailingSlash) {
      return "";
    }
    if (!requestPath.startsWith(basePath)) {
      return undefined;
    }
    return requestPath.slice(basePath.length);
  }
  return requestPath.replace(/^\/+/, "");
}

async function resolveFile(relativePath: string): Promise<string | undefined> {
  const candidate = path.resolve(rootDirectory, relativePath);
  if (
    candidate !== rootDirectory &&
    !candidate.startsWith(`${rootDirectory}${path.sep}`)
  ) {
    return undefined;
  }
  try {
    const stats = await fs.stat(candidate);
    if (stats.isFile()) {
      return candidate;
    }
    if (stats.isDirectory()) {
      return path.join(candidate, "index.html");
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function contentType(file: string): string {
  switch (path.extname(file)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function normalizeBasePath(value: string | undefined): string {
  if (!value || value === "/") {
    return "/";
  }
  const absolutePath = value.startsWith("/") ? value : `/${value}`;
  return absolutePath.endsWith("/") ? absolutePath : `${absolutePath}/`;
}
