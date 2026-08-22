// @ts-nocheck -- @asciidoctor/core does not model async extension callbacks.
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  Block,
  BlockMacroProcessor,
  MacroProcessorDslInterface,
  Registry,
  Section,
} from "@asciidoctor/core";

import {
  type MacroPayload,
  macroPayload,
} from "../../asciidoc/extensions/macro-attributes.ts";
import {
  missingNotePayload,
  renderSnippetBlock,
} from "../../asciidoc/extensions/snippet-block-renderer.ts";
import { splitList } from "../../shared/cli.ts";
import {
  extractTaggedSourceWithDiagnostics,
  normalizeSnippetIndent,
  taggedSourceDiagnosticMessage,
} from "../../shared/tagged-source.ts";
import {
  guideSourceRoots,
  languageExtension,
  languageSourceDirectory,
  type GuideRenderContext,
} from "../model.ts";

const GRAALPY_MAVEN_PLUGIN_TAG = "graalpy-maven-plugin";
const GRAALPY_PYTHON_PACKAGES_BY_FEATURE = new Map([
  ["graalpy-pygal", ["pygal==3.0.4"]],
]);

type GuideSnippetPayloadResolver = (
  payload: MacroPayload,
) => Promise<Record<string, unknown>>;

type GuideSnippetPayload = {
  kind: "code";
  title: string;
  samples: Array<{
    language: string;
    source: string;
  }>;
};

type SourceSnippetKind = "main" | "test" | "raw-test";
type ResourceSourceSet = "main" | "test";

export function registerGuideSnippetBlocks(
  registry: Registry,
  context: GuideRenderContext,
): void {
  registerGuideSnippetBlock(registry, "source", (payload) =>
    sourceSnippetPayload(payload.target, payload.attributes, context, "main"),
  );
  registerGuideSnippetBlock(registry, "test", (payload) =>
    sourceSnippetPayload(payload.target, payload.attributes, context, "test"),
  );
  registerGuideSnippetBlock(registry, "rawTest", (payload) =>
    sourceSnippetPayload(
      payload.target,
      payload.attributes,
      context,
      "raw-test",
    ),
  );
  registerGuideSnippetBlock(registry, "resource", (payload) =>
    resourceSnippetPayload(payload.target, payload.attributes, context, "main"),
  );
  registerGuideSnippetBlock(registry, "testResource", (payload) =>
    resourceSnippetPayload(payload.target, payload.attributes, context, "test"),
  );
  registerGuideSnippetBlock(registry, "zipInclude", (payload) =>
    zipIncludeSnippetPayload(payload.target, payload.attributes, context),
  );
}

function registerGuideSnippetBlock(
  registry: Registry,
  macroName: string,
  resolvePayload: GuideSnippetPayloadResolver,
): void {
  registry.blockMacro(
    macroName,
    function registerGuideSnippetMacro(this: MacroProcessorDslInterface): void {
      this.process(async function processGuideSnippetMacro(
        this: BlockMacroProcessor,
        parent: unknown,
        target: unknown,
        attrs: unknown,
      ): Promise<Block> {
        return renderSnippetBlock(
          this,
          parent as Block | Section,
          await resolvePayload(macroPayload(String(target), attrs)),
          { manualCallouts: "inline" },
        );
      });
    },
  );
}

async function sourceSnippetPayload(
  target: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
  kind: SourceSnippetKind,
): Promise<GuideSnippetPayload> {
  const file = await findSourceFile(target.trim(), attributes, context, kind);
  if (!file) {
    return missingNotePayload(`Missing source \`${target.trim()}\`.`);
  }

  const read = await readSnippetSource(file, attributes, context, {
    stripLicenseHeader: !attributes.tags && !attributes.tag,
  });
  if (!read.ok) {
    return read.payload;
  }
  return snippetPayload(
    relativeGuideFile(context, file),
    languageForFile(file, context.option.language),
    read.source,
  );
}

async function resourceSnippetPayload(
  target: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
  sourceSet: ResourceSourceSet,
): Promise<GuideSnippetPayload> {
  const file = await findResourceFile(
    target.trim(),
    attributes,
    context,
    sourceSet,
  );
  if (!file) {
    const syntheticPayload = syntheticResourceSnippetPayload(
      target.trim(),
      attributes,
      context,
      sourceSet,
    );
    if (syntheticPayload) {
      return syntheticPayload;
    }
    return missingNotePayload(`Missing resource \`${target.trim()}\`.`);
  }

  const read = await readSnippetSource(file, attributes, context);
  if (!read.ok) {
    return read.payload;
  }
  return snippetPayload(
    relativeGuideFile(context, file),
    languageForFile(file),
    read.source,
  );
}

