import { promises as fs } from "node:fs";

export async function readProperties(file, required = true) {
  const content = await fs.readFile(file, "utf8").catch((error) => {
    if (required) {
      throw error;
    }
    return "";
  });
  const properties = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 0) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    properties[key] = value;
  }

  return properties;
}

export function readIndexed(properties, prefix, count) {
  const values = [];
  for (let index = 0; index < count; index += 1) {
    const entry = {};
    const entryPrefix = `${prefix}.${index}.`;
    for (const [key, value] of Object.entries(properties)) {
      if (key.startsWith(entryPrefix)) {
        entry[key.slice(entryPrefix.length)] = value;
      }
    }
    values.push(entry);
  }
  return values;
}

export async function readTomlStringVersions(file) {
  const versions = {};
  const content = await fs.readFile(file, "utf8");
  let inVersions = false;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("[")) {
      inVersions = line === "[versions]";
      continue;
    }
    if (!inVersions) continue;

    const match = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*"([^"]+)"\s*$/);
    if (match) {
      versions[match[1]] = match[2];
    }
  }

  return versions;
}

export function selectProjects(projects, slugs) {
  if (!slugs.length) {
    return projects;
  }
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  return slugs.map((slug) => {
    const project = bySlug.get(slug);
    if (!project) {
      throw new Error(`Unknown platform docs project slug: ${slug}`);
    }
    return project;
  });
}
