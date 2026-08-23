export type DeploySurface = "all" | "main" | "docs" | "guides";
export type SurfaceTarget = "main" | "docs" | "guides";

/**
 * Roots the four surface-relative path families are mounted under for the
 * deployment being rendered. `base-path.ts` and `deployment-config.ts` read
 * these from different settings sources; every rule below is shared so a
 * routing fix only has to be made once.
 */
export type SurfaceRoots = {
  docsRoot: string;
  docsLatestRoot: string;
  guidesRoot: string;
  guidesLatestRoot: string;
};

/** Roots each surface serves its own content under when published alone. */
const standaloneSurfaceRoots: Record<SurfaceTarget, SurfaceRoots> = {
  main: surfaceRoots("/docs", "/guides"),
  docs: surfaceRoots("/latest", "/guides"),
  guides: surfaceRoots("/docs", "/"),
};

export function hasSchemeOrProtocolRelativeUrl(path: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(path) || path.startsWith("//");
}

export function isDocsPath(path: string) {
  return (
    path === "/docs" ||
    path.startsWith("/docs/") ||
    path === "/latest/guide" ||
    path.startsWith("/latest/guide/")
  );
}

export function isGuidesPath(path: string) {
  return (
    path === "/guides" ||
    path.startsWith("/guides/") ||
    path === "/latest" ||
    path.startsWith("/latest/")
  );
}

export function normalizeAbsolutePath(path: string) {
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

export function normalizedRoot(root: string) {
  const normalized = normalizeAbsolutePath(root || "/");
  if (normalized === "/") {
    return "/";
  }
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

/** Rewrites an authoring path for `surface` as served by this deployment. */
export function routeForSurface(
  surface: SurfaceTarget,
  path: string,
  roots: SurfaceRoots,
) {
  if (surface === "docs") {
    return docsRoute(path, roots);
  }
  if (surface === "guides") {
    return guidesRoute(path, roots);
  }
  return normalizeAbsolutePath(path);
}

/** Rewrites an authoring path as served by `surface`'s own standalone site. */
export function externalRouteForSurface(surface: SurfaceTarget, path: string) {
  return routeForSurface(surface, path, standaloneSurfaceRoots[surface]);
}

/**
 * Rewrites an authoring path for the surface currently being built. Paths that
 * belong to another surface are left for the caller to turn into an absolute
 * URL through `externalUrl`.
 */
/**
 * Icons are the one shared asset that appears above the fold across a whole
 * page: the docs index renders one per project. Every surface ships its own
 * copy of `/micronaut-assets/icons/` (see `prune-surface.ts`) so a docs page
 * does not open 37 cross-origin requests to the main site before it can paint.
 * The rest of `/micronaut-assets/` stays centralized there.
 */
function isSurfaceLocalAssetPath(path: string) {
  return path.startsWith("/micronaut-assets/icons/");
}

export function routeForCurrentDeployment(
  path: string,
  deploySurface: DeploySurface,
  roots: SurfaceRoots,
  externalUrl: (surface: SurfaceTarget, path: string) => string,
) {
  if (
    !path ||
    path.startsWith("#") ||
    hasSchemeOrProtocolRelativeUrl(path) ||
    !path.startsWith("/")
  ) {
    return path;
  }
  if (isSurfaceLocalAssetPath(path)) {
    return normalizeAbsolutePath(path);
  }
  if (deploySurface === "docs") {
    if (path === "/") {
      return "/";
    }
    if (isDocsPath(path)) {
      return docsRoute(path, roots);
    }
    if (isGuidesPath(path)) {
      return externalUrl("guides", path);
    }
    return externalUrl("main", path);
  }
  if (deploySurface === "guides") {
    if (path === "/") {
      return directoryRoot(roots.guidesLatestRoot);
    }
    if (isGuidesPath(path)) {
      return guidesRoute(path, roots);
    }
    if (isDocsPath(path)) {
      return externalUrl("docs", path);
    }
    return externalUrl("main", path);
  }
  if (deploySurface === "main") {
    if (isDocsPath(path)) {
      return externalUrl("docs", path);
    }
    if (isGuidesPath(path)) {
      return externalUrl("guides", path);
    }
  }
  return normalizeAbsolutePath(path);
}

/** Resolves a surface-relative route against that surface's site URL. */
export function surfaceSiteUrl(siteUrl: string, route: string) {
  return new URL(route.replace(/^\/+/, ""), siteUrl).toString();
}

function docsRoute(path: string, roots: SurfaceRoots) {
  return routeUnderRoots(
    path,
    "/docs",
    roots.docsRoot,
    "/latest",
    roots.docsLatestRoot,
  );
}

function guidesRoute(path: string, roots: SurfaceRoots) {
  return routeUnderRoots(
    path,
    "/guides",
    roots.guidesRoot,
    "/latest",
    roots.guidesLatestRoot,
  );
}

function routeUnderRoots(
  path: string,
  prefix: string,
  root: string,
  latestPrefix: string,
  latestRoot: string,
) {
  const normalized = normalizeAbsolutePath(path);
  return (
    routeUnderRoot(normalized, prefix, root) ??
    routeUnderRoot(normalized, latestPrefix, latestRoot) ??
    normalized
  );
}

function routeUnderRoot(path: string, prefix: string, root: string) {
  if (path === prefix || path === `${prefix}/`) {
    return directoryRoot(root);
  }
  if (path.startsWith(`${prefix}/`)) {
    return joinRoot(root, path.slice(prefix.length));
  }
  return undefined;
}

function surfaceRoots(docsRoot: string, guidesRoot: string): SurfaceRoots {
  return {
    docsRoot,
    docsLatestRoot: docsRoot,
    guidesRoot,
    guidesLatestRoot: guidesRoot,
  };
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
