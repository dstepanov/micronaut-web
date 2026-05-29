import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const removedRegistryName = ["docs", "SnippetStyles"].join("");
const removedStaticSupportName = ["renderDocsSnippet", "StaticSupport"].join(
  "",
);
const removedGeneratedOnlyCardName = ["Generated", "Snippet", "Card"].join("");
const removedRuntimeCssPaths = [
  "scripts/generate-docs-snippet-css.ts",
  "src/components/web/docs-snippet-styles.ts",
  "src/styles/docs-snippet-runtime.source.css",
  "src/styles/generated/docs-snippet-runtime.css",
];
const removedRuntimeComponentPaths = [
  "src/components/web/generated-docs-enhancer.astro",
  "src/components/web/generated-docs-properties-fallback.astro",
];

const sourceRoots = ["src", "scripts", "tests"];
const sourceExtensions = new Set([
  ".astro",
  ".css",
  ".js",
  ".jsx",
  ".md",
  ".ts",
  ".tsx",
]);

const inlineConsumers = [
  {
    file: "src/components/web/docs-snippet-card.tsx",
    requiredUses: [
      "docs-snippet-template docs-code-block",
      "docs-code-snippet-template",
      "docs-properties-template docs-dependency-template",
      "docs-snippet-panels overflow-hidden bg-code",
      "docs-snippet-card-footer docs-code-callouts",
      "docs-properties-scroll overflow-x-auto",
      "docs-code-language-icon inline-flex size-3.5",
      "[&_ol]:[counter-reset:docs-code-callout]",
      "[&_li::before]:content-[counter(docs-code-callout)]",
      "[&_table.tableblock_:where(th,td)]:border",
    ],
  },
  {
    file: "src/components/web/docs-code-snippet.tsx",
    requiredUses: [
      "docs-snippet-tabs docs-code-tabs docs-code-tabs-multi",
      "docs-code-content docs-snippet-card-content",
      "shiki shiki-themes github-light-default github-dark-default !m-0",
      "shiki-code grid min-w-max font-mono",
      "dark:[&_span[style]]:![color:var(--shiki-dark,var(--shiki-light,currentColor))]",
      "[&_.conum::before]:content-[attr(data-value)]",
      "docs-code-language-text inline-flex",
      "staticEnhancement",
      "showSingleVariantAsTabs",
      "title docs-snippet-external-title",
    ],
  },
  {
    file: "src/components/web/docs-generated-snippet.tsx",
    requiredUses: [
      "renderToStaticMarkup",
      "DocsCodeSnippet",
      "DocsPropertiesSnippetCard",
      "staticEnhancement",
      "showSingleVariantAsTabs",
    ],
  },
  {
    file: "src/components/web/docs-snippet-templates.tsx",
    requiredUses: [
      "DocsSnippetCard",
      "DocsPropertiesSnippetCard",
      "docs-snippet-tabs docs-code-tabs docs-code-tabs-multi",
      "renderDocsSnippetTemplates",
    ],
  },
  {
    file: "src/components/web/main-code-showcase.tsx",
    requiredUses: ["DocsCodeSnippet", "title docs-snippet-external-title"],
  },
  {
    file: "src/components/web/snippet-test-gallery.tsx",
    requiredUses: [
      "DocsCodeSnippet",
      "DocsPropertiesSnippetCard",
      'kind="dependency"',
    ],
  },
  {
    file: "src/lib/main-site-code-snippets.ts",
    requiredUses: [
      "renderDocsSnippetTemplates",
      "buttonGhostXsClass",
      "languageButtonClass",
      "languageTextClass",
      "panelClass",
      "codePreClass",
      "codeElementClass",
      "highlightCodeSnippetHtml",
    ],
  },
];

const failures: string[] = [];
const generatedSnippetRenderer = await readProjectFile(
  "src/components/web/docs-generated-snippet.tsx",
);
const globalsCss = await readProjectFile("src/styles/globals.css");
const webLayout = await readProjectFile("src/layouts/WebLayout.astro");

for (const consumer of inlineConsumers) {
  const source = await readProjectFile(consumer.file);
  for (const requiredUse of consumer.requiredUses) {
    if (!source.includes(requiredUse)) {
      failures.push(
        `${consumer.file}: expected inline snippet styling fragment "${requiredUse}".`,
      );
    }
  }
}

for (const file of await listSourceFiles(sourceRoots)) {
  const source = await readProjectFile(file);
  if (source.includes(removedRegistryName)) {
    failures.push(
      `${file}: inline snippet Tailwind classes instead of restoring the snippet style registry.`,
    );
  }
  if (source.includes(removedStaticSupportName)) {
    failures.push(
      `${file}: remove unused snippet static support wrappers around the inlined templates.`,
    );
  }
}

for (const removedPath of removedRuntimeCssPaths) {
  if (await projectFileExists(removedPath)) {
    failures.push(
      `${removedPath}: snippet runtime styling should stay in inline Tailwind classes.`,
    );
  }
}

for (const removedPath of removedRuntimeComponentPaths) {
  if (await projectFileExists(removedPath)) {
    failures.push(
      `${removedPath}: generated snippets should be rendered statically instead of restored through runtime component wrappers.`,
    );
  }
}

if (
  new RegExp(
    `function\\s+${removedGeneratedOnlyCardName}\\b|<${removedGeneratedOnlyCardName}\\b`,
  ).test(generatedSnippetRenderer)
) {
  failures.push(
    "src/components/web/docs-generated-snippet.tsx: render generated snippets through DocsCodeSnippet instead of restoring a generated-only card component.",
  );
}

if (webLayout.includes("@/styles/generated/docs-snippet-runtime.css")) {
  failures.push(
    "src/layouts/WebLayout.astro: remove the copied snippet runtime CSS import.",
  );
}

for (const fragment of [
  ".docs-code-block .shiki",
  ".docs-code-callouts",
  ".docs-properties-template table.tableblock",
]) {
  if (globalsCss.includes(fragment)) {
    failures.push(
      `src/styles/globals.css: move "${fragment}" rules to inline Tailwind classes.`,
    );
  }
}

if (failures.length) {
  throw new Error(
    `Docs snippet style sharing check failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
  );
}

console.log(
  `Validated inline docs snippet styling across ${inlineConsumers.length} consumers.`,
);

async function readProjectFile(relativePath: string): Promise<string> {
  return fs.readFile(path.join(projectDirectory, relativePath), "utf8");
}

async function projectFileExists(relativePath: string): Promise<boolean> {
  try {
    await fs.access(path.join(projectDirectory, relativePath));
    return true;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function listSourceFiles(roots: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const root of roots) {
    await collectSourceFiles(root, files);
  }
  return files;
}

async function collectSourceFiles(
  relativeDirectory: string,
  files: string[],
): Promise<void> {
  const entries = await fs.readdir(
    path.join(projectDirectory, relativeDirectory),
    {
      withFileTypes: true,
    },
  );
  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      !entry.name.startsWith("generated-")
    ) {
      await collectSourceFiles(relativePath, files);
      continue;
    }
    if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }
}
