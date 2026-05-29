import { spawn } from "node:child_process";

const surface = process.env.MICRONAUT_DEPLOY_SURFACE;
const npmCommand = process.env.npm_execpath ?? "npm";

if (surface && surface !== "all" && surface !== "docs") {
  console.log(`Skipping docs browser tests for ${surface} surface.`);
} else {
  await run(npmCommand, ["run", "test:docs:browser"]);
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
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
