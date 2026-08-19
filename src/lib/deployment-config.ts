import {
  resolveDeploymentSettings,
  type DeploySurface,
} from "./deployment-defaults.ts";

export type { DeploySurface } from "./deployment-defaults.ts";
export type SurfaceTarget = "main" | "docs" | "guides";
type DeploymentImportMeta = ImportMeta & {
  readonly env?: {
    readonly DEFAULT_GITHUB_PAGES_ORIGIN?: string;
    readonly MICRONAUT_DEPLOY_SURFACE?: DeploySurface;
    readonly MICRONAUT_DOCS_ROOT?: string;
    readonly MICRONAUT_DOCS_LATEST_ROOT?: string;
    readonly MICRONAUT_GUIDES_ROOT?: string;
    readonly MICRONAUT_GUIDES_LATEST_ROOT?: string;
    readonly MICRONAUT_GITHUB_PAGES_ORIGIN?: string;
    readonly MICRONAUT_MAIN_SITE_URL?: string;
    readonly MICRONAUT_DOCS_SITE_URL?: string;
    readonly MICRONAUT_GUIDES_SITE_URL?: string;
  };
};

const metaEnv = (import.meta as DeploymentImportMeta).env;
const importMetaEnvValues = {
  DEFAULT_GITHUB_PAGES_ORIGIN: metaEnv?.DEFAULT_GITHUB_PAGES_ORIGIN,
  MICRONAUT_DEPLOY_SURFACE: metaEnv?.MICRONAUT_DEPLOY_SURFACE,
  MICRONAUT_DOCS_ROOT: metaEnv?.MICRONAUT_DOCS_ROOT,
  MICRONAUT_DOCS_LATEST_ROOT: metaEnv?.MICRONAUT_DOCS_LATEST_ROOT,
  MICRONAUT_GUIDES_ROOT: metaEnv?.MICRONAUT_GUIDES_ROOT,
  MICRONAUT_GUIDES_LATEST_ROOT: metaEnv?.MICRONAUT_GUIDES_LATEST_ROOT,
  MICRONAUT_GITHUB_PAGES_ORIGIN: metaEnv?.MICRONAUT_GITHUB_PAGES_ORIGIN,
  MICRONAUT_MAIN_SITE_URL: metaEnv?.MICRONAUT_MAIN_SITE_URL,
  MICRONAUT_DOCS_SITE_URL: metaEnv?.MICRONAUT_DOCS_SITE_URL,
  MICRONAUT_GUIDES_SITE_URL: metaEnv?.MICRONAUT_GUIDES_SITE_URL,
} as const;
const processEnv =
  typeof process === "undefined"
    ? {}
    : (process.env as Record<string, string | undefined>);
const deploymentSettings = resolveDeploymentSettings({
  ...processEnv,
  ...definedValues(importMetaEnvValues),
});

export const deploySurface = deploymentSettings.deploySurface;
export const docsRoot = normalizedRoot(deploymentSettings.docsRoot);
export const docsLatestRoot = normalizedRoot(deploymentSettings.docsLatestRoot);
export const guidesRoot = normalizedRoot(deploymentSettings.guidesRoot);
export const guidesLatestRoot = normalizedRoot(
  deploymentSettings.guidesLatestRoot,
);
export const githubPagesOrigin = deploymentSettings.githubPagesOrigin;

export const externalSurfaceUrls: Record<"main" | "docs" | "guides", string> = {
  main: deploymentSettings.mainSiteUrl,
  docs: deploymentSettings.docsSiteUrl,
  guides: deploymentSettings.guidesSiteUrl,
};

export function routeForSurface(surface: SurfaceTarget, path = "/") {
  if (surface === "docs") {
    return docsRoute(path);
  }
  if (surface === "guides") {
    return guidesRoute(path);
  }
  return normalizeAbsolutePath(path);
}

export function routeForCurrentDeployment(path: string) {
  if (
    !path ||
    path.startsWith("#") ||
    hasSchemeOrProtocolRelativeUrl(path) ||
    !path.startsWith("/")
  ) {
    return path;
  }
  if (deploySurface === "docs") {
    if (path === "/" || path === "") {
      return "/";
    }
    if (isDocsPath(path)) {
      return docsRoute(path);
    }
    if (isGuidesPath(path)) {
      return externalSurfacePath("guides", path);
    }
    if (isMainSurfacePath(path)) {
      return externalSurfacePath("main", path);
    }
    return normalizeAbsolutePath(path);
  }
  if (deploySurface === "guides") {
    if (path === "/" || path === "") {
      return directoryRoot(guidesLatestRoot);
    }
    if (isGuidesPath(path)) {
      return guidesRoute(path);
    }
    if (isDocsPath(path)) {
      return externalSurfacePath("docs", path);
    }
    if (isMainSurfacePath(path)) {
      return externalSurfacePath("main", path);
    }
    return normalizeAbsolutePath(path);
  }
  if (deploySurface === "main") {
    if (isDocsPath(path)) {
      return externalSurfacePath("docs", path);
    }
    if (isGuidesPath(path)) {
      return externalSurfacePath("guides", path);
    }
  }
  return normalizeAbsolutePath(path);
}

export function externalSurfacePath(
  surface: "main" | "docs" | "guides",
  path = "/",
) {
  return new URL(
    externalRouteForSurface(surface, path).replace(/^\/+/, ""),
    externalSurfaceUrls[surface],
  ).toString();
}