function syntheticResourceSnippetPayload(
  target: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
  sourceSet: ResourceSourceSet,
): GuideSnippetPayload | undefined {
  if (
    sourceSet !== "main" ||
    context.option.buildTool !== "maven" ||
    target.replaceAll("\\", "/") !== "../../../pom.xml"
  ) {
    return undefined;
  }
  const tags = splitList(tagSelection(attributes));
  if (tags.length && !tags.includes(GRAALPY_MAVEN_PLUGIN_TAG)) {
    return undefined;
  }

  const packages = graalPyPythonPackages(context);
  if (!packages.length) {
    return undefined;
  }

  return {
    kind: "code",
    title: "pom.xml",
    samples: [
      {
        language: "xml",
        source: normalizeSnippetIndent(
          graalPyMavenPluginSource(packages),
          attributes.indent,
        ),
      },
    ],
  };
}

function graalPyPythonPackages(context: GuideRenderContext): string[] {
  const packages = new Set<string>();
  for (const app of context.guide.apps) {
    for (const feature of [...app.features, ...(app.invisibleFeatures || [])]) {
      for (const pythonPackage of GRAALPY_PYTHON_PACKAGES_BY_FEATURE.get(
        feature,
      ) || []) {
        packages.add(pythonPackage);
      }
    }
  }
  return [...packages];
}

function graalPyMavenPluginSource(packages: string[]): string {
  const packageLines = packages
    .map((pythonPackage) => `        <package>${pythonPackage}</package>`)
    .join("\n");
  return [
    "<plugin>",
    "    <groupId>org.graalvm.python</groupId>",
    "    <artifactId>graalpy-maven-plugin</artifactId>",
    "    <configuration>",
    "      <packages>",
    packageLines,
    "      </packages>",
    "    </configuration>",
    "    <executions>",
    "      <execution>",
    "        <goals>",
    "          <goal>process-graalpy-resources</goal>",
    "        </goals>",
    "      </execution>",
    "    </executions>",
    "</plugin>",
  ].join("\n");
}

async function zipIncludeSnippetPayload(
  target: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
): Promise<GuideSnippetPayload> {
  const file = await findFileInSourceRoots(target.trim(), attributes, context);
  if (!file) {
    return missingNotePayload(`Missing zip include \`${target.trim()}\`.`);
  }
  const read = await readSnippetSource(file, attributes, context);
  if (!read.ok) {
    return read.payload;
  }
  return snippetPayload(target.trim(), languageForFile(file), read.source);
}

type SnippetSourceRead =
  { ok: true; source: string } | { ok: false; payload: GuideSnippetPayload };

// Every guide snippet kind reads a file, selects the requested tag regions,
// and normalizes callout markers and indentation the same way; only license
// stripping varies, and only untagged main sources strip it.
async function readSnippetSource(
  file: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
  options: { stripLicenseHeader?: boolean } = {},
): Promise<SnippetSourceRead> {
  const taggedSource = extractTaggedSourceWithDiagnostics(
    await fs.readFile(file, "utf8"),
    tagSelection(attributes),
  );
  if (taggedSource.diagnostics.length) {
    return {
      ok: false,
      payload: missingNotePayload(
        taggedSourceDiagnosticMessage(
          taggedSource.diagnostics,
          relativeGuideFile(context, file),
        ),
      ),
    };
  }
  let source = normalizeSourceCalloutMarkers(taggedSource.source);
  if (options.stripLicenseHeader) {
    source = stripLicenseHeader(source);
  }
  return {
    ok: true,
    source: normalizeSnippetIndent(source, attributes.indent),
  };
}

function snippetPayload(
  title: string,
  language: string,
  source: string,
): GuideSnippetPayload {
  return { kind: "code", title, samples: [{ language, source }] };
}

function relativeGuideFile(context: GuideRenderContext, file: string): string {
  return path.relative(context.guide.directory, file).replaceAll(path.sep, "/");
}

async function findSourceFile(
  target: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
  kind: SourceSnippetKind,
): Promise<string | undefined> {
  const app = attributes.app || "";
  const sourceSet = kind === "main" ? "main" : "test";
  const extension =
    kind === "raw-test"
      ? rawTestExtension(context.option.testFramework)
      : languageExtension(context.option.language);
  const sourceDirectory =
    kind === "raw-test"
      ? rawTestSourceDirectory(context.option.testFramework)
      : languageSourceDirectory(context.option.language, sourceSet);
  const className =
    kind === "test" && target.endsWith("Test")
      ? `${target.slice(0, -"Test".length)}${context.option.testFramework === "spock" ? "Spec" : "Test"}`
      : target;
  const sourcePath = path.join(
    sourceDirectory,
    "example",
    "micronaut",
    `${className}.${extension}`,
  );
  const relativePath = path.join(app, sourcePath);
  return findExisting(
    context,
    [
      path.join(context.guide.directory, relativePath),
      path.join(
        context.guide.directory,
        app,
        context.option.language,
        sourcePath,
      ),
      path.join(context.guide.directory, context.option.language, sourcePath),
      ...guideSourceRoots(context).flatMap((root) => [
        path.join(root, relativePath),
        path.join(root, app, context.option.language, sourcePath),
        path.join(root, context.option.language, sourcePath),
      ]),
    ],
    path.basename(`${className}.${extension}`),
    sourceSet,
  );
}

