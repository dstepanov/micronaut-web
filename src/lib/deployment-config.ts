import {
  DEFAULT_GITHUB_PAGES_ORIGIN,
  githubPagesProjectUrl,
  normalizedExternalOrigin,
} from "./deployment-defaults.ts";

export type DeploySurface = "all" | "main" | "docs" | "guides";
export type SurfaceTarget = "main" | "docs" | "guides" | "launch";

export const deploySurface = envValue("MICRONAUT_DEPLOY_SURFACE", "all") as DeploySurface;
export const docsRoot = normalizedRoot(
  envValue("MICRONAUT_DOCS_ROOT", deploySurface === "docs" ? "/latest" : "/docs"),
);
export const docsLatestRoot = normalizedRoot(
  envValue("MICRONAUT_DOCS_LATEST_ROOT", deploySurface === "docs" ? "/latest" : docsRoot),
);
export const guidesRoot = normalizedRoot(
  envValue("MICRONAUT_GUIDES_ROOT", deploySurface === "guides" ? "/latest" : "/guides"),
);
export const guidesLatestRoot = normalizedRoot(
  envValue("MICRONAUT_GUIDES_LATEST_ROOT", "/latest"),
);
export const githubPagesOrigin = normalizedExternalOrigin(
  envValue(
    "MICRONAUT_GITHUB_PAGES_ORIGIN",
    envValue("DEFAULT_GITHUB_PAGES_ORIGIN", DEFAULT_GITHUB_PAGES_ORIGIN),
  ),
);

export const externalSurfaceUrls: Record<"main" | "docs" | "guides", string> = {
  main: normalizedExternalBase(envValue("MICRONAUT_MAIN_SITE_URL", githubPagesProjectUrl(githubPagesOrigin, "micronaut-web"))),
  docs: normalizedExternalBase(envValue("MICRONAUT_DOCS_SITE_URL", githubPagesProjectUrl(githubPagesOrigin, "micronaut-docs"))),
  guides: normalizedExternalBase(envValue("MICRONAUT_GUIDES_SITE_URL", githubPagesProjectUrl(githubPagesOrigin, "micronaut-guides"))),
};

export function routeForSurface(surface: SurfaceTarget, path = "/") {
  if (surface === "launch") {
    return normalizeAbsolutePath(path || "/launch/");
  }
  if (surface === "docs") {
    return docsRoute(path);
  }
  if (surface === "guides") {
    return guidesRoute(path);
  }
  return normalizeAbsolutePath(path);
}

export function routeForCurrentDeployment(path: string) {
  if (!path || path.startsWith("#") || hasSchemeOrProtocolRelativeUrl(path) || !path.startsWith("/")) {
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

export function externalSurfacePath(surface: "main" | "docs" | "guides", path = "/") {
  return new URL(externalRouteForSurface(surface, path).replace(/^\/+/, ""), externalSurfaceUrls[surface]).toString();
}

export function canonicalSurfaceUrl(surface: "main" | "docs" | "guides", path = "/") {
  return new URL(routeForSurface(surface, path).replace(/^\/+/, ""), externalSurfaceUrls[surface]).toString();
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

function externalRouteForSurface(surface: "main" | "docs" | "guides", path: string) {
  if (surface === "docs") {
    return docsRouteWithRoot(path, "/latest", "/latest");
  }
  if (surface === "guides") {
    return guidesRouteWithRoot(path, "/latest", "/latest");
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
  return path === "/docs" || path.startsWith("/docs/") || path === "/latest/guide" || path.startsWith("/latest/guide/");
}

function isGuidesPath(path: string) {
  return path === "/guides" || path.startsWith("/guides/") || path === "/latest" || path.startsWith("/latest/");
}

function isMainSurfacePath(path: string) {
  return path === "/" || path === "/launch" || path.startsWith("/launch/") || !isDocsPath(path) && !isGuidesPath(path);
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
  const [pathname, suffix = ""] = splitPathSuffix(path.startsWith("/") ? path : `/${path}`);
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

function normalizedExternalBase(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
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

function envValue(name: string, fallback: string) {
  const meta = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  };
  const metaValue = meta.env?.[name];
  if (typeof metaValue === "string" && metaValue) {
    return metaValue;
  }
  if (typeof process !== "undefined") {
    const processValue = process.env[name];
    if (processValue) {
      return processValue;
    }
  }
  return fallback;
}
