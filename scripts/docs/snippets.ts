import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { splitList } from "../shared/cli.ts";
import { extractTaggedSource } from "../shared/tagged-source.ts";
import { macroAttribute } from "./listing.ts";
import { snippetMarkerHtml } from "./snippet-markers.ts";

export function snippetBlocksHtml(target: any, attrs: any, context: any): any {
  const deduped = snippetSamples(target, attrs, context);
  if (!deduped.length) {
    return "";
  }
  return snippetMarkerHtml("code", {
    title: macroAttribute(attrs, "title") || "",
    description: macroAttribute(attrs, "description") || "",
    samples: deduped.map((sample: any): any => ({
      language: sample.language,
      source: sample.source,
    })),
  });
}

export function expandSnippetMacrosForCallouts(source: any, context: any): any {
  const lines = source.split(/\r?\n/);
  const output = [];
  let delimiter: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (delimiter) {
      output.push(line);
      if (trimmed === delimiter) {
        delimiter = undefined;
      }
      continue;
    }

    const delimiterMatch = /^(-{4,}|\.{4,}|\+{4,}|_{4,})$/.exec(trimmed);
    if (delimiterMatch) {
      delimiter = delimiterMatch[1];
      output.push(line);
      continue;
    }

    const macroMatch = /^snippet::([^\[]+)\[(.*)]\s*$/.exec(line);
    if (!macroMatch) {
      output.push(line);
      continue;
    }

    const attrs = parseMacroAttributes(macroMatch[2]);
    const samples = snippetSamples(macroMatch[1], attrs, context);
    if (!samples.length) {
      output.push(line);
      continue;
    }

    output.push(
      [
        "++++",
        snippetMarkerHtml("code", {
          title: macroAttribute(attrs, "title") || "",
          description: macroAttribute(attrs, "description") || "",
          samples: samples.map((sample: any): any => ({
            language: sample.language,
            source: sample.source,
          })),
        }),
        "++++",
        snippetCalloutValidationBlock(samples),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return output.join("\n");
}

function snippetSamples(target: any, attrs: any, context: any): any {
  const samples = [];
  for (const snippetTarget of splitList(target)) {
    samples.push(...findSnippetSamplesSync(snippetTarget, attrs, context));
  }
  return dedupeSamples(samples);
}

function snippetCalloutValidationBlock(samples: any): any {
  const source = samples
    .map((sample: any): any => sample.source)
    .filter((sampleSource: any): any => /<\d+>/.test(sampleSource))
    .join("\n");
  if (!source) {
    return "";
  }
  const delimiter = sourceBlockDelimiter(source);
  return [
    "[.docs-snippet-callout-validation]",
    delimiter,
    source,
    delimiter,
  ].join("\n");
}

function sourceBlockDelimiter(source: any): any {
  const longestHyphenRun = Math.max(
    3,
    ...Array.from(source.matchAll(/^-{4,}$/gm)).map(
      (match: any): any => match[0].length,
    ),
  );
  return "-".repeat(longestHyphenRun + 1);
}

function parseMacroAttributes(text: any): any {
  const attrs: any = { text };
  const positional = [];
  for (const part of splitAttributeList(text)) {
    const separator = part.indexOf("=");
    if (separator < 0) {
      const value = cleanAttributeValue(part);
      if (value) {
        positional.push(value);
      }
      continue;
    }
    const name = part.slice(0, separator).trim();
    if (name) {
      attrs[name] = cleanAttributeValue(part.slice(separator + 1));
    }
  }
  if (positional.length) {
    attrs.$positional = positional;
  }
  return attrs;
}

function splitAttributeList(text: any): any {
  const parts = [];
  let current = "";
  let quote: string | undefined;
  for (const char of String(text || "")) {
    if ((char === '"' || char === "'") && !quote) {
      quote = char;
      current += char;
      continue;
    }
    if (char === quote) {
      quote = undefined;
      current += char;
      continue;
    }
    if (char === "," && !quote) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

function cleanAttributeValue(value: any): any {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function findSnippetSamplesSync(target: any, attrs: any, context: any): any {
  const baseDirectories = snippetBaseDirectoriesSync(attrs, context);
  const sources = macroAttribute(attrs, "source")
    ? [macroAttribute(attrs, "source")]
    : ["test", "main"];
  const explicit = explicitSnippetLanguage(target);
  const languages = explicit ? [explicit] : languagesToRender(context);
  const samples = [];
  for (const baseDirectory of baseDirectories) {
    for (const sourceSet of sources) {
      for (const [language, extension] of languages) {
        const file = path.join(
          baseDirectory,
          "src",
          sourceSet,
          language,
          `${snippetPathTarget(target, extension)}.${extension}`,
        );
        if (!existsSync(file) || !statSync(file).isFile()) {
          continue;
        }
        let source = readFileSync(file, "utf8");
        source = extractTaggedSource(
          source,
          macroAttribute(attrs, "tags") || macroAttribute(attrs, "tag") || "",
        );
        source = normalizeSnippetIndent(
          source,
          macroAttribute(attrs, "indent"),
        );
        if (source.trim()) {
          samples.push({ language, source });
        }
      }
    }
  }
  return samples;
}

function languagesToRender(context: any): any {
  const defaultLanguage = context.attributes["default-language"];
  const languages = [
    ["java", "java"],
    ["python", "py"],
    ["kotlin", "kt"],
    ["groovy", "groovy"],
  ];
  return defaultLanguage
    ? languages.filter(([language]: any): any => language === defaultLanguage)
    : languages;
}

function explicitSnippetLanguage(target: any): any {
  if (target.endsWith(".java")) return ["java", "java"];
  if (target.endsWith(".py")) return ["python", "py"];
  if (target.endsWith(".kt")) return ["kotlin", "kt"];
  if (target.endsWith(".groovy")) return ["groovy", "groovy"];
  return undefined;
}

function snippetPathTarget(target: any, extension: any): any {
  const suffix = `.${extension}`;
  const normalized = target.endsWith(suffix)
    ? target.slice(0, -suffix.length)
    : target;
  return normalized.replaceAll(".", path.sep);
}

function snippetBaseDirectoriesSync(attrs: any, context: any): any {
  const project = macroAttribute(attrs, "project");
  if (project) {
    return [path.join(context.submoduleDirectory, project)];
  }
  const projectBase = macroAttribute(attrs, "project-base");
  if (projectBase) {
    const requested = path.join(context.submoduleDirectory, projectBase);
    const directories = [];
    if (existsSync(requested) && statSync(requested).isDirectory()) {
      directories.push(requested);
    }
    const parent = path.dirname(requested);
    const baseName = path.basename(requested);
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith(`${baseName}-`)) {
        directories.push(path.join(parent, entry.name));
      }
    }
    return sortSnippetDirectories([...new Set(directories)]);
  }
  return [
    path.join(context.submoduleDirectory, "test-suite"),
    path.join(context.submoduleDirectory, "test-suite-python"),
    path.join(context.submoduleDirectory, "test-suite-kotlin"),
    path.join(context.submoduleDirectory, "test-suite-groovy"),
    context.submoduleDirectory,
  ];
}

function sortSnippetDirectories(directories: any): any {
  const rank = (value: any): any => {
    if (value.endsWith("-java")) return 0;
    if (value.endsWith("-python")) return 1;
    if (value.endsWith("-kotlin")) return 2;
    if (value.endsWith("-kotlin-ksp")) return 3;
    if (value.endsWith("-groovy")) return 4;
    return 5;
  };
  return directories.sort(
    (left: any, right: any): any =>
      rank(left) - rank(right) || left.localeCompare(right),
  );
}

function normalizeSnippetIndent(source: any, indentValue: any): any {
  const lines = source.replace(/\s+$/, "").split(/\r?\n/);
  const nonBlank = lines.filter((line: any): any => line.trim());
  const commonIndent = nonBlank.length
    ? Math.min(
        ...nonBlank.map(
          (line: any): any =>
            line.match(/^[ \t]*/)[0].replaceAll("\t", "    ").length,
        ),
      )
    : 0;
  const indent = Number.parseInt(indentValue || "0", 10);
  const prefix =
    Number.isFinite(indent) && indent > 0 ? " ".repeat(indent) : "";
  return lines
    .map(
      (line: any): any =>
        prefix + line.slice(Math.min(commonIndent, line.length)),
    )
    .join("\n");
}

function dedupeSamples(samples: any): any {
  const seen = new Set();
  return samples.filter((sample: any): any => {
    const key = `${sample.language}:${sample.source}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
