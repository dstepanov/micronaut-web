import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseArgs, stringArg } from "./shared/cli.ts";
import { pruneUnreferencedAstroAssets } from "./prune-surface.ts";
import {
  mergeSharedSurfaceAssets,
  pruneUnusedHashedSurfaceAssets,
} from "./shared/surface-assets.ts";
import { buildDocsVersionOptions } from "./update-docs-version-manifest.ts";
import {
  resolveDeploymentSettings,
  type DeploymentSettings,
} from "../src/lib/deployment-defaults.ts";

type SurfaceUrls = Pick<
  DeploymentSettings,
  "mainSiteUrl" | "docsSiteUrl" | "guidesSiteUrl"
>;

type PublishedDeploymentMetadata = SurfaceUrls & {
  base: string;
};

const deploymentMetadataFile = ".micronaut-deployment.json";
const legacyDeployment: PublishedDeploymentMetadata = {
  base: "/micronaut-docs-v2/",
  mainSiteUrl: "https://micronaut-projects.github.io/micronaut-web/",
  docsSiteUrl: "https://micronaut-projects.github.io/micronaut-docs-v2/",
  guidesSiteUrl: "https://micronaut-projects.github.io/micronaut-guides-v2/",
};

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

if (isMainModule()) {
  const options = parseArgs(process.argv.slice(2));
  const deployment = resolveDeploymentSettings({
    ...process.env,
    MICRONAUT_DEPLOY_SURFACE: "docs",
  });
  await publishDocsSurface({
    distDirectory:
      stringArg(options.dist) || path.join(projectDirectory, "dist"),
    publishedDirectory:
      stringArg(options.publishedDir) || process.env.PUBLISHED_DOCS_DIR,
    version: stringArg(options.version) || process.env.MICRONAUT_DOCS_VERSION,
    base:
      stringArg(options.base) ||
      process.env.ASTRO_BASE ||
      "/micronaut-docs-v2/",
    latest: stringArg(options.latest) !== "false",
    surfaceUrls: deployment,
  });
}

export async function publishDocsSurface({
  distDirectory,
  publishedDirectory,
  version,
  base = "/micronaut-docs-v2/",
  latest = true,
  surfaceUrls,
}: {
  distDirectory: string;
  publishedDirectory?: string;
  version?: string;
  base?: string;
  latest?: boolean;
  surfaceUrls?: SurfaceUrls;
}): Promise<void> {
  if (!publishedDirectory) {
    throw new Error("Expected --published-dir or PUBLISHED_DOCS_DIR.");
  }
  const publishVersion = sanitizeVersion(version);
  await fs.mkdir(publishedDirectory, { recursive: true });
  const previousDeployment = await readDeploymentMetadata(publishedDirectory);
  const resolvedSurfaceUrls =
    surfaceUrls ||
    resolveDeploymentSettings({
      MICRONAUT_DEPLOY_SURFACE: "docs",
    });
  const currentDeployment: PublishedDeploymentMetadata = {
    base: normalizeBase(base),
    mainSiteUrl: resolvedSurfaceUrls.mainSiteUrl,
    docsSiteUrl: resolvedSurfaceUrls.docsSiteUrl,
    guidesSiteUrl: resolvedSurfaceUrls.guidesSiteUrl,
  };

  await copyIfExists(
    path.join(distDirectory, "_astro"),
    path.join(publishedDirectory, "_astro"),
  );
  await mergeSharedSurfaceAssets({
    sourceDirectory: distDirectory,
    targetDirectory: publishedDirectory,
  });
  await copyIfExists(
    path.join(distDirectory, "index.html"),
    path.join(publishedDirectory, "index.html"),
  );
  await copyIfExists(
    path.join(distDirectory, "latest.html"),
    path.join(publishedDirectory, "latest.html"),
  );
  await copyIfExists(
    path.join(distDirectory, "CNAME"),
    path.join(publishedDirectory, "CNAME"),
  );
  await writeNoJekyll(publishedDirectory);

  const versionSource = await docsRootSource(distDirectory, publishVersion);
  await replaceIfExists(
    versionSource,
    path.join(publishedDirectory, publishVersion),
  );
  await writeRedirect(
    path.join(publishedDirectory, `${publishVersion}.html`),
    withBase(base, `/${publishVersion}/`),
    `Micronaut ${publishVersion} docs`,
  );

  if (latest) {
    const latestDirectory = path.join(publishedDirectory, "latest");
    await replaceIfExists(versionSource, latestDirectory);
    await rewriteVersionRootToLatest(
      latestDirectory,
      currentDeployment.base,
      publishVersion,
    );
    await writeRedirect(
      path.join(publishedDirectory, "latest.html"),
      withBase(base, "/latest/"),
      "Micronaut latest docs",
    );
  }

  await writeVersionsJson(publishedDirectory, publishVersion, latest);
  await migratePublishedDeployment(
    publishedDirectory,
    previousDeployment || legacyDeployment,
    currentDeployment,
  );
  await writeDeploymentMetadata(publishedDirectory, currentDeployment);
  await pruneUnusedHashedSurfaceAssets(publishedDirectory);
  await pruneUnreferencedAstroAssets(publishedDirectory);
}

