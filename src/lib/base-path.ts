const basePath = import.meta.env?.BASE_URL || "/";

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
  return withBasePathForBase(path, basePath);
}
