import type {
  Block,
  BlockMacroProcessor,
  BlockProcessor,
  BlockProcessorDslInterface,
  MacroProcessorDslInterface,
  Registry,
  Section,
} from "@asciidoctor/core";

import { renderSnippetBlock } from "./snippet-block-renderer.ts";

const DEPENDENCY_BLOCK = "dependency";

type DependencyContext = Record<string, unknown> & {
  attributes?: Record<string, string | undefined>;
};

type MacroAttributes = Record<string, unknown> & {
  text?: unknown;
  $positional?: unknown;
  _positional?: unknown;
};

type SnippetSample = {
  language: string;
  source: string;
  group?: string;
  highlighterLanguage?: string;
};

type DependencyPayload = {
  title: string;
  description: string;
  samples: SnippetSample[];
};

type Dependency = {
  groupId: string;
  artifactId: string;
  version?: string;
  classifier?: string;
  gradleScope: string;
  mavenScope: string;
  title: string;
  description: string;
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
        return renderSnippetBlock(this, parent as Block | Section, {
          ...dependencyPayload(
            String(target),
            attrs as MacroAttributes,
            context,
          ),
          kind: "dependency",
        });
      });
    },
  );

  registry.block(function registerDependencyBlock(
    this: BlockProcessorDslInterface,
  ): void {
    this.named(DEPENDENCY_BLOCK);
    this.onContext("open");
    this.process(async function processDependencyBlock(
      this: BlockProcessor,
      parent: unknown,
      _reader: unknown,
      attrs: unknown,
    ): Promise<Block | undefined> {
      const attributes = attrs as Record<string, unknown>;
      const blockParent = parent as Block | Section;
      if (attributes?.payload) {
        return renderSnippetBlock(
          this,
          blockParent,
          snippetPayloadFromValue(attributes.payload),
        );
      }
      return renderSnippetBlock(this, blockParent, {
        ...dependencyPayload(blockTarget(attributes), attributes, context),
        kind: "dependency",
      });
    });
  });
}

function blockTarget(attrs: Record<string, unknown>): string {
  const positional = Array.isArray(attrs._positional) ? attrs._positional : [];
  const dollarPositional = Array.isArray(attrs.$positional)
    ? attrs.$positional
    : [];
  return String(
    attrs?.target ||
      attrs?.name ||
      attrs?.[2] ||
      positional[0] ||
      dollarPositional[0] ||
      "",
  );
}

function snippetPayloadFromValue(value: unknown): DependencyPayload {
  return JSON.parse(
    Buffer.from(String(value || ""), "base64url").toString("utf8"),
  ) as DependencyPayload;
}

function normalizeSnippetPayload(
  payload: DependencyPayload,
): DependencyPayload {
  return {
    ...payload,
    description: payload?.description || "",
    samples: normalizeSnippetSamples(payload?.samples),
    title: payload?.title || "",
  };
}

function normalizeSnippetSamples(samples: unknown): SnippetSample[] {
  return (Array.isArray(samples) ? samples : []).map((value) => {
    const sample = record(value);
    const normalized: SnippetSample = {
      language: String(sample.language || "text"),
      source: String(sample.source || "").trimEnd(),
    };
    if (sample.group) {
      normalized.group = String(sample.group);
    }
    if (sample.highlighterLanguage) {
      normalized.highlighterLanguage = String(sample.highlighterLanguage);
    }
    return normalized;
  });
}

function macroAttribute(
  attrs: MacroAttributes | undefined,
  name: string,
): string | undefined {
  if (attrs?.[name] !== undefined) {
    return cleanMacroAttributeValue(String(attrs[name]), name);
  }
  const positional = Array.isArray(attrs?.$positional)
    ? attrs.$positional.join(",")
    : undefined;
  const text = attrs?.text || positional;
  if (typeof text === "string") {
    const match = new RegExp(
      `(?:^|,)\\s*${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^,]+))`,
    ).exec(text);
    if (match) {
      return cleanMacroAttributeValue(
        (match[1] ?? match[2] ?? match[3] ?? "").trim(),
        name,
      );
    }
  }
  return undefined;
}