export function canonicalSurfaceUrl(
  surface: "main" | "docs" | "guides",
  path = "/",
) {
  return new URL(
    routeForSurface(surface, path).replace(/^\/+/, ""),
    externalSurfaceUrls[surface],
  ).toString();
}

export function currentDocsRootPath(path = "/") {
  return docsRoute(path);
}

export function currentGuidesRootPath(path = "/") {
  return guidesRoute(path);
}

function docsRoute(path: string) {
  const normalized = normalizeAbsolutePath(path);
  if (normalized === "/docs" || normalized === "/docs/") {
    return directoryRoot(docsRoot);
  }
  if (normalized.startsWith("/docs/")) {
    return joinRoot(docsRoot, normalized.slice("/docs".length));
  }
  if (normalized === "/latest" || normalized === "/latest/") {
    return directoryRoot(docsLatestRoot);
  }
  if (normalized.startsWith("/latest/")) {
    return joinRoot(docsLatestRoot, normalized.slice("/latest".length));
  }
  return normalized;
}

function guidesRoute(path: string) {
  const normalized = normalizeAbsolutePath(path);
  if (normalized === "/guides" || normalized === "/guides/") {
    return directoryRoot(guidesRoot);
  }
  if (normalized.startsWith("/guides/")) {
    return joinRoot(guidesRoot, normalized.slice("/guides".length));
  }
  if (normalized === "/latest" || normalized === "/latest/") {
    return directoryRoot(guidesLatestRoot);
  }
  if (normalized.startsWith("/latest/")) {
    return joinRoot(guidesLatestRoot, normalized.slice("/latest".length));
  }
  return normalized;
}

function externalRouteForSurface(
  surface: "main" | "docs" | "guides",
  path: string,
) {
  if (surface === "docs") {
    return docsRouteWithRoot(path, "/latest", "/latest");
  }
  if (surface === "guides") {
    return guidesRouteWithRoot(path, "/", "/");
  }
  return normalizeAbsolutePath(path);
}

function docsRouteWithRoot(path: string, root: string, latestRoot: string) {
  const normalized = normalizeAbsolutePath(path);
  if (normalized === "/docs" || normalized === "/docs/") {
    return directoryRoot(root);
  }
  if (normalized.startsWith("/docs/")) {
    return joinRoot(root, normalized.slice("/docs".length));
  }
  if (normalized === "/latest" || normalized === "/latest/") {
    return directoryRoot(latestRoot);
  }
  if (normalized.startsWith("/latest/")) {
    return joinRoot(latestRoot, normalized.slice("/latest".length));
  }
  return normalized;
}

function guidesRouteWithRoot(path: string, root: string, latestRoot: string) {
  const normalized = normalizeAbsolutePath(path);
  if (normalized === "/guides" || normalized === "/guides/") {
    return directoryRoot(root);
  }
  if (normalized.startsWith("/guides/")) {
    return joinRoot(root, normalized.slice("/guides".length));
  }
  if (normalized === "/latest" || normalized === "/latest/") {
    return directoryRoot(latestRoot);
  }
  if (normalized.startsWith("/latest/")) {
    return joinRoot(latestRoot, normalized.slice("/latest".length));
  }
  return normalized;
}

function isDocsPath(path: string) {
  return (
    path === "/docs" ||
    path.startsWith("/docs/") ||
    path === "/latest/guide" ||
    path.startsWith("/latest/guide/")
  );
}

function isGuidesPath(path: string) {
  return (
    path === "/guides" ||
    path.startsWith("/guides/") ||
    path === "/latest" ||
    path.startsWith("/latest/")
  );
}

function isMainSurfacePath(path: string) {
  return path === "/" || (!isDocsPath(path) && !isGuidesPath(path));
}

function joinRoot(root: string, suffix: string) {
  const normalizedSuffix = normalizeAbsolutePath(suffix);
  if (root === "/") {
    return normalizedSuffix;
  }
  return `${root.replace(/\/+$/, "")}${normalizedSuffix}`;
}

function directoryRoot(root: string) {
  return root === "/" ? "/" : `${root.replace(/\/+$/, "")}/`;
}

function normalizeAbsolutePath(path: string) {
  if (!path) {
    return "/";
  }
  if (hasSchemeOrProtocolRelativeUrl(path) || path.startsWith("#")) {
    return path;
  }
  const [pathname, suffix = ""] = splitPathSuffix(
    path.startsWith("/") ? path : `/${path}`,
  );
  const normalizedPathname = pathname.replace(/\/{2,}/g, "/");
  return `${normalizedPathname || "/"}${suffix}`;
}

function normalizedRoot(root: string) {
  const normalized = normalizeAbsolutePath(root || "/");
  if (normalized === "/") {
    return "/";
  }
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

function splitPathSuffix(path: string) {
  const queryIndex = path.indexOf("?");
  const hashIndex = path.indexOf("#");
  let suffixIndex = -1;
  if (queryIndex >= 0 && hashIndex >= 0) {
    suffixIndex = Math.min(queryIndex, hashIndex);
  } else {
    suffixIndex = Math.max(queryIndex, hashIndex);
  }
  return suffixIndex >= 0
    ? [path.slice(0, suffixIndex), path.slice(suffixIndex)]
    : [path, ""];
}

function hasSchemeOrProtocolRelativeUrl(path: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(path) || path.startsWith("//");
}

function definedValues(values: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => {
      const value = entry[1];
      return typeof value === "string" && value.length > 0;
    }),
  );
}
