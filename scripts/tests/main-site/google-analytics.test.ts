import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";

import { projectDirectory } from "../support/paths.ts";

const googleAnalyticsTag: RegExp[] = [
  /<!-- Google tag \(gtag\.js\) -->/,
  /<script(?=[^>]*\basync\b)(?=[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-FF5E26PXNY["'])[^>]*>/,
  /window\.dataLayer = window\.dataLayer \|\| \[\];/,
  /function gtag\(\)\s*\{\s*dataLayer\.push\(arguments\);\s*\}/,
  /gtag\(["']js["'], new Date\(\)\);/,
  /gtag\(["']config["'], ["']G-FF5E26PXNY["']\);/,
];

test("all site shells include the Google Analytics tag", async (): Promise<void> => {
  const shellFiles = [
    "src/layouts/WebLayout.astro",
    "src/templates/docs/docs-index.html",
    "src/templates/docs/docs-page.html",
    "src/templates/guides/guides-index.html",
    "src/templates/guides/guides-page.html",
  ];

  await Promise.all(
    shellFiles.map(async (shellFile) => {
      const shell = await fs.readFile(
        path.join(projectDirectory, shellFile),
        "utf8",
      );
      for (const fragment of googleAnalyticsTag) {
        assert.match(
          shell,
          fragment,
          `${shellFile} should include ${fragment}`,
        );
      }
    }),
  );
});
