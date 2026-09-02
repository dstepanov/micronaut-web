import {
  DOCS_SNAPSHOT_ROOT,
  resolveDeploymentSettings,
  type DeploySurface,
} from "./deployment-defaults.ts";
import {
  externalRouteForSurface,
  normalizedRoot,
  routeForCurrentDeployment as routeForDeployment,
  routeForSurface as routeForSurfaceWithRoots,
  surfaceSiteUrl,
  type SurfaceRoots,
  type SurfaceTarget,
} from "./surface-path-rules.ts";

export type { DeploySurface } from "./deployment-defaults.ts";
export type { SurfaceTarget } from "./surface-path-rules.ts";
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
export const googleAnalyticsId = deploymentSettings.googleAnalyticsId;
export const docsRoot = normalizedRoot(deploymentSettings.docsRoot);
// Snapshot docs document the release that has not happened yet, so they belong
// to no version line and the released lines are not theirs to offer.
export const isDocsSnapshot = docsRoot === DOCS_SNAPSHOT_ROOT;
export const docsLatestRoot = normalizedRoot(deploymentSettings.docsLatestRoot);
export const guidesRoot = normalizedRoot(deploymentSettings.guidesRoot);
export const guidesLatestRoot = normalizedRoot(
  deploymentSettings.guidesLatestRoot,
);
export const githubPagesOrigin = deploymentSettings.githubPagesOrigin;

export const externalSurfaceUrls: Record<SurfaceTarget, string> = {
  main: deploymentSettings.mainSiteUrl,
  docs: deploymentSettings.docsSiteUrl,
  guides: deploymentSettings.guidesSiteUrl,
};

const surfaceRoots: SurfaceRoots = {
  docsRoot,
  docsLatestRoot,
  guidesRoot,
  guidesLatestRoot,
};

export function routeForSurface(surface: SurfaceTarget, path = "/") {
  return routeForSurfaceWithRoots(surface, path, surfaceRoots);
}

export function routeForCurrentDeployment(path: string) {
  return routeForDeployment(
    path,
    deploySurface,
    surfaceRoots,
    externalSurfacePath,
  );
}

export function externalSurfacePath(surface: SurfaceTarget, path = "/") {
  return surfaceSiteUrl(
    externalSurfaceUrls[surface],
    externalRouteForSurface(surface, path),
  );
}

export function canonicalSurfaceUrl(surface: SurfaceTarget, path = "/") {
  return surfaceSiteUrl(
    externalSurfaceUrls[surface],
    routeForSurface(surface, path),
  );
}

export function currentDocsRootPath(path = "/") {
  return routeForSurface("docs", path);
}

export function currentGuidesRootPath(path = "/") {
  return routeForSurface("guides", path);
}

function definedValues(values: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] => {
      const value = entry[1];
      return typeof value === "string" && value.length > 0;
    }),
  );
}
