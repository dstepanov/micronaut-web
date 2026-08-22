import type { Registry } from "@asciidoctor/core";

import { registerApiMacros } from "./register-api-macros.ts";
import { registerComponentFooterProcessor } from "./register-component-footer-processor.ts";
import { registerConfigurationBlock } from "./register-configuration-block.ts";
import { registerDependencyBlock } from "./register-dependency-block.ts";
import { registerDocsSourcePreprocessor } from "./register-docs-source-preprocessor.ts";
import { registerPackageMacro } from "./register-package-macro.ts";
import {
  type SnippetSamplesResolver,
  registerSnippetBlock,
} from "./register-snippet-block.ts";

const componentRenderingRegistries = new WeakSet<Registry>();

type DocsExtensionContext = {
  project?: {
    slug?: string;
  };
} & Record<string, unknown>;

export function micronautExtensionRegistry(
  asciidoctor: typeof import("@asciidoctor/core"),
  context: DocsExtensionContext,
  options: { snippetSamples: SnippetSamplesResolver },
): Registry {
  const registry = asciidoctor.Extensions.create();
  registerDocsSourcePreprocessor(registry);
  registerApiMacros(registry, context);
  registerPackageMacro(registry, context);
  registerSnippetBlock(registry, context, options);
  registerDependencyBlock(registry, context);
  return registry;
}

// The extensions every surface needs regardless of its own macros: the
// `[configuration]` listing block and the callout-list footer attachment for
// ordinary listings. Safe to call more than once for the same registry.
export function registerComponentRenderingExtensions(
  asciidoctor: typeof import("@asciidoctor/core"),
  registry: Registry = asciidoctor.Extensions.create(),
): Registry {
  if (componentRenderingRegistries.has(registry)) {
    return registry;
  }
  registerConfigurationBlock(registry);
  registerComponentFooterProcessor(registry);
  componentRenderingRegistries.add(registry);
  return registry;
}
