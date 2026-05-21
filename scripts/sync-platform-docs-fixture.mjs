import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const platformDocsDirectory = path.resolve(process.argv[2] || path.join(projectDirectory, "..", "..", "micronaut-platform-docs"));

const platformGradleDirectory = path.join(platformDocsDirectory, "gradle");
const outputFile = path.join(projectDirectory, "src", "data", "platform-docs-projects.fixture.json");

const [projectProperties, categoryProperties, descriptionProperties, iconProperties] = await Promise.all([
  readProperties(path.join(platformGradleDirectory, "platform-doc-projects.properties")),
  readProperties(path.join(platformGradleDirectory, "platform-doc-categories.properties")),
  readProperties(path.join(platformGradleDirectory, "platform-doc-descriptions.properties")),
  readProperties(path.join(platformGradleDirectory, "platform-doc-icons.properties"))
]);
const platformVersions = await readTomlStringVersions(
  path.join(platformDocsDirectory, "repos", "micronaut-platform", "gradle", "libs.versions.toml")
);

const categories = readIndexed(categoryProperties, "category", Number(categoryProperties["category.count"] || 0)).map(
  (category) => ({
    slug: category.slug,
    name: category.name,
    icon: category.icon,
    description: category.description,
    projectSlugs: splitList(category.projects)
  })
);

const projects = readIndexed(projectProperties, "project", Number(projectProperties["project.count"] || 0)).map(
  (project) => {
    const categorySlugs = categories
      .filter((category) => category.projectSlugs.includes(project.slug))
      .map((category) => category.slug);
    const primaryCategory = categorySlugs[0] || "other";

    return {
      slug: project.slug,
      displayName: project.displayName,
      shortName: project.displayName.replace(/^Micronaut\s+/i, ""),
      projectKey: project.projectKey,
      module: project.module,
      repositoryName: project.repositoryName,
      repositoryUrl: project.repositoryUrl,
      publishedGuideUrl: project.publishedGuideUrl,
      publishedPlatformHref: `https://dstepanov.github.io/micronaut-platform-docs/#${project.slug}-introduction`,
      branch: project.branch,
      submodulePath: project.submodulePath,
      platformVersionKey: project.platformVersionKey,
      version: platformVersions[project.platformVersionKey] || "",
      icon: iconProperties[`project.${project.slug}.icon`] || "lucide:book-open",
      primaryCategory,
      categorySlugs,
      shortDescription:
        descriptionProperties[`project.${project.slug}.shortDescription`] || project.displayName.replace(/^Micronaut\s+/i, ""),
      longDescription:
        descriptionProperties[`project.${project.slug}.longDescription`] ||
        `${project.displayName} documentation and reference material.`
    };
  }
);

const fixture = {
  source: "micronaut-platform-docs/gradle platform metadata",
  publishedSource: "https://dstepanov.github.io/micronaut-platform-docs/",
  projectCount: projects.length,
  categories,
  projects
};

await fs.writeFile(outputFile, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`Wrote ${projects.length} platform docs projects to ${path.relative(projectDirectory, outputFile)}.`);

async function readProperties(file) {
  const content = await fs.readFile(file, "utf8");
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

function readIndexed(properties, prefix, count) {
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

function splitList(value) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

async function readTomlStringVersions(file) {
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
