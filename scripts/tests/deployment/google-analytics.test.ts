import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_GITHUB_PAGES_ORIGIN,
  GOOGLE_ANALYTICS_ID,
  resolveDeploymentSettings,
} from "../../../src/lib/deployment-defaults.ts";
import {
  googleAnalyticsTagHtml,
  withGoogleAnalyticsTag,
} from "../../../src/lib/google-analytics.ts";

test("the canonical deployment reports to the Micronaut property", () => {
  const settings = resolveDeploymentSettings({
    MICRONAUT_GITHUB_PAGES_ORIGIN: DEFAULT_GITHUB_PAGES_ORIGIN,
  });

  assert.equal(settings.googleAnalyticsId, GOOGLE_ANALYTICS_ID);
});

test("fork previews report nothing", () => {
  const settings = resolveDeploymentSettings({
    MICRONAUT_GITHUB_PAGES_ORIGIN: "https://someone-else.github.io",
  });

  assert.equal(settings.googleAnalyticsId, "");
});

test("an explicit measurement id overrides the origin rule", () => {
  assert.equal(
    resolveDeploymentSettings({
      MICRONAUT_GITHUB_PAGES_ORIGIN: "https://someone-else.github.io",
      MICRONAUT_GOOGLE_ANALYTICS_ID: "G-TESTING",
    }).googleAnalyticsId,
    "G-TESTING",
  );
  assert.equal(
    resolveDeploymentSettings({
      MICRONAUT_GITHUB_PAGES_ORIGIN: DEFAULT_GITHUB_PAGES_ORIGIN,
      MICRONAUT_GOOGLE_ANALYTICS_ID: "",
    }).googleAnalyticsId,
    "",
  );
});

test("the tag loads gtag.js and configures the measurement id", () => {
  const html = googleAnalyticsTagHtml("G-TESTING");

  assert.match(
    html,
    /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-TESTING"><\/script>/,
  );
  assert.match(html, /gtag\("config", "G-TESTING"\)/);
});

test("standalone templates carry the tag inside the head", () => {
  const template =
    "<html>\n  <head>\n    <title>Docs</title>\n  </head>\n</html>";

  const published = withGoogleAnalyticsTag(template, "G-TESTING");

  const head = published.slice(0, published.indexOf("</head>"));
  assert.ok(head.includes("gtag/js?id=G-TESTING"));
  assert.equal(withGoogleAnalyticsTag(template, ""), template);
});

test("templates without a head are left alone", () => {
  const snippet = "<div>{{contentHtml}}</div>";

  assert.equal(withGoogleAnalyticsTag(snippet, "G-TESTING"), snippet);
});
