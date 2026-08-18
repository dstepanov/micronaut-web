import { spawn } from "node:child_process";

const surface = process.env.MICRONAUT_DEPLOY_SURFACE;
const npmCommand = process.env.npm_execpath ?? "npm";
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
      surface === "main" ? "/micronaut-docs-v2/" : "/docs/",
    MICRONAUT_GUIDES_SITE_URL:
      surface === "main" ? "/micronaut-guides-v2/" : "/guides/",
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
