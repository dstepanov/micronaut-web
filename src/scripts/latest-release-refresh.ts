import {
  releaseSourceFor,
  starterReleaseUrls,
  versionFromReleasePayload,
} from "@/lib/latest-starter-release";

/**
 * Refreshes the release version in the browser so a new Micronaut release shows
 * on the site without waiting for a redeploy. The markup already carries the
 * version resolved at build time, so a failed request leaves a correct — if
 * older — page rather than an empty one.
 */
const versionTargets = document.querySelectorAll<HTMLElement>(
  "[data-micronaut-release-version]",
);
const notesTargets = document.querySelectorAll<HTMLAnchorElement>(
  "a[data-micronaut-release-notes]",
);
const binaryTargets = document.querySelectorAll<HTMLAnchorElement>(
  "a[data-micronaut-download-binary]",
);

if (versionTargets.length || notesTargets.length || binaryTargets.length) {
  const source = releaseSourceFor(location.hostname);
  fetch(source.url, { signal: AbortSignal.timeout(5_000) })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Release request failed with ${response.status}`);
      }
      return response.json();
    })
    .then((payload: unknown) => {
      const version = versionFromReleasePayload(source.kind, payload);
      if (!version) {
        return;
      }
      const { releaseNotesUrl, binaryUrl } = starterReleaseUrls(version);
      for (const target of versionTargets) {
        const format = target.dataset.micronautReleaseVersion || "{version}";
        target.textContent = format.replace("{version}", version);
      }
      for (const target of notesTargets) {
        target.href = releaseNotesUrl;
      }
      for (const target of binaryTargets) {
        target.href = binaryUrl;
      }
    })
    .catch(() => {
      // The build-time version stays on the page.
    });
}