async function docsRootSource(distDirectory: string, version: string) {
  const versionDirectory = path.join(distDirectory, version);
  if (await exists(versionDirectory)) {
    return versionDirectory;
  }
  const latestDirectory = path.join(distDirectory, "latest");
  if (await exists(latestDirectory)) {
    return latestDirectory;
  }
  throw new Error(
    `Expected docs artifact to contain ${versionDirectory} or ${latestDirectory}.`,
  );
}

async function writeVersionsJson(
  directory: string,
  version: string,
  latest: boolean,
) {
  const payload = {
    versions: await buildDocsVersionOptions({
      publishedDirectory: directory,
      version,
      latest,
    }),
  };
  await fs.writeFile(
    path.join(directory, "versions.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
}

/**
 * The docs surface is built once, rooted at the version being published, and
 * that same tree is copied to `/latest`. Without this pass every link, canonical
 * URL, and redirect stub inside `/latest` points back at `/<version>/`, so
 * visitors who enter at `/latest/` are moved onto a version-pinned tree that the
 * next patch release deletes. Re-root the copy so `/latest` links to itself.
 */
async function rewriteVersionRootToLatest(
  latestDirectory: string,
  base: string,
  version: string,
) {
  if (!(await exists(latestDirectory))) {
    return;
  }
  const normalizedBase = normalizeBase(base);
  const versionRoot = `${normalizedBase}${version}`;
  const latestRoot = `${normalizedBase}latest`;

  for (const file of await listTextFiles(latestDirectory)) {
    const source = await fs.readFile(file, "utf8");
    const rewritten = rewriteQuotedUrls(source, (url) =>
      url
        .replaceAll(`${versionRoot}/`, `${latestRoot}/`)
        .replaceAll(`${versionRoot}.html`, `${latestRoot}.html`),
    );
    if (rewritten !== source) {
      await fs.writeFile(file, rewritten, "utf8");
    }
  }
}

/**
 * Rewrites only quoted values that are URLs — HTML attributes, JSON strings,
 * JS string literals. On a root-base deployment the version root is a short
 * path like `/5.1.1/`, and a whole-file replace would also rewrite that string
 * where it appears in documentation prose. Requiring a quoted value that starts
 * like a URL keeps the rewrite to links and leaves body text alone.
 */
function rewriteQuotedUrls(
  source: string,
  rewriteUrl: (url: string) => string,
) {
  return source.replace(
    /(["'])([^"'\n]*)\1/g,
    (match, quote: string, value: string) => {
      if (!isUrlValue(value)) {
        return match;
      }
      const rewritten = rewriteUrl(value);
      return rewritten === value ? match : `${quote}${rewritten}${quote}`;
    },
  );
}

function isUrlValue(value: string) {
  return (
    // Root-relative links, and srcset lists, which start with one.
    value.startsWith("/") ||
    // Absolute and protocol-relative links, including canonical URLs.
    /^(?:https?:)?\/\//.test(value) ||
    // `<meta http-equiv="refresh" content="0;url=…">`.
    /\burl=(?:\/|(?:https?:)?\/\/)/.test(value)
  );
}

async function migratePublishedDeployment(
  directory: string,
  previous: PublishedDeploymentMetadata,
  current: PublishedDeploymentMetadata,
) {
  if (
    normalizeBase(previous.base) === "/" &&
    normalizeBase(current.base) !== "/"
  ) {
    throw new Error(
      `Cannot automatically migrate published docs from the root base to ${current.base}; republish the retained versions for the repository-path deployment.`,
    );
  }
  const replacements = deploymentReplacements(previous, current);
  for (const legacyReplacement of deploymentReplacements(
    legacyDeployment,
    current,
  )) {
    if (!replacements.some(([from]) => from === legacyReplacement[0])) {
      replacements.push(legacyReplacement);
    }
  }
  if (!replacements.length) {
    return;
  }

  for (const file of await listTextFiles(directory)) {
    const source = await fs.readFile(file, "utf8");
    const migrated = replacements.reduce(
      (value, [from, to]) => value.replaceAll(from, to),
      source,
    );
    if (migrated !== source) {
      await fs.writeFile(file, migrated, "utf8");
    }
  }
}

function deploymentReplacements(
  previous: PublishedDeploymentMetadata,
  current: PublishedDeploymentMetadata,
): Array<[string, string]> {
  return [
    [previous.mainSiteUrl, current.mainSiteUrl],
    [previous.docsSiteUrl, current.docsSiteUrl],
    [previous.guidesSiteUrl, current.guidesSiteUrl],
    [normalizeBase(previous.base), normalizeBase(current.base)],
  ].filter(([from, to]) => from !== to) as Array<[string, string]>;
}

async function readDeploymentMetadata(
  directory: string,
): Promise<PublishedDeploymentMetadata | undefined> {
  try {
    const value: unknown = JSON.parse(
      await fs.readFile(path.join(directory, deploymentMetadataFile), "utf8"),
    );
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as PublishedDeploymentMetadata).base === "string" &&
      typeof (value as PublishedDeploymentMetadata).mainSiteUrl === "string" &&
      typeof (value as PublishedDeploymentMetadata).docsSiteUrl === "string" &&
      typeof (value as PublishedDeploymentMetadata).guidesSiteUrl === "string"
    ) {
      return value as PublishedDeploymentMetadata;
    }
    return undefined;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function writeDeploymentMetadata(
  directory: string,
  deployment: PublishedDeploymentMetadata,
) {
  await fs.writeFile(
    path.join(directory, deploymentMetadataFile),
    `${JSON.stringify(deployment, null, 2)}\n`,
    "utf8",
  );
}

async function listTextFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git") {
      continue;
    }
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTextFiles(absolutePath)));
    } else if (entry.isFile() && isTextDeploymentAsset(entry.name)) {
      files.push(absolutePath);
    }
  }
  return files;
}

