export const DEFAULT_GITHUB_PAGES_ORIGIN =
  "https://micronaut-projects.github.io";

/**
 * The docs root the snapshot surface is built and published under. Snapshot
 * docs are rebuilt from the platform default branch rather than released, so
 * they are the one docs deployment that is not a version line.
 */
export const DOCS_SNAPSHOT_ROOT = "/snapshot";

export type DeploySurface = "all" | "main" | "docs" | "guides";

export type DeploymentSettings = {
  deploySurface: DeploySurface;
  docsRoot: string;
  docsLatestRoot: string;
  guidesRoot: string;
  guidesLatestRoot: string;
  githubPagesOrigin: string;
  mainSiteUrl: string;
  docsSiteUrl: string;
  guidesSiteUrl: string;
  site: string;
};

export function resolveDeploymentSettings(
  env: Record<string, string | undefined>,
): DeploymentSettings {
  const deploySurface = parseDeploySurface(env.MICRONAUT_DEPLOY_SURFACE);
  const docsRoot =
    env.MICRONAUT_DOCS_ROOT || (deploySurface === "docs" ? "/latest" : "/docs");
  const docsLatestRoot =
    env.MICRONAUT_DOCS_LATEST_ROOT ||
    (deploySurface === "docs" ? "/latest" : docsRoot);
  const guidesRoot =
    env.MICRONAUT_GUIDES_ROOT || (deploySurface === "guides" ? "/" : "/guides");
  const guidesLatestRoot = env.MICRONAUT_GUIDES_LATEST_ROOT || guidesRoot;
  const githubPagesOrigin = normalizedExternalOrigin(
    env.MICRONAUT_GITHUB_PAGES_ORIGIN ||
      env.DEFAULT_GITHUB_PAGES_ORIGIN ||
      DEFAULT_GITHUB_PAGES_ORIGIN,
  );
  const mainSiteUrl = normalizedExternalBase(
    env.MICRONAUT_MAIN_SITE_URL ||
      githubPagesProjectUrl(githubPagesOrigin, "micronaut-web"),
  );
  const docsSiteUrl = normalizedExternalBase(
    env.MICRONAUT_DOCS_SITE_URL ||
      githubPagesProjectUrl(githubPagesOrigin, "micronaut-docs-v2"),
  );
  const guidesSiteUrl = normalizedExternalBase(
    env.MICRONAUT_GUIDES_SITE_URL ||
      githubPagesProjectUrl(githubPagesOrigin, "micronaut-guides-v2"),
  );
  const activeSiteUrl =
    deploySurface === "docs"
      ? docsSiteUrl
      : deploySurface === "guides"
        ? guidesSiteUrl
        : mainSiteUrl;

  return {
    deploySurface,
    docsRoot,
    docsLatestRoot,
    guidesRoot,
    guidesLatestRoot,
    githubPagesOrigin,
    mainSiteUrl,
    docsSiteUrl,
    guidesSiteUrl,
    site: new URL(activeSiteUrl).origin,
  };
}

/**
 * The Astro build and the standalone site-header shell build must inject
 * identical deployment values into the browser bundle. Both read this one
 * definition so a new setting cannot reach only one of them.
 */
export function deploymentDefines(
  deployment: DeploymentSettings,
  env: Record<string, string | undefined>,
): Record<string, string> {
  return {
    __MICRONAUT_DEPLOYMENT__: JSON.stringify(deployment),
    "import.meta.env.MICRONAUT_DEPLOY_SURFACE": JSON.stringify(
      deployment.deploySurface,
    ),
    "import.meta.env.MICRONAUT_DOCS_ROOT": JSON.stringify(deployment.docsRoot),
    "import.meta.env.MICRONAUT_DOCS_LATEST_ROOT": JSON.stringify(
      deployment.docsLatestRoot,
    ),
    "import.meta.env.MICRONAUT_GUIDES_ROOT": JSON.stringify(
      deployment.guidesRoot,
    ),
    "import.meta.env.MICRONAUT_GUIDES_LATEST_ROOT": JSON.stringify(
      deployment.guidesLatestRoot,
    ),
    "import.meta.env.DEFAULT_GITHUB_PAGES_ORIGIN": JSON.stringify(
      env.DEFAULT_GITHUB_PAGES_ORIGIN || deployment.githubPagesOrigin,
    ),
    "import.meta.env.MICRONAUT_GITHUB_PAGES_ORIGIN": JSON.stringify(
      deployment.githubPagesOrigin,
    ),
    "import.meta.env.MICRONAUT_MAIN_SITE_URL": JSON.stringify(
      deployment.mainSiteUrl,
    ),
    "import.meta.env.MICRONAUT_DOCS_SITE_URL": JSON.stringify(
      deployment.docsSiteUrl,
    ),
    "import.meta.env.MICRONAUT_GUIDES_SITE_URL": JSON.stringify(
      deployment.guidesSiteUrl,
    ),
  };
}

export function githubPagesProjectUrl(origin: string, repositoryName: string) {
  return `${normalizedExternalOrigin(origin)}/${repositoryName}/`;
}

export function normalizedExternalBase(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

export function normalizedExternalOrigin(value: string) {
  return value.replace(/\/+$/, "");
}

function parseDeploySurface(value: string | undefined): DeploySurface {
  if (!value) {
    return "all";
  }
  if (
    value === "all" ||
    value === "main" ||
    value === "docs" ||
    value === "guides"
  ) {
    return value;
  }
  throw new Error(
    `Expected MICRONAUT_DEPLOY_SURFACE to be all, main, docs, or guides; received ${value}.`,
  );
}
