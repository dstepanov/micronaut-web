type DeploySurface = "all" | "main" | "docs" | "guides";
type SurfaceTarget = "main" | "docs" | "guides" | "launch";
type BasePathImportMeta = ImportMeta & {
  readonly env?: {
    readonly BASE_URL?: string;
    readonly DEFAULT_GITHUB_PAGES_ORIGIN?: string;
    readonly MICRONAUT_GITHUB_PAGES_ORIGIN?: string;
  };
};

const metaEnv = (import.meta as BasePathImportMeta).env;
const basePath = metaEnv?.BASE_URL || "/";
const deployment = typeof __MICRONAUT_DEPLOYMENT__ === "undefined" ? undefined : __MICRONAUT_DEPLOYMENT__;
const deploySurface = (deployment?.deploySurface || "all") as DeploySurface;
const docsRoot = normalizedRoot(deployment?.docsRoot || (deploySurface === "docs" ? "/latest" : "/docs"));
const docsLatestRoot = normalizedRoot(deployment?.docsLatestRoot || (deploySurface === "docs" ? "/latest" : docsRoot));
const guidesRoot = normalizedRoot(deployment?.guidesRoot || (deploySurface === "guides" ? "/latest" : "/guides"));
const guidesLatestRoot = normalizedRoot(deployment?.guidesLatestRoot || "/latest");
const githubPagesOrigin = normalizedExternalOrigin(
  deployment?.githubPagesOrigin ||
    metaEnv?.MICRONAUT_GITHUB_PAGES_ORIGIN ||
    metaEnv?.DEFAULT_GITHUB_PAGES_ORIGIN ||
    "/"
);
const externalSurfaceUrls = {
  main: normalizedExternalBase(deployment?.mainSiteUrl || githubPagesProjectUrl(githubPagesOrigin, "micronaut-web")),
  docs: normalizedExternalBase(deployment?.docsSiteUrl || githubPagesProjectUrl(githubPagesOrigin, "micronaut-docs")),
  guides: normalizedExternalBase(deployment?.guidesSiteUrl || githubPagesProjectUrl(githubPagesOrigin, "micronaut-guides"))
};

function hasSchemeOrProtocolRelativeUrl(path: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(path) || path.startsWith("//");
}

export function withBasePathForBase(path: string, base: string) {
  if (!path || path.startsWith("#") || hasSchemeOrProtocolRelativeUrl(path)) {
    return path;
  }
  if (!path.startsWith("/")) {
    return path;
  }

  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const baseWithoutTrailingSlash = normalizedBase.replace(/\/$/, "");
  if (normalizedBase !== "/" && (path === baseWithoutTrailingSlash || path.startsWith(normalizedBase))) {
    return path;
  }

  return `${normalizedBase}${path.replace(/^\/+/, "")}`;
}

export function withBasePath(path: string) {
  return withBasePathForBase(routeForCurrentDeployment(path), basePath);
}

export function withSurfacePath(surface: SurfaceTarget, path = "/") {
  const targetSurface = surface === "launch" ? "main" : surface;
  if (targetSurface === "main" && deploySurface !== "all" && deploySurface !== "main") {
    return externalSurfacePath("main", path);
  }
  if (targetSurface === "docs" && deploySurface !== "all" && deploySurface !== "docs") {
    return externalSurfacePath("docs", path);
  }
  if (targetSurface === "guides" && deploySurface !== "all" && deploySurface !== "guides") {
    return externalSurfacePath("guides", path);
  }
  return withBasePathForBase(routeForSurface(surface, path), basePath);
}

export function canonicalSurfaceUrl(surface: "main" | "docs" | "guides", path = "/") {
  return new URL(routeForSurface(surface, path).replace(/^\/+/, ""), externalSurfaceUrls[surface]).toString();
}

function routeForCurrentDeployment(path: string) {
  if (!path || path.startsWith("#") || hasSchemeOrProtocolRelativeUrl(path) || !path.startsWith("/")) {
    return path;
  }
  if (deploySurface === "docs") {
    if (path === "/") {
      return "/";
    }
    if (isDocsPath(path)) {
      return docsRoute(path);
    }
    if (isGuidesPath(path)) {
      return externalSurfacePath("guides", path);
    }
    return externalSurfacePath("main", path);
  }
  if (deploySurface === "guides") {
    if (path === "/") {
      return directoryRoot(guidesLatestRoot);
    }
    if (isGuidesPath(path)) {
      return guidesRoute(path);
    }
    if (isDocsPath(path)) {
      return externalSurfacePath("docs", path);
    }
    return externalSurfacePath("main", path);
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

function routeForSurface(surface: SurfaceTarget, path = "/") {
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

function externalSurfacePath(surface: "main" | "docs" | "guides", path = "/") {
  return new URL(externalRouteForSurface(surface, path).replace(/^\/+/, ""), externalSurfaceUrls[surface]).toString();
}

function docsRoute(path: string) {
  return docsRouteWithRoot(path, docsRoot, docsLatestRoot);
}

function guidesRoute(path: string) {
  return guidesRouteWithRoot(path, guidesRoot, guidesLatestRoot);
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

function normalizedExternalOrigin(value: string) {
  return value.replace(/\/+$/, "");
}

function githubPagesProjectUrl(origin: string, repositoryName: string) {
  return `${origin}/${repositoryName}/`;
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
  return suffixIndex >= 0 ? [path.slice(0, suffixIndex), path.slice(suffixIndex)] : [path, ""];
}
