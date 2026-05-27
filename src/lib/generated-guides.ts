import { readFile } from "node:fs/promises";
import { join } from "node:path";

import fallbackGeneratedGuidesManifest from "@/data/generated-guides.fixture.json";
import { enhanceGeneratedContentHtml } from "@/lib/generated-docs-html";
import type {
  GeneratedGuideOption,
  GeneratedGuidesManifest,
} from "@/lib/generated-guide-routing";

export * from "@/lib/generated-guide-routing";

const generatedGuidesDirectory = join(
  process.cwd(),
  "src",
  "content",
  "generated-guides",
);

export async function readGeneratedGuidesManifest(): Promise<GeneratedGuidesManifest> {
  try {
    const manifest = JSON.parse(
      await readFile(join(generatedGuidesDirectory, "manifest.json"), "utf8"),
    );
    if (Array.isArray(manifest.guides)) {
      return manifest as GeneratedGuidesManifest;
    }
  } catch {
    // Fall back to the checked-in guide subset when generated content is unavailable.
  }
  return fallbackGeneratedGuidesManifest as GeneratedGuidesManifest;
}

export async function readGeneratedGuideFragment(
  option: GeneratedGuideOption,
): Promise<string | undefined> {
  try {
    return enhanceGeneratedContentHtml(
      await readFile(join(generatedGuidesDirectory, option.fragment), "utf8"),
    );
  } catch {
    return undefined;
  }
}
