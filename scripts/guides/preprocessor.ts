import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

import {
  calloutMarkerForLanguage,
  calloutNumber,
  normalizeAsciiDocCallouts,
  normalizeSourceCalloutMarkers,
} from "../asciidoc/callouts.ts";
import { snippetPassthroughBlockLines } from "../asciidoc/snippet-blocks.ts";
import { parseAttributeList } from "../asciidoc/adoc-attributes.ts";
import { extractTaggedSource } from "../shared/tagged-source.ts";
import {
  appFeatures,
  cliCommandForApp,
  featuresWords,
  languageExtension,
  languageSourceDirectory,
} from "./model.ts";

const MACRO_LINE = /^([A-Za-z][A-Za-z0-9_-]*):([^\[]*)\[(.*)]\s*$/;
const DEFAULT_MIN_JDK = 21;
const LICENSE_INCLUDE = "common:license.adoc[]";

export async function preprocessGuideSource({
  guidesDirectory,
  guide,
  option,
}: any): Promise<any> {
  const sourceFile = path.join(guide.directory, guide.asciidoc);
  let source = await fs.readFile(sourceFile, "utf8");
  source = `${source.replace(/\s+$/, "")}\n\n${LICENSE_INCLUDE}\n`;
  const context = {
    guidesDirectory,
    guide,
    option,
    version: await readVersion(guidesDirectory),
  };
  const expanded = await expandLines(source.split(/\r?\n/), context, new Set());
  return replacePlaceholders(
    normalizeAsciiDocCallouts(expanded.join("\n")),
    context,
  );
}

async function expandLines(
  lines: any,
  context: any,
  includeStack: any,
): Promise<any> {
  const output = [];
  let excludeLanguage = false;
  let excludeBuild = false;
  let excludeMinJdk = false;
  let dependencyGroup = false;
  let groupedDependencies = [];

  for (const rawLine of lines) {
    const line = processGuideLinks(rawLine);
    if (line === ":exclude-for-languages:") {
      excludeLanguage = false;
      continue;
    }
    if (line === ":exclude-for-build:") {
      excludeBuild = false;
      continue;
    }
    if (line === ":exclude-for-jdk-lower-than:") {
      excludeMinJdk = false;
      continue;
    }
    if (excludeLanguage || excludeBuild || excludeMinJdk) {
      continue;
    }
    if (line.startsWith(":exclude-for-languages:")) {
      excludeLanguage = excludes(
        line,
        ":exclude-for-languages:",
        context.option.language,
      );
      continue;
    }
    if (line.startsWith(":exclude-for-build:")) {
      excludeBuild = excludes(
        line,
        ":exclude-for-build:",
        context.option.buildTool,
      );
      continue;
    }
    if (line.startsWith(":exclude-for-jdk-lower-than:")) {
      const threshold = Number.parseInt(
        line.slice(":exclude-for-jdk-lower-than:".length).trim(),
        10,
      );
      const guideMinJdk = Number.parseInt(
        context.guide.minimumJavaVersion || DEFAULT_MIN_JDK,
        10,
      );
      excludeMinJdk = Number.isFinite(threshold) && guideMinJdk >= threshold;
      continue;
    }
    if (line === ":dependencies:") {
      dependencyGroup = !dependencyGroup;
      if (!dependencyGroup) {
        output.push(...dependencyLines(groupedDependencies, context));
        groupedDependencies = [];
      }
      continue;
    }
    if (dependencyGroup && line.startsWith("dependency:")) {
      groupedDependencies.push(line);
      continue;
    }
    output.push(...(await expandMacroLine(line, context, includeStack)));
  }

  if (groupedDependencies.length) {
    output.push(...dependencyLines(groupedDependencies, context));
  }
  return output;
}

async function expandMacroLine(
  line: any,
  context: any,
  includeStack: any,
): Promise<any> {
  const match = MACRO_LINE.exec(line);
  if (!match) {
    return [line];
  }

  const [, type, target, rawAttributes] = match;
  const attributes = parseAttributes(rawAttributes);
  switch (type) {
    case "callout":
      return includeCallout(target, attributes, context, includeStack);
    case "common":
      if (target.trim() === "header-top.adoc") {
        return [];
      }
      return includeAdoc(
        commonSnippetPath(context.guidesDirectory, target),
        context,
        includeStack,
      );
    case "common-template":
      return includeTemplate(
        commonSnippetPath(context.guidesDirectory, target),
        attributes,
        context,
        includeStack,
      );
    case "dependency":
      return dependencyLines([line], context);
    case "diffLink":
      return [diffLink(target, attributes, context)];
    case "external":
      return includeAdoc(
        externalPath(context.guidesDirectory, target),
        context,
        includeStack,
      );
    case "external-template":
      return includeTemplate(
        externalPath(context.guidesDirectory, target),
        attributes,
        context,
        includeStack,
      );
    case "rawTest":
      return sourceBlock(target, attributes, context, "raw-test");
    case "resource":
      return resourceBlock(target, attributes, context, "main");
    case "rocker":
      return includeRocker(target, context);
    case "source":
      return sourceBlock(target, attributes, context, "main");
    case "test":
      return sourceBlock(target, attributes, context, "test");
    case "testResource":
      return resourceBlock(target, attributes, context, "test");
    case "zipInclude":
      return zipIncludeBlock(target, attributes, context);
    default:
      return [line];
  }
}

async function includeAdoc(
  file: any,
  context: any,
  includeStack: any,
): Promise<any> {
  const normalized = path.resolve(file);
  if (includeStack.has(normalized)) {
    return [];
  }
  try {
    const source = await fs.readFile(normalized, "utf8");
    includeStack.add(normalized);
    try {
      return expandLines(source.split(/\r?\n/), context, includeStack);
    } finally {
      includeStack.delete(normalized);
    }
  } catch {
    return [`NOTE: Missing include \`${path.basename(file)}\`.`];
  }
}

async function includeCallout(
  target: any,
  attributes: any,
  context: any,
  includeStack: any,
): Promise<any> {
  const lines = await includeAdoc(
    path.join(
      context.guidesDirectory,
      "src",
      "docs",
      "common",
      "callouts",
      `callout-${ensureSuffix(target.trim(), ".adoc")}`,
    ),
    context,
    includeStack,
  );
  const explicitNumber = calloutNumber(attributes);
  return lines.map((line: any): any => {
    const replaced = replaceTemplateArguments(line, attributes);
    return explicitNumber
      ? replaced.replace(/^<\.>/, `<${explicitNumber}>`)
      : replaced;
  });
}

async function includeTemplate(
  file: any,
  attributes: any,
  context: any,
  includeStack: any,
): Promise<any> {
  const lines = await includeAdoc(file, context, includeStack);
  return lines.map((line: any): any =>
    replaceTemplateArguments(line, attributes),
  );
}

async function includeRocker(target: any, context: any): Promise<any> {
  const file = path.join(
    context.guidesDirectory,
    "buildSrc",
    "src",
    "main",
    "java",
    "io",
    "micronaut",
    "guides",
    "feature",
    "template",
    `${target.trim()}.rocker.raw`,
  );
  try {
    return (await fs.readFile(file, "utf8")).split(/\r?\n/);
  } catch {
    return [`NOTE: Missing rocker template \`${target.trim()}\`.`];
  }
}

async function sourceBlock(
  target: any,
  attributes: any,
  context: any,
  kind: any,
): Promise<any> {
  const file = await findSourceFile(target.trim(), attributes, context, kind);
  if (!file) {
    return [`NOTE: Missing source \`${target.trim()}\`.`];
  }

  let source = await fs.readFile(file, "utf8");
  source = extractTaggedSource(source, tagSelection(attributes));
  source = normalizeSourceCalloutMarkers(source);
  if (!attributes.tags && !attributes.tag) {
    source = stripLicenseHeader(source);
  }
  source = normalizeIndent(source, attributes.indent);
  const title = path
    .relative(context.guide.directory, file)
    .replaceAll(path.sep, "/");
  return snippetPassthroughBlockLines("code", {
    title,
    samples: [
      {
        language: languageForFile(file, context.option.language),
        source,
      },
    ],
  });
}

async function resourceBlock(
  target: any,
  attributes: any,
  context: any,
  sourceSet: any,
): Promise<any> {
  const file = await findResourceFile(
    target.trim(),
    attributes,
    context,
    sourceSet,
  );
  if (!file) {
    return [`NOTE: Missing resource \`${target.trim()}\`.`];
  }

  let source = await fs.readFile(file, "utf8");
  source = extractTaggedSource(source, tagSelection(attributes));
  source = normalizeSourceCalloutMarkers(source);
  source = normalizeIndent(source, attributes.indent);
  const title = path
    .relative(context.guide.directory, file)
    .replaceAll(path.sep, "/");
  return snippetPassthroughBlockLines("code", {
    title,
    samples: [
      {
        language: languageForFile(file),
        source,
      },
    ],
  });
}

async function zipIncludeBlock(
  target: any,
  attributes: any,
  context: any,
): Promise<any> {
  const file = await findFileInSourceRoots(target.trim(), attributes, context);
  if (!file) {
    return [`NOTE: Missing zip include \`${target.trim()}\`.`];
  }
  let source = await fs.readFile(file, "utf8");
  source = extractTaggedSource(source, tagSelection(attributes));
  source = normalizeSourceCalloutMarkers(source);
  source = normalizeIndent(source, attributes.indent);
  return snippetPassthroughBlockLines("code", {
    title: target.trim(),
    samples: [
      {
        language: languageForFile(file),
        source,
      },
    ],
  });
}

function dependencyLines(lines: any, context: any): any {
  const dependencies = lines
    .map((line: any): any => MACRO_LINE.exec(line))
    .filter(Boolean)
    .map((match: any): any => ({
      artifactId: match[2].trim(),
      attributes: parseAttributes(match[3]),
    }));
  if (!dependencies.length) {
    return [];
  }

  if (context.option.buildTool === "maven") {
    const xml = dependencies
      .map(({ artifactId, attributes }: any): any => {
        const groupId =
          attributes.groupId || attributes.groupdId || "io.micronaut";
        const scope = attributes.scope
          ? `\n    <scope>${attributes.scope}</scope>`
          : "";
        const version = attributes.version
          ? `\n    <version>${attributes.version}</version>`
          : "";
        const marker = calloutMarkerForLanguage(attributes, "xml");
        return `<dependency>${marker}
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>${version}${scope}
</dependency>`;
      })
      .join("\n");
    return snippetPassthroughBlockLines("dependency", {
      title: "Dependency",
      samples: [
        {
          highlighterLanguage: "xml",
          language: "maven",
          source: xml,
        },
      ],
    });
  }

  const gradleScope = {
    test: "testImplementation",
    testImplementation: "testImplementation",
    runtime: "runtimeOnly",
    runtimeOnly: "runtimeOnly",
    compileOnly: "compileOnly",
    annotationProcessor: "annotationProcessor",
  } as Record<string, string>;
  const gradle = dependencies
    .map(({ artifactId, attributes }: any): any => {
      const groupId =
        attributes.groupId || attributes.groupdId || "io.micronaut";
      const scope =
        gradleScope[attributes.scope] || attributes.scope || "implementation";
      const version = attributes.version ? `:${attributes.version}` : "";
      return `${scope}("${groupId}:${artifactId}${version}")${calloutMarkerForLanguage(attributes, "gradle")}`;
    })
    .join("\n");
  return snippetPassthroughBlockLines("dependency", {
    title: "Dependency",
    samples: [
      {
        highlighterLanguage: "groovy",
        language: "gradle",
        source: gradle,
      },
    ],
  });
}

async function findSourceFile(
  target: any,
  attributes: any,
  context: any,
  kind: any,
): Promise<any> {
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
      ...guideSourceRoots(context).flatMap((root: any): any => [
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
  target: any,
  attributes: any,
  context: any,
  sourceSet: any,
): Promise<any> {
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
      ...guideSourceRoots(context).flatMap((root: any): any => [
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
  target: any,
  attributes: any,
  context: any,
): Promise<any> {
  const app = attributes.app || "";
  return findExisting(
    context,
    [
      path.join(context.guide.directory, app, target),
      path.join(context.guide.directory, target),
      ...guideSourceRoots(context).flatMap((root: any): any => [
        path.join(root, app, target),
        path.join(root, target),
      ]),
    ],
    path.basename(target),
  );
}

async function findExisting(
  context: any,
  candidates: any,
  fallbackName: any,
  requiredSegment: any = "",
): Promise<any> {
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

async function findByName(
  root: any,
  name: any,
  requiredSegment: any = "",
): Promise<any> {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return undefined;
  }
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      const found = await findByName(fullPath, name, requiredSegment);
      if (found) {
        return found;
      }
    } else if (entry.isFile() && entry.name === name) {
      const normalized = fullPath.replaceAll(path.sep, "/");
      if (!requiredSegment || normalized.includes(requiredSegment)) {
        return fullPath;
      }
    }
  }
  return undefined;
}

function guideSourceRoots(context: any): any {
  if (!context.guide.base) {
    return [];
  }
  return [path.join(context.guidesDirectory, "guides", context.guide.base)];
}

function replacePlaceholders(source: any, context: any): any {
  let text = source
    .replaceAll("{githubSlug}", context.guide.slug)
    .replaceAll("@guideTitle@", context.guide.title)
    .replaceAll("@guideIntro@", context.guide.intro)
    .replaceAll("@micronaut@", context.version)
    .replaceAll("@micronautVersion@", context.version)
    .replaceAll("@language@", context.option.languageLabel)
    .replaceAll("@lang@", context.option.language)
    .replaceAll("@build@", context.option.buildTool)
    .replaceAll("@testFramework@", context.option.testFramework)
    .replaceAll("@authors@", context.guide.authors.join(", "))
    .replaceAll(
      "@languageextension@",
      languageExtension(context.option.language),
    )
    .replaceAll(
      "@testsuffix@",
      context.option.testFramework === "spock" ? "Spec" : "Test",
    )
    .replaceAll("@sourceDir@", context.option.sourceDir)
    .replaceAll(
      "@minJdk@",
      String(context.guide.minimumJavaVersion || DEFAULT_MIN_JDK),
    )
    .replaceAll("@api@", "https://docs.micronaut.io/latest/api");

  text = rewriteIncludeTargets(text, context);
  text = text.replace(/@([\w-]*):?cli-command@/g, (_: any, appName: any): any =>
    cliCommandForApp(findApp(context.guide, appName || "default")),
  );
  text = text.replace(/@([\w-]*):?features@/g, (_: any, appName: any): any =>
    appFeatures(context.guide, context.option, appName || "default").join(","),
  );
  text = text.replace(
    /@([\w-]*):?features-words@/g,
    (_: any, appName: any): any =>
      featuresWords(
        appFeatures(context.guide, context.option, appName || "default"),
      ),
  );
  return text;
}

function processGuideLinks(line: any): any {
  return line.replace(/guideLink:([^\[]+)\[([^\]]+)]/g, "link:$1.html[$2]");
}

function diffLink(_target: any, attributes: any, context: any): any {
  const appName = attributes.app || "default";
  const app = findApp(context.guide, appName);
  const excluded = new Set(
    (attributes.featureExcludes || "").split("|").filter(Boolean),
  );
  const features = (
    attributes.features
      ? attributes.features.split("|")
      : appFeatures(context.guide, context.option, appName)
  ).filter((feature: any): any => feature && !excluded.has(feature));
  const params = new URLSearchParams();
  for (const feature of features) {
    params.append("features", feature);
  }
  params.set("lang", context.option.language.toUpperCase());
  params.set("build", context.option.buildTool.toUpperCase());
  params.set("test", context.option.testFramework.toUpperCase());
  params.set("name", appName === "default" ? "micronautguide" : appName);
  params.set("type", String(app?.applicationType || "DEFAULT").toUpperCase());
  params.set("package", "example.micronaut");
  params.set("activity", "diff");
  return `https://micronaut.io/launch?${params.toString()}[Diff, window="_blank"]`;
}

type Attributes = Record<string, string> & { _positional?: string[] };

function parseAttributes(source: any): Attributes {
  return parseAttributeList(String(source || ""), {
    positionalKey: "_positional",
  }) as Attributes;
}

function tagSelection(attributes: any): any {
  return (attributes.tags || attributes.tag || "").replaceAll("|", ",");
}

function rewriteIncludeTargets(source: any, context: any): any {
  return source.replace(
    /^include::([^\[]+)\[([^\]]*)]/gm,
    (match: any, target: any, attributes: any): any => {
      const resolved = resolveGuideIncludeTarget(target, context);
      return resolved ? `include::${resolved}[${attributes}]` : match;
    },
  );
}

function resolveGuideIncludeTarget(target: any, context: any): any {
  const normalized = target
    .replaceAll("\\", "/")
    .replaceAll("@sourceDir@", context.option.sourceDir)
    .replaceAll("@lang@", context.option.language)
    .replaceAll(
      "@languageextension@",
      languageExtension(context.option.language),
    );
  const candidates = includeTargetCandidates(normalized, context);
  for (const candidate of candidates) {
    const found = findExistingIncludeTarget(candidate, context);
    if (found) {
      return found;
    }
  }
  return "";
}

function includeTargetCandidates(target: any, context: any): any {
  const candidates = [target];
  const withoutAttributeRoot = target.replace(/^\{sourceDir}\//, "");
  candidates.push(withoutAttributeRoot);

  const prefixedOption = `${context.guide.slug}/${context.option.sourceDir}/`;
  if (withoutAttributeRoot.startsWith(prefixedOption)) {
    candidates.push(withoutAttributeRoot.slice(prefixedOption.length));
  }

  const prefixedSlug = `${context.guide.slug}/`;
  if (withoutAttributeRoot.startsWith(prefixedSlug)) {
    candidates.push(withoutAttributeRoot.slice(prefixedSlug.length));
  }

  for (const candidate of [...candidates]) {
    if (candidate.startsWith("src/")) {
      candidates.push(`${context.option.language}/${candidate}`);
    }
  }

  return [...new Set(candidates.filter(Boolean))];
}

function findExistingIncludeTarget(candidate: any, context: any): any {
  if (path.isAbsolute(candidate) && existsSync(candidate)) {
    return candidate.replaceAll(path.sep, "/");
  }
  for (const root of [context.guide.directory, ...guideSourceRoots(context)]) {
    const file = path.join(root, candidate);
    if (existsSync(file)) {
      return path
        .relative(context.guide.directory, file)
        .replaceAll(path.sep, "/");
    }
  }
  return "";
}

function replaceTemplateArguments(line: any, attributes: any): any {
  return line.replace(
    /\{(\d+)(?:_([UL]))?}/g,
    (match: any, index: any, transform: any): any => {
      const value = attributes[`arg${index}`];
      if (value === undefined) {
        return match;
      }
      if (transform === "U") {
        return value.toUpperCase();
      }
      if (transform === "L") {
        return value.toLowerCase();
      }
      return value;
    },
  );
}

function commonSnippetPath(guidesDirectory: any, target: any): any {
  return path.join(
    guidesDirectory,
    "src",
    "docs",
    "common",
    "snippets",
    `common-${ensureSuffix(target.trim(), ".adoc")}`,
  );
}

function externalPath(guidesDirectory: any, target: any): any {
  return path.join(
    guidesDirectory,
    "guides",
    ensureSuffix(target.trim(), ".adoc"),
  );
}

function ensureSuffix(value: any, suffix: any): any {
  return value.endsWith(suffix) ? value : `${value}${suffix}`;
}

function excludes(line: any, prefix: any, value: any): any {
  return line
    .slice(prefix.length)
    .split(",")
    .some(
      (item: any): any => item.trim().toLowerCase() === value.toLowerCase(),
    );
}

function rawTestExtension(testFramework: any): any {
  return testFramework === "spock" ? "groovy" : "java";
}

function rawTestSourceDirectory(testFramework: any): any {
  return testFramework === "spock" ? "src/test/groovy" : "src/test/java";
}

function stripLicenseHeader(source: any): any {
  return source.replace(
    /^\/\*[\s\S]*?Licensed under the Apache License[\s\S]*?\*\/\s*/i,
    "",
  );
}

function normalizeIndent(source: any, indentValue: any): any {
  const indent = Number.parseInt(indentValue || "0", 10);
  if (!Number.isFinite(indent) || indent <= 0) {
    return source.trim();
  }
  const prefix = " ".repeat(indent);
  return source
    .trim()
    .split(/\r?\n/)
    .map((line: any): any => `${prefix}${line}`)
    .join("\n");
}

function languageForFile(file: any, fallback: any = "text"): any {
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

function findApp(guide: any, appName: any): any {
  return (
    guide.apps.find((app: any): any => app.name === appName) || guide.apps[0]
  );
}

async function readVersion(guidesDirectory: any): Promise<any> {
  try {
    return (
      await fs.readFile(path.join(guidesDirectory, "version.txt"), "utf8")
    ).trim();
  } catch {
    return "";
  }
}

function escapeRegExp(value: any): any {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