function isTextDeploymentAsset(file: string) {
  return /\.(?:css|html|js|json|map|svg|txt|webmanifest|xml)$/i.test(file);
}

function normalizeBase(base: string) {
  const withLeadingSlash = base.startsWith("/") ? base : `/${base}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

async function replaceIfExists(source: string, target: string) {
  if (!(await exists(source))) {
    return;
  }
  await fs.rm(target, { force: true, recursive: true });
  await fs.cp(source, target, { recursive: true });
}

async function copyIfExists(source: string, target: string) {
  if (!(await exists(source))) {
    return;
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true });
}

async function exists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeRedirect(file: string, destination: string, title: string) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(
    file,
    [
      "<!doctype html>",
      '<html lang="en">',
      "<head>",
      '  <meta charset="UTF-8" />',
      '  <meta name="robots" content="noindex" />',
      `  <meta http-equiv="refresh" content="0;url=${htmlAttribute(destination)}" />`,
      `  <title>Redirecting to ${htmlText(title)}</title>`,
      "  <script>",
      `    window.location.replace(${JSON.stringify(destination)} + window.location.search + window.location.hash);`,
      "  </script>",
      "</head>",
      "<body>",
      `  <a href="${htmlAttribute(destination)}">Continue to ${htmlText(title)}</a>`,
      "</body>",
      "</html>",
      "",
    ].join("\n"),
    "utf8",
  );
}

async function writeNoJekyll(directory: string) {
  await fs.writeFile(path.join(directory, ".nojekyll"), "", "utf8");
}

function withBase(base: string, target: string) {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedTarget = target.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedTarget}`.replace(/\/{2,}/g, "/");
}

function sanitizeVersion(version: string | undefined) {
  if (!version || !/^\d+\.\d+(?:\.\d+)?(?:[-.][A-Za-z0-9]+)?$/.test(version)) {
    throw new Error(
      `Expected --version to be a Micronaut version such as 4.10.14; received ${version || "nothing"}.`,
    );
  }
  return version;
}

function htmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlText(value: string) {
  return htmlAttribute(value);
}

function isMainModule() {
  return process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
}
