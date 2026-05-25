import yaml from "js-yaml";
import { promises as fs } from "node:fs";
import path from "node:path";

import { isRegularFile } from "./files.ts";

export async function readGuideToc(guideSourceDirectory) {
  const tocFile = path.join(guideSourceDirectory, "toc.yml");
  const parsed = yaml.load(await fs.readFile(tocFile, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`TOC YAML must be a map: ${tocFile}`);
  }

  const children = [];
  await appendTocNodes(children, guideSourceDirectory, [], parsed, 0, "");
  return {
    title: typeof parsed.title === "string" ? parsed.title : "",
    children
  };
}

async function appendTocNodes(target, guideSourceDirectory, parentIds, toc, level, numberPrefix) {
  let index = 1;
  for (const [rawId, value] of Object.entries(toc)) {
    const id = tocKey(rawId);
    if (id === "title") {
      continue;
    }

    const number = numberPrefix ? `${numberPrefix}.${index}` : String(index);
    const title = tocTitle(id, value);
    const file = await determineFilePath(guideSourceDirectory, parentIds, id);
    const pathIds = [...parentIds, id];
    const children = [];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const childSections = { ...value };
      delete childSections.title;
      await appendTocNodes(children, guideSourceDirectory, pathIds, childSections, level + 1, number);
    }

    target.push({ level, number, id, title, file, children });
    index += 1;
  }
}

function tocKey(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  throw new Error("TOC section keys must be non-blank strings.");
}

function tocTitle(id, value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (typeof value.title === "string" && value.title.trim()) {
      return value.title.trim();
    }
    throw new Error(`TOC section '${id}' must define a non-blank title.`);
  }
  throw new Error(`TOC section '${id}' must be a string or map.`);
}

async function determineFilePath(guideSourceDirectory, parentIds, id) {
  let filePath = `${id}.adoc`;
  if (await isRegularFile(path.join(guideSourceDirectory, filePath))) {
    return filePath;
  }
  for (let depth = 1; depth <= parentIds.length; depth += 1) {
    filePath = path.join(...parentIds.slice(0, depth), `${id}.adoc`);
    if (await isRegularFile(path.join(guideSourceDirectory, filePath))) {
      return filePath;
    }
  }
  throw new Error(`Missing guide source file for TOC section '${id}' under ${guideSourceDirectory}`);
}
