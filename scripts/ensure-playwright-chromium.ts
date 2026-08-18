import { access } from "node:fs/promises";

import { chromium } from "@playwright/test";

const executablePath = chromium.executablePath();

try {
  await access(executablePath);
} catch {
  console.error(`Playwright Chromium is not installed: ${executablePath}`);
  console.error("Install it with: npx playwright install chromium");
  process.exit(1);
}
