const basePath = import.meta.env.BASE_URL || "/";

function hasSchemeOrProtocolRelativeUrl(path: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(path) || path.startsWith("//");
}

export function withBasePath(path: string) {
  if (!path || path.startsWith("#") || hasSchemeOrProtocolRelativeUrl(path)) {
    return path;
  }
  if (!path.startsWith("/")) {
    return path;
  }

  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return `${normalizedBase}${path.replace(/^\/+/, "")}`;
}
