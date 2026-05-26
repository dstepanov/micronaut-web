import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseArgs, stringArg } from "./shared/cli.ts";

type Surface = "main" | "docs" | "guides";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

if (isMainModule()) {
  await main();
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const surface = parseSurface(
    stringArg(options.surface) ||
      stringArg(options._[0]) ||
      process.env.MICRONAUT_DEPLOY_SURFACE,
  );
  const env = surfaceEnvironment(surface);

  await run("build", "npm", ["run", "build:site"], env);
  await run(
    "prune",
    process.execPath,
    ["scripts/prune-surface.ts", "--surface", surface],
    env,
  );
}

function surfaceEnvironment(surface: Surface): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    MICRONAUT_DEPLOY_SURFACE: surface,
  };
  if (!env.ASTRO_BASE) {
    env.ASTRO_BASE = `/${surface === "main" ? "micronaut-web" : `micronaut-${surface}`}/`;
  }
  if (surface === "docs") {
    env.MICRONAUT_DOCS_ROOT ||= "/latest";
    env.MICRONAUT_DOCS_LATEST_ROOT ||= "/latest";
  }
  if (surface === "guides") {
    env.MICRONAUT_GUIDES_ROOT ||= "/latest";
    env.MICRONAUT_GUIDES_LATEST_ROOT ||= "/latest";
  }
  if (surface === "main") {
    env.MICRONAUT_PREPARE_GENERATED_CONTENT ||= "false";
  }
  return env;
}

function parseSurface(value: string | undefined): Surface {
  if (value === "main" || value === "docs" || value === "guides") {
    return value;
  }
  throw new Error(
    `Expected --surface to be one of main, docs, or guides; received ${value || "nothing"}.`,
  );
}

function run(
  label: string,
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectDirectory,
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
          `${label} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}`,
        ),
      );
    });
  });
}

function isMainModule() {
  return process.argv[1]
    ? import.meta.url === pathToFileURL(process.argv[1]).href
    : false;
}
