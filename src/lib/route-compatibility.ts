export type ProductionSurface = "main" | "docs" | "guides" | "assets";

export type RouteCompatibilityEntry = {
  id: string;
  sourceSurface: ProductionSurface;
  sourcePath: string;
  destinationSurface: ProductionSurface;
  previewDestinationPath: string;
  productionDestinationPath: string;
  status: 301 | 302 | 200;
  behavior: "canonical" | "redirect" | "external-redirect" | "alias";
  preservesSearch: boolean;
  preservesHash: "client" | "same-document" | "not-available";
  notes: string;
};

export const productionHosts: Record<ProductionSurface, string> = {
  main: "https://micronaut.io",
  docs: "https://docs.micronaut.io",
  guides: "https://guides.micronaut.io",
  assets: "https://micronaut.io"
};

const productionPathPrefixes: Record<ProductionSurface, string> = {
  main: "/",
  docs: "/",
  guides: "/latest/",
  assets: "/"
};

export const coreDocsPreviewPath = "/docs/core/";

/**
 * Route compatibility is intentionally centralized here. When a legacy URL,
 * production host mapping, or preview alias is added, update this manifest and
 * the matching route module instead of scattering redirect knowledge through
 * individual pages. The docs at docs/website-ux-and-compatibility.md describe
 * the schema and the representative URL matrix expected to stay stable.
 */
export const routeCompatibilityManifest: RouteCompatibilityEntry[] = [
  {
    id: "docs-core-latest-guide",
    sourceSurface: "docs",
    sourcePath: "/latest/guide/",
    destinationSurface: "docs",
    previewDestinationPath: coreDocsPreviewPath,
    productionDestinationPath: "/latest/guide/",
    status: 200,
    behavior: "alias",
    preservesSearch: true,
    preservesHash: "client",
    notes: "The production docs host keeps the historical Core guide path; preview aliases it to /docs/core/."
  },
  {
    id: "docs-core-latest-guide-index",
    sourceSurface: "docs",
    sourcePath: "/latest/guide/index.html",
    destinationSurface: "docs",
    previewDestinationPath: coreDocsPreviewPath,
    productionDestinationPath: "/latest/guide/",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "client",
    notes: "Legacy Core index.html resolves to the canonical Core docs route."
  },
  {
    id: "guides-latest-index-html",
    sourceSurface: "guides",
    sourcePath: "/latest/index.html",
    destinationSurface: "guides",
    previewDestinationPath: "/latest/",
    productionDestinationPath: "/index.html",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "same-document",
    notes: "The guides host continues to accept the historical latest index.html path."
  },
  {
    id: "guides-tag-html",
    sourceSurface: "guides",
    sourcePath: "/latest/tag-{tag}.html",
    destinationSurface: "guides",
    previewDestinationPath: "/latest/tag-{tag}/",
    productionDestinationPath: "/tag-{tag}.html",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "same-document",
    notes: "Generated guide tag pages keep their old .html aliases."
  },
  {
    id: "guides-detail-html",
    sourceSurface: "guides",
    sourcePath: "/latest/{guide}.html",
    destinationSurface: "guides",
    previewDestinationPath: "/latest/{guide}/",
    productionDestinationPath: "/{guide}.html",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "same-document",
    notes: "Generated guide overview and variant .html pages redirect to slash-style preview routes."
  },
  {
    id: "guides-zip",
    sourceSurface: "guides",
    sourcePath: "/latest/{guide}.zip",
    destinationSurface: "guides",
    previewDestinationPath: "/latest/{guide}.zip",
    productionDestinationPath: "/{guide}.zip",
    status: 302,
    behavior: "external-redirect",
    preservesSearch: false,
    preservesHash: "not-available",
    notes: "Static preview download aliases hand ZIP requests to the production guides host."
  },
  {
    id: "blog-dated-html",
    sourceSurface: "main",
    sourcePath: "/blog/{yyyy-mm-dd}-{slug}.html",
    destinationSurface: "main",
    previewDestinationPath: "/{yyyy}/{mm}/{dd}/{slug}/",
    productionDestinationPath: "/{yyyy}/{mm}/{dd}/{slug}/",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "same-document",
    notes: "Dated Wordpress-era blog aliases remain generated from post metadata."
  },
  {
    id: "anchor-urls",
    sourceSurface: "docs",
    sourcePath: "/latest/guide/index.html#{section}",
    destinationSurface: "docs",
    previewDestinationPath: `${coreDocsPreviewPath}#{section}`,
    productionDestinationPath: "/latest/guide/#{section}",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "client",
    notes: "Client redirect pages preserve fragments; server-style static redirects cannot receive a fragment."
  }
];

export function routeCompatibilityEntry(id: string) {
  const entry = routeCompatibilityManifest.find((candidate) => candidate.id === id);
  if (!entry) {
    throw new Error(`Unknown route compatibility entry: ${id}`);
  }
  return entry;
}

export function productionUrl(surface: ProductionSurface, path = "/") {
  const prefix = productionPathPrefixes[surface];
  const base = productionHosts[surface];
  const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(`${normalizedPrefix}${normalizedPath}`.replace(/\/{2,}/g, "/"), base).toString();
}

export function appendRequestSearch(destination: string, requestUrl: URL) {
  if (!requestUrl.search) {
    return destination;
  }
  const [path, hash = ""] = destination.split("#", 2);
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${requestUrl.search.slice(1)}${hash ? `#${hash}` : ""}`;
}
