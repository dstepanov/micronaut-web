type StarterRelease = {
  version: string;
  releaseNotesUrl: string;
  binaryUrl: string;
};

const latestReleaseUrl =
  "https://api.github.com/repos/micronaut-projects/micronaut-starter/releases/latest";

let releasePromise: Promise<StarterRelease | undefined> | undefined;

/**
 * Resolved once per build. Doing this in the visitor's browser meant an
 * unauthenticated api.github.com request per page view, which is limited to 60
 * per hour and per IP, so visitors behind a shared NAT were served a 403.
 */
function latestStarterRelease(): Promise<StarterRelease | undefined> {
  return (releasePromise ??= fetch(latestReleaseUrl, {
    headers: { Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(10_000),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `GitHub latest release request failed with ${response.status}`,
        );
      }
      return response.json() as Promise<{
        tag_name: string;
        html_url: string;
        assets: Array<{ name: string; browser_download_url: string }>;
      }>;
    })
    .then((release) => {
      const version = release.tag_name.replace(/^v/, "");
      const binary = release.assets.find(
        (asset) => asset.name === `micronaut-cli-${version}.zip`,
      );
      if (!version || !binary) {
        throw new Error(
          "GitHub latest release is missing the Micronaut CLI ZIP asset",
        );
      }
      return {
        version,
        releaseNotesUrl: release.html_url,
        binaryUrl: binary.browser_download_url,
      };
    })
    .catch((error: unknown) => {
      console.warn("Could not resolve the Micronaut download release", error);
      return undefined;
    }));
}

/**
 * Fills the download page's release placeholders. When the release cannot be
 * resolved the markup keeps its `releases/latest` links, which already land on
 * the right page.
 */
export async function withLatestStarterRelease(html: string): Promise<string> {
  const release = await latestStarterRelease();
  if (!release) {
    return html;
  }
  return withHref(
    withHref(
      html.replace(
        /(<span\b[^>]*\bdata-micronaut-download-version\b[^>]*>)[^<]*(<\/span>)/,
        `$1v${escapeHtml(release.version)}$2`,
      ),
      "data-micronaut-release-notes",
      release.releaseNotesUrl,
    ),
    "data-micronaut-download-binary",
    release.binaryUrl,
  );
}

function withHref(html: string, marker: string, href: string) {
  return html.replace(new RegExp(`<a\\b[^>]*\\b${marker}\\b[^>]*>`), (tag) =>
    tag.replace(/href="[^"]*"/, `href="${escapeHtml(href)}"`),
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
