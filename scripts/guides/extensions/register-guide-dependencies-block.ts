// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import type {
  Block,
  BlockMacroProcessor,
  BlockProcessor,
  BlockProcessorDslInterface,
  MacroProcessorDslInterface,
  Reader,
  Registry,
  Section,
} from "@asciidoctor/core";

import {
  type MacroPayload,
  decodeBlockPayload,
  missingNotePayload,
  stringAttributes,
} from "../../asciidoc/extensions/block-payload.ts";
import {
  type SnippetPayload,
  renderSnippetBlock,
} from "../../asciidoc/extensions/snippet-block-renderer.ts";
import {
  type Dependency,
  gradleDependencyLine,
  gradleScope,
  mavenDependencyLines,
  mavenScope,
} from "../../shared/dependency-coordinates.ts";
import type { GuideRenderContext } from "../model.ts";

const GUIDE_DEPENDENCIES_BLOCK = "guide-dependencies";

export function registerGuideDependenciesBlock(
  registry: Registry,
  context: GuideRenderContext,
): void {
  registry.blockMacro(
    "dependency",
    function registerGuideDependencyMacro(
      this: MacroProcessorDslInterface,
    ): void {
      this.process(async function processGuideDependencyMacro(
        this: BlockMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Promise<Block> {
        return renderSnippetBlock(
          this,
          parent as Block | Section,
          dependencySnippetPayload(
            [{ attributes: stringAttributes(attrs), target: String(target) }],
            context,
          ),
          { manualCallouts: "inline" },
        );
      });
    },
  );

  registry.block(function registerGuideDependenciesBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named(GUIDE_DEPENDENCIES_BLOCK);
    this.onContext("open");
    this.process(async function processGuideDependenciesBlock(
      this: BlockProcessor,
      parent: unknown,
      reader: unknown,
      attrs: unknown,
    ): Promise<Block> {
      const attributes = attrs as Record<string, unknown>;
      const payload = decodeBlockPayload<{ dependencies: MacroPayload[] }>(
        attributes.payload,
      );
      return renderSnippetBlock(
        this,
        parent as Block | Section,
        dependencySnippetPayload(payload.dependencies, context),
        { manualCallouts: "inline", reader: reader as Reader },
      );
    });
  });
}

// One card for the active build tool: Gradle lines or Maven XML for every
// dependency in the group.
export function dependencySnippetPayload(
  macros: MacroPayload[],
  context: GuideRenderContext,
): SnippetPayload {
  if (!macros.length) {
    return missingNotePayload("Missing dependency.");
  }
  const language = String(context.option.language || "").toLowerCase();
  const dependencies = macros.map((macro) =>
    guideDependency(macro.target, macro.attributes, language),
  );

  if (String(context.option.buildTool || "").toLowerCase() === "maven") {
    return {
      kind: "dependency",
      title: "pom.xml",
      samples: [
        {
          language: "maven",
          highlighterLanguage: "xml",
          source: dependencies
            .flatMap((dependency) =>
              mavenDependencyLines(dependency, {
                explicitCompileScope: true,
                language,
              }),
            )
            .join("\n"),
        },
      ],
    };
  }
  return {
    kind: "dependency",
    title: "build.gradle",
    samples: [
      {
        language: "gradle",
        highlighterLanguage: "groovy",
        source: dependencies.map(gradleDependencyLine).join("\n"),
      },
    ],
  };
}

// Guide macros name the artifact directly and carry the group in attributes;
// `groupdId` is a typo that existing guides rely on.
function guideDependency(
  target: string,
  attributes: Record<string, string>,
  language: string,
): Dependency {
  return {
    groupId: attributes.groupId || attributes.groupdId || "io.micronaut",
    artifactId: target.trim(),
    version: attributes.version,
    gradleScope: gradleScope(attributes.scope, language),
    mavenScope: mavenScope(attributes.scope),
    pom: String(attributes.pom || "false").toLowerCase() === "true",
    versionProperty: attributes.versionProperty,
    callout: attributes.callout,
  };
}
