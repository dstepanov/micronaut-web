import {
  DEFAULT_GITHUB_PAGES_ORIGIN,
  githubPagesProjectUrl,
  normalizedExternalBase,
  normalizedExternalOrigin,
} from "./deployment-defaults.ts";
import {
  externalRouteForSurface,
  hasSchemeOrProtocolRelativeUrl,
  isDocsPath,
  isGuidesPath,
  normalizedRoot,
  routeForCurrentDeployment,
  routeForSurface,
  surfaceSiteUrl,
  type DeploySurface,
  type SurfaceRoots,
  type SurfaceTarget,
} from "./surface-path-rules.ts";

export type SiteSurfaceUrls = Partial<Record<SurfaceTarget, string>>;
type BasePathImportMeta = ImportMeta & {
  readonly env?: {
    readonly BASE_URL?: string;
    readonly DEFAULT_GITHUB_PAGES_ORIGIN?: string;
    readonly MICRONAUT_GITHUB_PAGES_ORIGIN?: string;
  };
};

const metaEnv = (import.meta as BasePathImportMeta).env;
const basePath = metaEnv?.BASE_URL || "/";
const deployment =
  typeof __MICRONAUT_DEPLOYMENT__ === "undefined"
    ? undefined
    : __MICRONAUT_DEPLOYMENT__;
const deploySurface = (deployment?.deploySurface || "all") as DeploySurface;
const docsRoot = normalizedRoot(
  deployment?.docsRoot || (deploySurface === "docs" ? "/latest" : "/docs"),
);
const guidesRoot = normalizedRoot(
  deployment?.guidesRoot || (deploySurface === "guides" ? "/" : "/guides"),
);
const surfaceRoots: SurfaceRoots = {
  docsRoot,
  docsLatestRoot: normalizedRoot(
    deployment?.docsLatestRoot ||
      (deploySurface === "docs" ? "/latest" : docsRoot),
  ),
  guidesRoot,
  guidesLatestRoot: normalizedRoot(deployment?.guidesLatestRoot || guidesRoot),
};
const githubPagesOrigin = normalizedExternalOrigin(
  deployment?.githubPagesOrigin ||
    metaEnv?.MICRONAUT_GITHUB_PAGES_ORIGIN ||
    metaEnv?.DEFAULT_GITHUB_PAGES_ORIGIN ||
    DEFAULT_GITHUB_PAGES_ORIGIN,
);
const externalSurfaceUrls: Record<SurfaceTarget, string> = {
  main: normalizedExternalBase(
    deployment?.mainSiteUrl ||
      githubPagesProjectUrl(githubPagesOrigin, "micronaut-web"),
  ),
  docs: normalizedExternalBase(
    deployment?.docsSiteUrl ||
      githubPagesProjectUrl(githubPagesOrigin, "micronaut-docs-v2"),
  ),
  guides: normalizedExternalBase(
    deployment?.guidesSiteUrl ||
      githubPagesProjectUrl(githubPagesOrigin, "micronaut-guides-v2"),
  ),
};

export function withBasePathForBase(path: string, base: string) {
  if (!path || path.startsWith("#") || hasSchemeOrProtocolRelativeUrl(path)) {
    return path;
  }
  if (!path.startsWith("/")) {
    return path;
  }

  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const baseWithoutTrailingSlash = normalizedBase.replace(/\/$/, "");
  if (
    normalizedBase !== "/" &&
    (path === baseWithoutTrailingSlash || path.startsWith(normalizedBase))
  ) {
    return path;
  }

  return `${normalizedBase}${path.replace(/^\/+/, "")}`;
}

export function withBasePath(path: string) {
  return withBasePathForBase(
    routeForCurrentDeployment(
      path,
      deploySurface,
      surfaceRoots,
      externalSurfacePath,
    ),
    basePath,
  );
}

export function withSurfacePath(surface: SurfaceTarget, path = "/") {
  if (deploySurface !== "all" && deploySurface !== surface) {
    return externalSurfacePath(surface, path);
  }
  return withBasePathForBase(
    routeForSurface(surface, path, surfaceRoots),
    basePath,
  );
}

export function withConfiguredSurfacePath(
  surface: SurfaceTarget,
  path = "/",
  urls?: SiteSurfaceUrls,
) {
  const surfaceUrl = urls?.[surface];
  if (!surfaceUrl) {
    return withSurfacePath(surface, path);
  }
  return surfaceSiteUrl(
    normalizedExternalBase(surfaceUrl),
    externalRouteForSurface(surface, path),
  );
}

export function withConfiguredBasePath(path: string, urls?: SiteSurfaceUrls) {
  if (!urls) {
    return withBasePath(path);
  }
  if (isDocsPath(path)) {
    return withConfiguredSurfacePath("docs", path, urls);
  }
  if (isGuidesPath(path)) {
    return withConfiguredSurfacePath("guides", path, urls);
  }
  return withConfiguredSurfacePath("main", path, urls);
}

export function canonicalSurfaceUrl(surface: SurfaceTarget, path = "/") {
  return surfaceSiteUrl(
    externalSurfaceUrls[surface],
    routeForSurface(surface, path, surfaceRoots),
  );
}

function externalSurfacePath(surface: SurfaceTarget, path = "/") {
  return surfaceSiteUrl(
    externalSurfaceUrls[surface],
    externalRouteForSurface(surface, path),
  );
}
