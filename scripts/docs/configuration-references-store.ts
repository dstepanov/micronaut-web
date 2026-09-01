import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ConfigurationReferences } from "./configuration-references.ts";

/**
 * Filesystem access for the collected configuration references, kept apart
 * from the parser so the browser-bundled search modules never pull node:fs.
 */
export const configurationReferencesFile = join(
  process.cwd(),
  "src",
  "content",
  "generated-docs",
  "configuration-references.json",
);

export async function readConfigurationReferences(
  file = configurationReferencesFile,
): Promise<ConfigurationReferences> {
  let payload: unknown;
  try {
    payload = JSON.parse(await readFile(file, "utf8"));
  } catch {
    return {};
  }
  const projects = (payload as { projects?: unknown })?.projects;
  return typeof projects === "object" && projects !== null
    ? (projects as ConfigurationReferences)
    : {};
}
