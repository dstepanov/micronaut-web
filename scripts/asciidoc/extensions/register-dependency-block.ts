// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  BlockMacroProcessor,
  MacroProcessorDslInterface,
  Registry,
  Section,
} from "@asciidoctor/core";

import {
  type Dependency,
  gradleDependencyLine,
  gradleScope,
  mavenDependencyXml,
  mavenScope,
} from "../../shared/dependency-coordinates.ts";
import { type MacroAttributes, macroAttribute } from "./macro-attributes.ts";
import {
  type SnippetPayload,
  renderSnippetBlock,
} from "./snippet-block-renderer.ts";

type DependencyContext = Record<string, unknown> & {
  attributes?: Record<string, string | undefined>;
};

export function registerDependencyBlock(
  registry: Registry,
  context: DependencyContext,
): void {
  registry.blockMacro(
    "dependency",
    function registerDependencyMacro(this: MacroProcessorDslInterface): void {
      this.process(async function processDependencyMacro(
        this: BlockMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Promise<Block> {
        return renderSnippetBlock(
          this,
          parent as Block | Section,
          dependencyPayload(String(target), attrs as MacroAttributes, context),
        );
      });
    },
  );
}

export function dependencyPayload(
  target: string,
  attrs: MacroAttributes,
  context: DependencyContext,
): SnippetPayload {
  const dependency = docsDependency(target.trim(), attrs, context);
  return {
    kind: "dependency",
    title: macroAttribute(attrs, "title") || "",
    description: macroAttribute(attrs, "description") || "",
    samples: [
      {
        language: "gradle",
        highlighterLanguage: "gradle",
        source: gradleDependencyLine(dependency),
      },
      {
        language: "maven",
        highlighterLanguage: "maven",
        source: mavenDependencyXml(dependency, {
          wrapAnnotationProcessorPaths: true,
        }),
      },
    ],
  };
}

// Docs macros accept `group:artifact[:version]` targets or a bare artifact
// that is completed with the project group and the `micronaut-` prefix.
function docsDependency(
  target: string,
  attrs: MacroAttributes,
  context: DependencyContext,
): Dependency {
  const scope = macroAttribute(attrs, "scope");
  const groupAttribute =
    macroAttribute(attrs, "groupId") ||
    macroAttribute(attrs, "group") ||
    context.attributes?.projectGroup;
  let groupId: string;
  let artifactId: string;
  let version: string | undefined;

  if (target.includes(":")) {
    const tokens = target.split(":");
    groupId = tokens[0] || "io.micronaut";
    artifactId = tokens[1];
    version =
      tokens.length === 3 ? tokens[2] : macroAttribute(attrs, "version");
  } else {
    groupId = groupAttribute || "io.micronaut";
    artifactId =
      target.startsWith("micronaut-") || !groupId.startsWith("io.micronaut.")
        ? target
        : `micronaut-${target}`;
    version = macroAttribute(attrs, "version");
  }

  return {
    groupId,
    artifactId,
    version,
    classifier: macroAttribute(attrs, "classifier"),
    gradleScope: macroAttribute(attrs, "gradleScope") || gradleScope(scope),
    mavenScope: macroAttribute(attrs, "mavenScope") || mavenScope(scope),
  };
}
