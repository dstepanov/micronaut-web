export const DEFAULT_GITHUB_PAGES_ORIGIN = "https://dstepanov.github.io";

export function githubPagesProjectUrl(origin: string, repositoryName: string) {
  return `${normalizedExternalOrigin(origin)}/${repositoryName}/`;
}

export function normalizedExternalOrigin(value: string) {
  return value.replace(/\/+$/, "");
}
