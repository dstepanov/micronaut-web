import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { splitList } from "./cli.mjs";
import { listingBlockHtml, macroAttribute } from "./listing.mjs";

export function snippetBlocksHtml(target, attrs, context) {
  const samples = [];
  for (const snippetTarget of splitList(target)) {
    samples.push(...findSnippetSamplesSync(snippetTarget, attrs, context));
  }
  return dedupeSamples(samples).map((sample, index) =>
    listingBlockHtml(sample.source, sample.language, index === 0 ? macroAttribute(attrs, "title") || "" : "", "multi-language-sample")
  ).join("\n");
}

function findSnippetSamplesSync(target, attrs, context) {
  const baseDirectories = snippetBaseDirectoriesSync(attrs, context);
  const sources = macroAttribute(attrs, "source") ? [macroAttribute(attrs, "source")] : ["test", "main"];
  const explicit = explicitSnippetLanguage(target);
  const languages = explicit ? [explicit] : languagesToRender(context);
  const samples = [];
  for (const baseDirectory of baseDirectories) {
    for (const sourceSet of sources) {
      for (const [language, extension] of languages) {
        const file = path.join(baseDirectory, "src", sourceSet, language, `${snippetPathTarget(target, extension)}.${extension}`);
        if (!existsSync(file) || !statSync(file).isFile()) {
          continue;
        }
        let source = readFileSync(file, "utf8");
        source = extractTaggedSource(source, macroAttribute(attrs, "tags") || macroAttribute(attrs, "tag") || "");
        source = normalizeSnippetIndent(source, macroAttribute(attrs, "indent"));
        if (source.trim()) {
          samples.push({ language, source });
        }
      }
    }
  }
  return samples;
}

function languagesToRender(context) {
  const defaultLanguage = context.attributes["default-language"];
  const languages = [
    ["java", "java"],
    ["python", "py"],
    ["kotlin", "kt"],
    ["groovy", "groovy"]
  ];
  return defaultLanguage ? languages.filter(([language]) => language === defaultLanguage) : languages;
}

function explicitSnippetLanguage(target) {
  if (target.endsWith(".java")) return ["java", "java"];
  if (target.endsWith(".py")) return ["python", "py"];
  if (target.endsWith(".kt")) return ["kotlin", "kt"];
  if (target.endsWith(".groovy")) return ["groovy", "groovy"];
  return undefined;
}

function snippetPathTarget(target, extension) {
  const suffix = `.${extension}`;
  const normalized = target.endsWith(suffix) ? target.slice(0, -suffix.length) : target;
  return normalized.replaceAll(".", path.sep);
}

function snippetBaseDirectoriesSync(attrs, context) {
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
    context.submoduleDirectory
  ];
}

function sortSnippetDirectories(directories) {
  const rank = (value) => {
    if (value.endsWith("-java")) return 0;
    if (value.endsWith("-python")) return 1;
    if (value.endsWith("-kotlin")) return 2;
    if (value.endsWith("-kotlin-ksp")) return 3;
    if (value.endsWith("-groovy")) return 4;
    return 5;
  };
  return directories.sort((left, right) => rank(left) - rank(right) || left.localeCompare(right));
}

function extractTaggedSource(source, tags) {
  const selectedTags = splitList(tags);
  const lines = source.replace(/\s+$/, "").split(/\r?\n/);
  if (!selectedTags.length) {
    return lines.filter((line) => !/^\s*(?:\/\/|#|<!--)?\s*(?:end)?tag::/.test(line)).join("\n").trim();
  }

  const output = [];
  for (const tag of selectedTags) {
    let active = false;
    for (const line of lines) {
      if (line.includes(`tag::${tag}[`)) {
        active = true;
        continue;
      }
      if (active && line.includes(`end::${tag}[`)) {
        active = false;
        continue;
      }
      if (active) {
        output.push(line);
      }
    }
  }
  return output.join("\n\n").trim();
}

function normalizeSnippetIndent(source, indentValue) {
  const lines = source.replace(/\s+$/, "").split(/\r?\n/);
  const nonBlank = lines.filter((line) => line.trim());
  const commonIndent = nonBlank.length
    ? Math.min(...nonBlank.map((line) => line.match(/^[ \t]*/)[0].replaceAll("\t", "    ").length))
    : 0;
  const indent = Number.parseInt(indentValue || "0", 10);
  const prefix = Number.isFinite(indent) && indent > 0 ? " ".repeat(indent) : "";
  return lines.map((line) => prefix + line.slice(Math.min(commonIndent, line.length))).join("\n");
}

function dedupeSamples(samples) {
  const seen = new Set();
  return samples.filter((sample) => {
    const key = `${sample.language}:${sample.source}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
