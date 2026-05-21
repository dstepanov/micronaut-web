import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceTemplatesDirectory = path.join(projectDirectory, "src", "templates");
const distDirectory = path.join(projectDirectory, "dist");
const outputDirectory = path.join(distDirectory, "micronaut-web");
const outputTemplatesDirectory = path.join(outputDirectory, "templates");
const manifestFile = path.join(outputDirectory, "assets-manifest.json");
const manifestDirectory = path.join(outputDirectory, "manifests");

const requiredPlaceholders = {
  "docs/docs-index.html": [
    "pageTitle",
    "pageDescription",
    "assetBasePath",
    "headAssetsHtml",
    "themeScriptHtml",
    "sidebarHtml",
    "topNavigationHtml",
    "contentHtml",
    "searchIndexJson",
    "bodyScriptsHtml"
  ],
  "docs/docs-page.html": [
    "pageTitle",
    "pageDescription",
    "assetBasePath",
    "headAssetsHtml",
    "themeScriptHtml",
    "sidebarHtml",
    "topNavigationHtml",
    "contentHtml",
    "contentSubmenuHtml",
    "searchIndexJson",
    "bodyScriptsHtml"
  ],
  "guides/guides-index.html": [
    "pageTitle",
    "pageDescription",
    "assetBasePath",
    "headAssetsHtml",
    "themeScriptHtml",
    "topNavigationHtml",
    "contentHtml",
    "searchIndexJson",
    "bodyScriptsHtml"
  ],
  "guides/guides-page.html": [
    "pageTitle",
    "pageDescription",
    "assetBasePath",
    "headAssetsHtml",
    "themeScriptHtml",
    "topNavigationHtml",
    "contentHtml",
    "contentSubmenuHtml",
    "searchIndexJson",
    "bodyScriptsHtml"
  ]
};

await fs.rm(outputTemplatesDirectory, { recursive: true, force: true });
await fs.mkdir(outputTemplatesDirectory, { recursive: true });

for (const [relativeTemplate, placeholders] of Object.entries(requiredPlaceholders)) {
  const source = path.join(sourceTemplatesDirectory, relativeTemplate);
  const destination = path.join(outputTemplatesDirectory, relativeTemplate);
  const content = await fs.readFile(source, "utf8");
  for (const placeholder of placeholders) {
    if (!content.includes(`{{${placeholder}}}`)) {
      throw new Error(`${relativeTemplate} is missing required placeholder {{${placeholder}}}.`);
    }
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, content);
}

const assets = {
  astro: await listFiles(path.join(distDirectory, "_astro")),
  micronautAssets: await listFiles(path.join(distDirectory, "micronaut-assets"))
};
const allTemplates = Object.fromEntries(
  Object.keys(requiredPlaceholders).map((template) => [
    template,
    {
      resource: `META-INF/micronaut-web/templates/${path.basename(template)}`,
      placeholders: requiredPlaceholders[template]
    }
  ])
);
const manifest = {
  templateRoot: "META-INF/micronaut-web/templates",
  surfaceRoot: "META-INF/micronaut-web/surfaces",
  placeholders: Array.from(new Set(Object.values(requiredPlaceholders).flat())).sort(),
  templates: allTemplates,
  assets
};

await fs.mkdir(manifestDirectory, { recursive: true });
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
for (const surface of ["docs", "guides"]) {
  const templates = Object.fromEntries(
    Object.entries(allTemplates).filter(([template]) => template.startsWith(`${surface}/`))
  );
  await fs.writeFile(
    path.join(manifestDirectory, `${surface}-assets-manifest.json`),
    `${JSON.stringify({ ...manifest, templates }, null, 2)}\n`
  );
}
console.log(`Prepared ${Object.keys(requiredPlaceholders).length} HTML templates and asset manifest.`);

async function listFiles(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          return listFiles(fullPath);
        }
        return [path.relative(distDirectory, fullPath).split(path.sep).join("/")];
      })
    );
    return files.flat().sort();
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