function cleanMacroAttributeValue(value: string, name: string): string {
  if (name !== "title") {
    return value;
  }
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && !trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && !trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1);
  }
  if (
    (!trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (!trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dependencyPayload(
  target: string,
  attrs: MacroAttributes,
  context: DependencyContext,
): DependencyPayload {
  const dependency = dependencyForTargetAndAttributes(
    target.trim(),
    attrs,
    context,
  );
  const gradle = gradleDependency(dependency);
  const maven = mavenDependency(dependency);
  return {
    title: dependency.title,
    description: dependency.description,
    samples: [
      {
        language: "gradle",
        highlighterLanguage: "gradle",
        source: gradle,
      },
      {
        language: "maven",
        highlighterLanguage: "maven",
        source: maven,
      },
    ],
  };
}

function dependencyForTargetAndAttributes(
  target: string,
  attrs: MacroAttributes,
  context: DependencyContext,
): Dependency {
  let groupId: string;
  let artifactId: string;
  let version: string | undefined;
  const groupAttribute =
    macroAttribute(attrs, "groupId") ||
    macroAttribute(attrs, "group") ||
    context.attributes?.projectGroup;

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
    gradleScope:
      macroAttribute(attrs, "gradleScope") ||
      toGradleScope(attrs) ||
      "implementation",
    mavenScope:
      macroAttribute(attrs, "mavenScope") || toMavenScope(attrs) || "compile",
    title: macroAttribute(attrs, "title") || "",
    description: macroAttribute(attrs, "description") || "",
  };
}

function toMavenScope(attrs: MacroAttributes): string {
  const scope = macroAttribute(attrs, "scope");
  if (!scope) {
    return "";
  }
  const scopes: Record<string, string> = {
    api: "compile",
    implementation: "compile",
    testCompile: "test",
    testRuntime: "test",
    testRuntimeOnly: "test",
    testImplementation: "test",
    developmentOnly: "provided",
    compileOnly: "provided",
    runtimeOnly: "runtime",
  };
  return scopes[scope] || scope;
}

function toGradleScope(attrs: MacroAttributes): string {
  const scope = macroAttribute(attrs, "scope");
  if (!scope) {
    return "";
  }
  const scopes: Record<string, string> = {
    compile: "implementation",
    testCompile: "testImplementation",
    test: "testImplementation",
    runtime: "runtimeOnly",
    provided: "developmentOnly",
  };
  return scopes[scope] || scope;
}

function gradleDependency(dependency: Dependency): string {
  const gav = `${dependency.groupId}:${dependency.artifactId}${dependency.version !== undefined || dependency.classifier !== undefined ? ":" : ""}${dependency.version || ""}${dependency.classifier !== undefined ? `:${dependency.classifier}` : ""}`;
  return `${dependency.gradleScope}("${gav}")`;
}

function mavenDependency(dependency: Dependency): string {
  if (dependency.mavenScope === "annotationProcessor") {
    return `<annotationProcessorPaths>
    <path>
        <groupId>${dependency.groupId}</groupId>
        <artifactId>${dependency.artifactId}</artifactId>${dependency.version ? `\n        <version>${dependency.version}</version>` : ""}${dependency.classifier ? `\n        <classifier>${dependency.classifier}</classifier>` : ""}
    </path>
</annotationProcessorPaths>`;
  }
  return `<dependency>
    <groupId>${dependency.groupId}</groupId>
    <artifactId>${dependency.artifactId}</artifactId>${dependency.version ? `\n    <version>${dependency.version}</version>` : ""}${dependency.mavenScope && dependency.mavenScope !== "compile" ? `\n    <scope>${dependency.mavenScope}</scope>` : ""}${dependency.classifier ? `\n    <classifier>${dependency.classifier}</classifier>` : ""}
</dependency>`;
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
