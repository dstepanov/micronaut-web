import type { Registry } from "@asciidoctor/core";

import { registerComponentRenderingExtensions } from "../../asciidoc/extensions/index.ts";
import type { GuideRenderContext } from "../model.ts";
import { registerGuideContentBlocks } from "./register-guide-content-blocks.ts";
import { registerGuideDependenciesBlock } from "./register-guide-dependencies-block.ts";
import { registerGuideExcludeBlocks } from "./register-guide-exclude-blocks.ts";
import { registerGuideLinkMacro } from "./register-guide-link-macro.ts";
import { registerGuidePreprocessor } from "./register-guide-preprocessor.ts";
import { registerGuideSnippetBlocks } from "./register-guide-snippet-blocks.ts";

export function guideExtensionRegistry(
  asciidoctor: typeof import("@asciidoctor/core"),
  context: GuideRenderContext,
): Registry {
  const registry = asciidoctor.Extensions.create();
  registerGuidePreprocessor(registry, context);
  registerGuideLinkMacro(registry);
  registerGuideSnippetBlocks(registry, context);
  registerGuideDependenciesBlock(registry, context);
  registerGuideExcludeBlocks(registry, context);
  registerGuideContentBlocks(registry, context);
  return registerComponentRenderingExtensions(asciidoctor, registry);
}
