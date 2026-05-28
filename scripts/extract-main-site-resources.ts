import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(rootDir, "src", "content", "main-site");
const outputDir = join(rootDir, "public", "micronaut-assets", "main-site");
const resourcePattern =
  /https?:\/\/micronaut\.io\/wp-content\/uploads\/[^\s)\]>"']+/g;

function cleanResourceUrl(value: string): string {
  return value.replace(/[.,;:!?]+$/g, "");
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(file);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [file] : [];
    }),
  );
  return files.flat().sort();
}

async function collectResourceUrls(): Promise<string[]> {
  const urls = new Set<string>();
  for (const file of await listMarkdownFiles(contentDir)) {
    const markdown = await readFile(file, "utf8");
    for (const match of markdown.matchAll(resourcePattern)) {
      urls.add(cleanResourceUrl(match[0]));
    }
  }
  return Array.from(urls).sort();
}

async function exists(file: string): Promise<boolean> {
  try {
    const fileStat = await stat(file);
    return fileStat.isFile() && fileStat.size > 0;
  } catch {
    return false;
  }
}

function outputFileForUrl(url: string): string {
  const pathname = new URL(url).pathname;
  return join(
    outputDir,
    ...pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part)),
  );
}

async function downloadResource(url: string, file: string): Promise<void> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "micronaut-web-content-sync/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
}

const force = process.argv.includes("--force");
const urls = await collectResourceUrls();
let downloaded = 0;
let skipped = 0;
const failed: string[] = [];

for (const url of urls) {
  const file = outputFileForUrl(url);
  if (!force && (await exists(file))) {
    skipped += 1;
    continue;
  }
  try {
    await downloadResource(url, file);
    downloaded += 1;
  } catch (error: unknown) {
    failed.push(`${url}: ${errorMessage(error)}`);
  }
}

console.log(
  JSON.stringify(
    {
      resources: urls.length,
      downloaded,
      skipped,
      outputDir: relative(rootDir, outputDir),
      failed,
    },
    null,
    2,
  ),
);

if (failed.length > 0) {
  process.exitCode = 1;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
