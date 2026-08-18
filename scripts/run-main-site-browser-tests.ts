import { spawn } from "node:child_process";

const surface = process.env.MICRONAUT_DEPLOY_SURFACE;
const npmCommand = process.env.npm_execpath ?? "npm";
const playwrightOrigin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || "4339"}`;
const skipBrowserTests =
  process.env.MICRONAUT_SKIP_MAIN_SITE_BROWSER_TESTS === "true";

if (skipBrowserTests) {
  console.log("Skipping main-site browser tests by configuration.");
} else if (surface && surface !== "all" && surface !== "main") {
  console.log(`Skipping main-site browser tests for ${surface} surface.`);
} else {
  await run(npmCommand, ["run", "test:main-site:browser"], {
    ...process.env,
    MICRONAUT_DOCS_SITE_URL:
      surface === "main"
        ? `${playwrightOrigin}/micronaut-docs-v2/`
        : `${playwrightOrigin}/docs/`,
    MICRONAUT_GUIDES_SITE_URL:
      surface === "main"
        ? `${playwrightOrigin}/micronaut-guides-v2/`
        : `${playwrightOrigin}/guides/`,
  });
}

function run(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}`,
        ),
      );
    });
  });
}
