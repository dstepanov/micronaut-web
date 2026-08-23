import { spawn } from "node:child_process";

/**
 * One wrapper for all three surfaces. A build renders every surface, so a
 * surface-scoped run has to skip the browser tests belonging to the other two
 * rather than fail on routes that were pruned away.
 */
const surfaces = {
  main: { script: "test:main-site:browser", label: "main-site" },
  docs: { script: "test:docs:browser", label: "docs" },
  guides: { script: "test:guides:browser", label: "guide" },
} as const;
type Surface = keyof typeof surfaces;

const requested = process.argv[2] as Surface | undefined;
if (!requested || !(requested in surfaces)) {
  throw new Error(
    `Expected a surface argument of ${Object.keys(surfaces).join(", ")}; received ${requested ?? "nothing"}.`,
  );
}

const { script, label } = surfaces[requested];
const deploySurface = process.env.MICRONAUT_DEPLOY_SURFACE;

if (
  requested === "main" &&
  process.env.MICRONAUT_SKIP_MAIN_SITE_BROWSER_TESTS === "true"
) {
  console.log("Skipping main-site browser tests by configuration.");
} else if (
  deploySurface &&
  deploySurface !== "all" &&
  deploySurface !== requested
) {
  console.log(`Skipping ${label} browser tests for ${deploySurface} surface.`);
} else {
  await run(process.env.npm_execpath ?? "npm", ["run", script]);
}

/**
 * A main-surface build serves the other two surfaces from their own GitHub
 * Pages projects, so the cross-surface links the main-site spec follows have to
 * point at the paths the static test server actually publishes.
 */
function browserTestEnvironment(): NodeJS.ProcessEnv {
  if (requested !== "main") {
    return process.env;
  }
  const origin = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT || "4339"}`;
  const standalone = deploySurface === "main";
  return {
    ...process.env,
    MICRONAUT_DOCS_SITE_URL: standalone
      ? `${origin}/micronaut-docs-v2/`
      : `${origin}/docs/`,
    MICRONAUT_GUIDES_SITE_URL: standalone
      ? `${origin}/micronaut-guides-v2/`
      : `${origin}/guides/`,
  };
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: browserTestEnvironment(),
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
