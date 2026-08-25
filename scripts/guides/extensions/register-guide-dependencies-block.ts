import type { Registry } from "@asciidoctor/core";

import {
  defineBlock,
  defineBlockMacro,
} from "../../asciidoc/extensions/define.ts";
import {
  type MacroPayload,
  parseAttributeList,
  stringAttributes,
} from "../../asciidoc/extensions/macro-attributes.ts";
import {
  type SnippetPayload,
  missingNotePayload,
  renderSnippetBlock,
} from "../../asciidoc/extensions/snippet-block-renderer.ts";
import {
  type Dependency,
  gradleDependencyLine,
  gradleScope,
  mavenDependencyLines,
  mavenScope,
  pyronautScope,
} from "../../shared/dependency-coordinates.ts";
import { PYTHON_BUILD_TOOL, type GuideRenderContext } from "../model.ts";
import { GUIDE_DEPENDENCIES_BLOCK } from "./register-guide-preprocessor.ts";

const DEPENDENCY_MACRO_LINE = /^dependency::([^\[]*)\[(.*)]\s*$/;

export function registerGuideDependenciesBlock(
  registry: Registry,
  context: GuideRenderContext,
): void {
  defineBlockMacro(registry, "dependency", function (parent, target, attrs) {
    return renderSnippetBlock(
      this,
      parent,
      dependencySnippetPayload(
        [{ attributes: stringAttributes(attrs), target }],
        context,
      ),
      { manualCallouts: "inline" },
    );
  });

  // The preprocessor wraps a `:dependencies:` group's macros in this block;
  // the callout list that follows the block stays in the document reader,
  // which renderSnippetBlock reads by default.
  defineBlock(
    registry,
    { name: GUIDE_DEPENDENCIES_BLOCK, context: "open" },
    async function (parent, reader) {
      const macros = (await reader.readLines())
        .map(parseDependencyMacroLine)
        .filter((macro): macro is MacroPayload => Boolean(macro));
      return renderSnippetBlock(
        this,
        parent,
        dependencySnippetPayload(macros, context),
        { manualCallouts: "inline" },
      );
    },
  );
}

function parseDependencyMacroLine(line: string): MacroPayload | undefined {
  const match = DEPENDENCY_MACRO_LINE.exec(line);
  return match
    ? {
        attributes: parseAttributeList(match[2]).attributes,
        target: match[1].trim(),
      }
    : undefined;
}

// One card for the active build tool: a Pyronaut dependency table, Gradle
// lines, or Maven XML for every dependency in the group.
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

  const buildTool = String(context.option.buildTool || "").toLowerCase();
  if (buildTool === PYTHON_BUILD_TOOL) {
    return {
      kind: "dependency",
      title: "pyproject.toml",
      samples: [
        {
          language: "toml",
          highlighterLanguage: "toml",
          source: pyronautDependencySource(dependencies),
        },
      ],
    };
  }
  if (buildTool === "maven") {
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

/**
 * A Pyronaut project declares dependencies as three coordinate lists under
 * `[tool.pyronaut.dependencies]` rather than one entry per scope, so a group
 * renders as a single table with the empty lists left out. Mirrors
 * `DependencyLines.pyronautAsciidoc` in the guides build.
 */
function pyronautDependencySource(dependencies: Dependency[]): string {
  const lines = ["[tool.pyronaut.dependencies]"];
  for (const scope of ["runtime", "build", "test"]) {
    const scoped = dependencies.filter(
      (dependency) => dependency.pyronautScope === scope,
    );
    if (!scoped.length) {
      continue;
    }
    lines.push(`${scope} = [`);
    for (const dependency of scoped) {
      const coordinate = [
        dependency.groupId,
        dependency.artifactId,
        dependency.version,
      ]
        .filter(Boolean)
        .join(":");
      lines.push(
        `    "${coordinate}",${dependency.callout ? ` # <${dependency.callout}>` : ""}`,
      );
    }
    lines.push("]");
  }
  return lines.join("\n");
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
    pyronautScope: pyronautScope(attributes.scope),
    pom: String(attributes.pom || "false").toLowerCase() === "true",
    versionProperty: attributes.versionProperty,
    callout: attributes.callout,
  };
}
