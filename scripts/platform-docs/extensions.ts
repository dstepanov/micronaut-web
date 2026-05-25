import { apiLink, packageLink } from "./api-links.ts";
import { dependencyBlocksHtml } from "./dependencies.ts";
import { snippetBlocksHtml } from "./snippets.ts";

export function platformDocsExtensionRegistry(asciidoctor, context) {
  const registry = asciidoctor.Extensions.create();
  for (const kind of ["api", "ann", "mnapi", "jdk", "jee", "rs", "rx", "reactor"]) {
    registry.inlineMacro(kind, function registerApiMacro() {
      this.process(function processApiMacro(parent, target, attrs) {
        const link = apiLink(context, kind, target, attrs);
        return this.createInline(parent, "anchor", link.label, { type: "link", target: link.href });
      });
    });
  }
  registry.inlineMacro("pkg", function registerPackageMacro() {
    this.process(function processPackageMacro(parent, target, attrs) {
      const link = packageLink(context, target, attrs);
      return this.createInline(parent, "anchor", link.label, { type: "link", target: link.href });
    });
  });
  registry.inlineMacro("dependency", function registerDependencyMacro() {
    this.process(function processDependencyMacro(parent, target, attrs) {
      return this.createInlinePass(parent, dependencyBlocksHtml(target, attrs, context));
    });
  });
  registry.blockMacro("snippet", function registerSnippetMacro() {
    this.process(function processSnippetMacro(parent, target, attrs) {
      const htmlContent = snippetBlocksHtml(target, attrs, context);
      if (!htmlContent) {
        return undefined;
      }
      return this.createBlock(parent, "pass", htmlContent);
    });
  });
  return registry;
}
