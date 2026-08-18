export const DEFAULT_GITHUB_PAGES_ORIGIN = "https://micronaut-projects.github.io";

export function githubPagesProjectUrl(origin: string, repositoryName: string) {
  return `${normalizedExternalOrigin(origin)}/${repositoryName}/`;
}

export function normalizedExternalOrigin(value: string) {
  return value.replace(/\/+$/, "");
}
