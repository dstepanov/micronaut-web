/**
 * The gtag.js snippet Google documents, rendered from one definition so the
 * Astro layout and the standalone docs and guides templates cannot drift.
 */
export function googleAnalyticsTagHtml(measurementId: string): string {
  const encodedId = encodeURIComponent(measurementId);
  const scriptId = JSON.stringify(measurementId);
  return `<!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${encodedId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", ${scriptId});
    </script>`;
}

/**
 * Adds the tag to a standalone template as it is published. The templates are
 * consumed by other repositories through their `{{placeholder}}` contract, so
 * the measurement id is resolved at build time rather than handed to them as
 * one more placeholder they would each have to fill.
 */
export function withGoogleAnalyticsTag(
  html: string,
  measurementId: string,
): string {
  if (!measurementId || !html.includes("</head>")) {
    return html;
  }
  return html.replace(
    "</head>",
    `  ${googleAnalyticsTagHtml(measurementId)}\n  </head>`,
  );
}