async function findResourceFile(
  target: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
  sourceSet: ResourceSourceSet,
): Promise<string | undefined> {
  const app = attributes.app || "";
  const resourcePathWithoutApp = target.startsWith("../")
    ? path.join(`src/${sourceSet}`, target.slice("../".length))
    : path.join(`src/${sourceSet}`, "resources", target);
  const resourcePath = target.startsWith("../")
    ? path.join(app, `src/${sourceSet}`, target.slice("../".length))
    : path.join(app, `src/${sourceSet}`, "resources", target);
  return findExisting(
    context,
    [
      path.join(context.guide.directory, resourcePath),
      path.join(
        context.guide.directory,
        app,
        context.option.language,
        resourcePathWithoutApp,
      ),
      path.join(
        context.guide.directory,
        context.option.language,
        resourcePathWithoutApp,
      ),
      ...guideSourceRoots(context).flatMap((root) => [
        path.join(root, resourcePath),
        path.join(root, app, context.option.language, resourcePathWithoutApp),
        path.join(root, context.option.language, resourcePathWithoutApp),
      ]),
    ],
    path.basename(target),
    `src/${sourceSet}/resources`,
  );
}

async function findFileInSourceRoots(
  target: string,
  attributes: Record<string, string>,
  context: GuideRenderContext,
): Promise<string | undefined> {
  const app = attributes.app || "";
  return findExisting(
    context,
    [
      path.join(context.guide.directory, app, target),
      path.join(context.guide.directory, target),
      ...guideSourceRoots(context).flatMap((root) => [
        path.join(root, app, target),
        path.join(root, target),
      ]),
    ],
    path.basename(target),
  );
}

async function findExisting(
  context: GuideRenderContext,
  candidates: string[],
  fallbackName: string,
  requiredSegment = "",
): Promise<string | undefined> {
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        return candidate;
      }
    } catch {
      // Try walking below.
    }
  }

  for (const root of [context.guide.directory, ...guideSourceRoots(context)]) {
    const found = await findByName(root, fallbackName, requiredSegment);
    if (found) {
      return found;
    }
  }
  return undefined;
}

// A guide directory is walked once per render process; every unresolved
// snippet of every option of that guide then searches the cached listing.
const directoryListings = new Map<string, Promise<string[]>>();

async function findByName(
  root: string,
  name: string,
  requiredSegment = "",
): Promise<string | undefined> {
  return (await listFiles(root)).find((file) => {
    const normalized = file.replaceAll(path.sep, "/");
    return (
      path.basename(file) === name &&
      (!requiredSegment || normalized.includes(requiredSegment))
    );
  });
}

function listFiles(root: string): Promise<string[]> {
  let listing = directoryListings.get(root);
  if (!listing) {
    listing = walkFiles(root);
    directoryListings.set(root, listing);
  }
  return listing;
}

async function walkFiles(root: string): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

export function normalizeSourceCalloutMarkers(source: unknown): string {
  return String(source || "").replace(
    /(^|[ \t])((?:\/\/|#|;)[ \t]*)(\d+)>$/gm,
    "$1$2<$3>",
  );
}

function tagSelection(attributes: Record<string, string>): string {
  return (attributes.tags || attributes.tag || "").replaceAll("|", ",");
}

function rawTestExtension(testFramework: string): string {
  return testFramework === "spock" ? "groovy" : "java";
}

function rawTestSourceDirectory(testFramework: string): string {
  return testFramework === "spock" ? "src/test/groovy" : "src/test/java";
}

function stripLicenseHeader(source: string): string {
  return source.replace(
    /^\/\*[\s\S]*?Licensed under the Apache License[\s\S]*?\*\/\s*/i,
    "",
  );
}

function languageForFile(file: string, fallback = "text"): string {
  const extension = path.extname(file).toLowerCase().slice(1);
  return (
    {
      gradle: "groovy",
      hbs: "html",
      java: "java",
      json: "json",
      kt: "kotlin",
      groovy: "groovy",
      properties: "properties",
      toml: "toml",
      vm: "html",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
    }[extension] ||
    extension ||
    fallback
  );
}
