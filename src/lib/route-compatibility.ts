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
  assets: "https://micronaut.io",
};

export const coreDocsPreviewPath = "/docs/core/";

/**
 * Route compatibility is intentionally centralized here. When a legacy URL,
 * production host mapping, or preview alias is added, update this manifest and
 * the matching route module instead of scattering redirect knowledge through
 * individual pages. README.md describes the schema and the representative URL
 * matrix expected to stay stable.
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
    notes:
      "The production docs host keeps the historical Core guide path; preview aliases it to /docs/core/.",
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
    notes: "Legacy Core index.html resolves to the canonical Core docs route.",
  },
  {
    id: "guides-latest-index-html",
    sourceSurface: "guides",
    sourcePath: "/latest/index.html",
    destinationSurface: "guides",
    previewDestinationPath: "/guides/",
    productionDestinationPath: "/",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "same-document",
    notes:
      "The guides host redirects the historical latest index.html path to the root-level guide catalog.",
  },
  {
    id: "guides-tag-html",
    sourceSurface: "guides",
    sourcePath: "/latest/tag-{tag}.html",
    destinationSurface: "guides",
    previewDestinationPath: "/guides/tag-{tag}/",
    productionDestinationPath: "/tag-{tag}/",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "same-document",
    notes:
      "Generated guide tag pages keep their old .html aliases and redirect to slash-style canonical routes.",
  },
  {
    id: "guides-detail-html",
    sourceSurface: "guides",
    sourcePath: "/latest/{guide}.html",
    destinationSurface: "guides",
    previewDestinationPath: "/guides/{guide}/",
    productionDestinationPath: "/{guide}/",
    status: 301,
    behavior: "redirect",
    preservesSearch: true,
    preservesHash: "same-document",
    notes:
      "Generated guide overview and variant .html pages redirect to slash-style canonical routes.",
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
    notes:
      "Static preview download aliases hand ZIP requests to the production guides host.",
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
    notes:
      "Dated Wordpress-era blog aliases remain generated from post metadata.",
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
    notes:
      "Client redirect pages preserve fragments; server-style static redirects cannot receive a fragment.",
  },
];

export function routeCompatibilityEntry(id: string) {
  const entry = routeCompatibilityManifest.find(
    (candidate) => candidate.id === id,
  );
  if (!entry) {
    throw new Error(`Unknown route compatibility entry: ${id}`);
  }
  return entry;
}

export function productionUrl(surface: ProductionSurface, path = "/") {
  return new URL(
    `/${path.replace(/^\/+/, "")}`.replace(/\/{2,}/g, "/"),
    productionHosts[surface],
  ).toString();
}

/**
 * Produces a redirect page for static hosts, where an HTTP redirect is not
 * available and a bare `<meta http-equiv="refresh">` drops both the request
 * query string and the fragment. The page keeps the crawler-facing markup of a
 * static redirect and lets the browser carry `?query` and `#fragment` across.
 *
 * This is the single redirect shape for every entry in
 * `routeCompatibilityManifest`. `scripts/prune-surface.ts` writes the same
 * document for the redirect stubs it generates at publish time; keep the two in
 * step.
 */
/**
 * The single redirect document shape. Themed via `color-scheme` plus system
 * colors (and the stored site theme) so the stub does not flash a white page
 * for dark-mode readers.
 */
export function clientRedirectDocument(
  destination: string,
  title = "the current page",
): string {
  const serializedDestination = JSON.stringify(destination);
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="robots" content="noindex" />',
    '<meta name="color-scheme" content="light dark" />',
    "<style>",
    "body{margin:0;display:grid;min-height:100vh;place-items:center;font:15px/1.5 system-ui,sans-serif;background:Canvas;color:CanvasText}",
    "a{color:inherit}",
    "</style>",
    `<meta http-equiv="refresh" content="0;url=${htmlAttribute(destination)}" />`,
    `<title>Redirecting to ${htmlText(title)}</title>`,
    "<script>",
    'try{const cookieThemeMode=(document.cookie.match(/(?:^|;\\s*)micronaut-theme-mode=(light|dark)/)||[])[1];const storedThemeMode=cookieThemeMode||localStorage.getItem("micronaut-web-theme-mode");if(storedThemeMode==="light"||storedThemeMode==="dark"){document.documentElement.style.colorScheme=storedThemeMode;}}catch{}',
    `location.replace(${serializedDestination} + location.search + location.hash);`,
    "</script>",
    "</head>",
    "<body>",
    `<a href="${htmlAttribute(destination)}">Continue to ${htmlText(title)}</a>`,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

export function preservingClientRedirect(
  destination: string,
  title = "the current page",
): Response {
  return new Response(clientRedirectDocument(destination, title), {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function htmlAttribute(value: string) {
  return htmlText(value).replaceAll('"', "&quot;");
}

function htmlText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
