import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  githubPagesProjectUrl,
  normalizedExternalBase,
  normalizedExternalOrigin,
} from "../src/lib/deployment-defaults.ts";
import { parseArgs, stringArg } from "./shared/cli.ts";

type PublishedSurface = "docs" | "guides";

type PagesDeploymentOptions = {
  surface: PublishedSurface;
  targetRepository: string;
  publishedDirectory: string;
  repositoryOwner: string;
  configuredGithubPagesOrigin?: string;
  configuredMainSiteUrl?: string;
  configuredDocsSiteUrl?: string;
  configuredGuidesSiteUrl?: string;
  configuredCustomDomain?: string;
  configuredBase?: string;
};

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

if (isMainModule()) {
  const options = parseArgs(process.argv.slice(2));
  const environment = await configurePagesDeployment({
    surface: parseSurface(stringArg(options.surface)),
    targetRepository: required(
      stringArg(options.targetRepository) || process.env.TARGET_REPOSITORY,
      "--target-repository or TARGET_REPOSITORY",
    ),
    publishedDirectory:
      stringArg(options.publishedDir) ||
      process.env.PUBLISHED_DIRECTORY ||
      path.join(projectDirectory, "published-docs"),
    repositoryOwner: required(
      process.env.GITHUB_REPOSITORY_OWNER,
      "GITHUB_REPOSITORY_OWNER",
    ),
    configuredGithubPagesOrigin: process.env.CONFIGURED_GITHUB_PAGES_ORIGIN,
    configuredMainSiteUrl: process.env.CONFIGURED_MAIN_SITE_URL,
    configuredDocsSiteUrl: process.env.CONFIGURED_DOCS_SITE_URL,
    configuredGuidesSiteUrl: process.env.CONFIGURED_GUIDES_SITE_URL,
    configuredCustomDomain: process.env.CONFIGURED_CUSTOM_DOMAIN,
    configuredBase: process.env.CONFIGURED_SURFACE_BASE,
  });
  const githubEnvironmentFile = required(process.env.GITHUB_ENV, "GITHUB_ENV");
  await fs.appendFile(
    githubEnvironmentFile,
    Object.entries(environment)
      .map(([name, value]) => `${name}=${value}`)
      .join("\n") + "\n",
    "utf8",
  );
}

export async function configurePagesDeployment({
  surface,
  targetRepository,
  publishedDirectory,
  repositoryOwner,
  configuredGithubPagesOrigin,
  configuredMainSiteUrl,
  configuredDocsSiteUrl,
  configuredGuidesSiteUrl,
  configuredCustomDomain,
  configuredBase,
}: PagesDeploymentOptions): Promise<Record<string, string>> {
  const { owner: targetOwner, name: targetName } =
    parseRepository(targetRepository);
  const defaultGithubPagesOrigin = `https://${repositoryOwner}.github.io`;
  const githubPagesOrigin = normalizedExternalOrigin(
    configuredGithubPagesOrigin || defaultGithubPagesOrigin,
  );
  const existingCustomDomain = await readCustomDomain(publishedDirectory);
  const configuredSurfaceUrl =
    surface === "docs" ? configuredDocsSiteUrl : configuredGuidesSiteUrl;
  const customDomain = normalizeCustomDomain(
    configuredCustomDomain ||
      existingCustomDomain ||
      customDomainFromUrl(configuredSurfaceUrl),
  );
  const defaultTargetUrl = githubPagesProjectUrl(
    `https://${targetOwner}.github.io`,
    targetName,
  );
  const surfaceUrl = normalizedExternalBase(
    configuredSurfaceUrl ||
      (customDomain ? `https://${customDomain}/` : defaultTargetUrl),
  );
  const base = normalizeBase(
    configuredBase ||
      (configuredSurfaceUrl || customDomain
        ? new URL(surfaceUrl).pathname
        : `/${targetName}/`),
  );
  const mainSiteUrl = normalizedExternalBase(
    configuredMainSiteUrl ||
      githubPagesProjectUrl(githubPagesOrigin, "micronaut-web"),
  );
  const docsSiteUrl = normalizedExternalBase(
    surface === "docs"
      ? surfaceUrl
      : configuredDocsSiteUrl ||
          githubPagesProjectUrl(githubPagesOrigin, "micronaut-docs-v2"),
  );
  const guidesSiteUrl = normalizedExternalBase(
    surface === "guides"
      ? surfaceUrl
      : configuredGuidesSiteUrl ||
          githubPagesProjectUrl(githubPagesOrigin, "micronaut-guides-v2"),
  );

  return {
    ASTRO_BASE: base,
    DEFAULT_GITHUB_PAGES_ORIGIN: defaultGithubPagesOrigin,
    MICRONAUT_GITHUB_PAGES_ORIGIN: githubPagesOrigin,
    MICRONAUT_MAIN_SITE_URL: mainSiteUrl,
    MICRONAUT_DOCS_SITE_URL: docsSiteUrl,
    MICRONAUT_GUIDES_SITE_URL: guidesSiteUrl,
    ...(customDomain ? { MICRONAUT_CUSTOM_DOMAIN: customDomain } : {}),
  };
}

async function readCustomDomain(
  directory: string,
): Promise<string | undefined> {
  try {
    return (await fs.readFile(path.join(directory, "CNAME"), "utf8")).trim();
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function customDomainFromUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  const url = new URL(value);
  return url.hostname.endsWith(".github.io") ? undefined : url.hostname;
}

function normalizeCustomDomain(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().replace(/\.$/, "");
  if (!/^[a-z\d](?:[a-z\d.-]*[a-z\d])?$/i.test(normalized)) {
    throw new Error(`Invalid custom domain: ${value}`);
  }
  return normalized;
}

function normalizeBase(value: string) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

function parseRepository(value: string) {
  const match = /^([^/]+)\/([^/]+)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Expected owner/repository; received ${value}.`);
  }
  return { owner: match[1], name: match[2] };
}

function parseSurface(value: string | undefined): PublishedSurface {
  if (value === "docs" || value === "guides") {
    return value;
  }
  throw new Error(
    `Expected --surface to be docs or guides; received ${value || "nothing"}.`,
  );
}

function required(value: string | undefined, label: string) {
  if (!value) {
    throw new Error(`Expected ${label}.`);
  }
  return value;
}

function isMainModule() {
  return process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
}
