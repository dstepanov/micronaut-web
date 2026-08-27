import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const projectDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
const require = createRequire(import.meta.url);
const modules = importSnippetModules();

test("homepage code example Markdown files use plain fenced blocks", async (): Promise<void> => {
  const { parseMarkdownCodeSnippetVariants } = await modules;
  const entries = await readCodeExampleEntries();

  assert.deepEqual(
    entries.map((entry: any): any => entry.data.id),
    ["server", "client", "data", "serialization", "testing"],
  );

  for (const entry of entries) {
    assert.doesNotMatch(
      entry.body,
      /^##\s/m,
      `${entry.fileName} must not define variants with headings`,
    );
    assert.doesNotMatch(
      entry.body,
      /^```[^\S\r\n]*\w+[^\S\r\n]+\S/m,
      `${entry.fileName} must not use fence metadata`,
    );
  }

  assert.deepEqual(
    entries.map((entry: any): any => ({
      id: entry.data.id,
      languages: parseMarkdownCodeSnippetVariants(
        entry.body,
        entry.fileName,
      ).map((variant: any): any => variant.language),
    })),
    [
      { id: "server", languages: ["java", "kotlin", "groovy", "python"] },
      { id: "client", languages: ["java", "kotlin", "groovy", "python"] },
      { id: "data", languages: ["java", "kotlin", "groovy", "python"] },
      {
        id: "serialization",
        languages: ["java", "kotlin", "groovy", "python"],
      },
      { id: "testing", languages: ["java", "kotlin", "groovy", "python"] },
    ],
  );
});

test("main-site Markdown keeps Launch links external", async (): Promise<void> => {
  const { rewriteRootRelativeHtml } = await modules;
  const html = rewriteRootRelativeHtml(
    '<a href="https://launch.micronaut.io?type=DEFAULT">Launch</a><a href="/launch/">Launch</a>',
    (path: string) => `/micronaut-web${path}`,
    (path: string) => path,
  );

  assert.equal(
    html,
    '<a href="https://launch.micronaut.io?type=DEFAULT">Launch</a><a href="https://launch.micronaut.io">Launch</a>',
  );
});

test("homepage code examples parse plain Markdown fences into snippet variants", async (): Promise<void> => {
  const { parseMarkdownCodeSnippetVariants } = await modules;
  const variants = parseMarkdownCodeSnippetVariants(
    `
\`\`\`java
class HelloController {
}
\`\`\`

\`\`\`kotlin
class HelloController
\`\`\`

\`\`\`groovy
class HelloController {
}
\`\`\`

\`\`\`python
def index() -> dict[str, str]:
    return {"message": "Hello World"}
\`\`\`
`,
    "test code example",
  );

  assert.deepEqual(
    variants.map(({ fileName, label, language }: any): any => ({
      fileName,
      label,
      language,
    })),
    [
      { fileName: "Java", label: "Java", language: "java" },
      { fileName: "Kotlin", label: "Kotlin", language: "kotlin" },
      { fileName: "Groovy", label: "Groovy", language: "groovy" },
      { fileName: "Python", label: "Python", language: "python" },
    ],
  );
});

test("homepage code examples reject nonstandard fence metadata", async (): Promise<void> => {
  const { parseMarkdownCodeSnippetVariants } = await modules;

  assert.throws(
    (): any =>
      parseMarkdownCodeSnippetVariants(
        '```java title="Hello.java"\nclass Hello {}\n```',
        "test code example",
      ),
    /nonstandard fence metadata/,
  );
});

test("main-site Markdown code snippets use shared snippet cards", async (): Promise<void> => {
  const { renderMainSiteCodeSnippets } = await modules;
  const html = await renderMainSiteCodeSnippets(`
<p>Before</p>
<pre><code class="language-java">import io.micronaut.http.annotation.Get;

@Get
String index() {
    return "Hello";
}</code></pre>
`);

  assert.match(html, /docs-snippet-template docs-code-block/);
  assert.match(html, /role="tab"[^>]*data-lang="java"/);
  assert.match(html, /docs-code-language-icon-java/);
  assert.match(html, /data-copy-active-snippet/);
  assert.match(html, /<code class="language-java [^"]*shiki-code/);
  assert.doesNotMatch(html, /<pre><code class="language-java">/);
});

test("main-site Markdown properties snippets highlight the key of an empty assignment", async (): Promise<void> => {
  const { renderMainSiteCodeSnippets } = await modules;
  const kubernetesDiscoveryProperty = "kubernetes.client.discovery.includes[0]";
  const kubernetesDiscoveryValue = "my-service";
  const micronautConfigImportProperty = "micronaut.config.import[0].provider";
  const micronautConfigImportValue = "azure-key-vault";
  const azureCredentialProperty =
    "azure.credential.storage-shared-key.account-key";
  const azureCredentialValue =
    "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
  const azureConnectionStringProperty =
    "azure.credential.storage-shared-key.connection-string";
  const azureConnectionStringValue =
    "DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=https://127.0.0.1:10000/devstoreaccount1;";
  const html = await renderMainSiteCodeSnippets(`
<pre><code class="language-properties">foo.bar.property=
foo.bar[0]=
foo.bar&lt;prop&gt;=
kubernetes.client.config-maps.includes[0]=
kubernetes.client.config-maps.excludes&#91;0&#93;=
${kubernetesDiscoveryProperty}=${kubernetesDiscoveryValue}
${micronautConfigImportProperty}=${micronautConfigImportValue}
${azureCredentialProperty}=${azureCredentialValue}
${azureConnectionStringProperty}=${azureConnectionStringValue}</code></pre>
`);

  const dottedLine = highlightedLineContaining(html, "foo.bar.property");
  const indexedLine = highlightedLineContaining(html, "foo.bar[0]");
  const placeholderLine = highlightedLineContaining(
    html,
    "foo.bar&lt;prop&gt;",
  );
  const kubernetesIndexedLine = highlightedLineContaining(
    html,
    "kubernetes.client.config-maps.includes[0]",
  );
  const encodedIndexedLine = highlightedLineContaining(
    html,
    "kubernetes.client.config-maps.excludes[0]",
  );
  const azureCredentialLine = highlightedLineContaining(
    html,
    azureCredentialProperty,
  );
  const kubernetesDiscoveryLine = highlightedLineContaining(
    html,
    kubernetesDiscoveryProperty,
  );
  const micronautConfigImportLine = highlightedLineContaining(
    html,
    micronautConfigImportProperty,
  );
  const azureConnectionStringLine = highlightedLineContaining(
    html,
    azureConnectionStringProperty,
  );
  assertOnlyPropertyKeyHighlighted(dottedLine, "foo.bar.property", "");
  assertOnlyPropertyKeyHighlighted(indexedLine, "foo.bar[0]", "");
  assertOnlyPropertyKeyHighlighted(placeholderLine, "foo.bar&lt;prop&gt;", "");
  assertOnlyPropertyKeyHighlighted(
    kubernetesIndexedLine,
    "kubernetes.client.config-maps.includes[0]",
    "",
  );
  assertOnlyPropertyKeyHighlighted(
    encodedIndexedLine,
    "kubernetes.client.config-maps.excludes[0]",
    "",
  );
  assertOnlyPropertyKeyHighlighted(
    kubernetesDiscoveryLine,
    kubernetesDiscoveryProperty,
    kubernetesDiscoveryValue,
  );
  assertOnlyPropertyKeyHighlighted(
    micronautConfigImportLine,
    micronautConfigImportProperty,
    micronautConfigImportValue,
  );
  assertOnlyPropertyKeyHighlighted(
    azureCredentialLine,
    azureCredentialProperty,
    azureCredentialValue,
  );
  assertOnlyPropertyKeyHighlighted(
    azureConnectionStringLine,
    azureConnectionStringProperty,
    azureConnectionStringValue,
  );
});

test("main-site Markdown snippets infer language when the fence has no language", async (): Promise<void> => {
  const { renderMainSiteCodeSnippets } = await modules;
  const html = await renderMainSiteCodeSnippets(`
<pre><code>import io.micronaut.http.annotation.Controller;

@Controller("/hello")
class HelloController {
}</code></pre>
`);

  assert.match(html, /role="tab"[^>]*data-lang="java"/);
  assert.match(html, /<code class="language-java [^"]*shiki-code/);
});

test("main-site Markdown snippets infer Gradle and XML when fences have no language", async (): Promise<void> => {
  const { renderMainSiteCodeSnippets } = await modules;
  const html = await renderMainSiteCodeSnippets(`
<pre><code>dependencies {
    runtimeOnly("org.yaml:snakeyaml")
}</code></pre>
<pre><code>&lt;dependency&gt;
    &lt;groupId&gt;org.yaml&lt;/groupId&gt;
    &lt;artifactId&gt;snakeyaml&lt;/artifactId&gt;
&lt;/dependency&gt;</code></pre>
`);

  assert.match(html, /role="tab"[^>]*data-lang="gradle"/);
  assert.match(html, /docs-code-language-icon-gradle/);
  assert.match(html, /<code class="language-gradle [^"]*shiki-code/);
  assert.match(html, /role="tab"[^>]*data-lang="xml"/);
  assert.match(html, /docs-code-language-icon-xml/);
  assert.match(html, /<code class="language-xml [^"]*shiki-code/);
});

test("main-site Markdown uses the static generated-docs enhancer", async (): Promise<void> => {
  const catchallPageSource = await fs.readFile(
    path.join(projectDirectory, "src", "pages", "[...slug].astro"),
    "utf8",
  );

  assert.match(
    catchallPageSource,
    /from "@\/components\/web\/generated-docs-static-enhancer\.astro"/,
  );
  assert.doesNotMatch(
    catchallPageSource,
    /GeneratedDocsEnhancer|GeneratedDocsPropertiesFallback|generated-docs-enhancer|generated-docs-properties-fallback/,
  );
});

test("main-site Markdown uses local copies of micronaut.io upload resources", async (): Promise<void> => {
  const contentDirectory = path.join(
    projectDirectory,
    "src",
    "content",
    "main-site",
  );
  const files = await listMarkdownFiles(contentDirectory);
  const failures = [];

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    if (/https?:\/\/micronaut\.io\/wp-content\//.test(source)) {
      failures.push(path.relative(projectDirectory, file));
    }
  }

  assert.deepEqual(failures, []);
});

function highlightedLineContaining(source: string, text: string): string {
  return (
    Array.from(
      source.matchAll(
        /<span class="line">[\s\S]*?<\/span>(?=\n<span class="line">|\n?<\/code>|$)/g,
      ),
    )
      .map((match): string => match[0])
      .find((line): boolean => line.includes(text)) || ""
  );
}

function assertOnlyPropertyKeyHighlighted(
  line: string,
  property: string,
  value: string,
): void {
  assert.notEqual(line, "");
  // Anchor on the key span's own end tag: an attribute in the markup carries an
  // `=` of its own, so the first `=` in the line is not the separator.
  const separator = line.indexOf(`</span>=${value}`);
  assert.notEqual(separator, -1);

  const keyHtml = line.slice(0, separator);
  assert.ok(keyHtml.includes(property));
  assert.match(keyHtml, /#CF222E|#FF7B72/);
  assert.doesNotMatch(
    line.slice(separator + "</span>".length),
    /#CF222E|#FF7B72/,
  );
}

async function importSnippetModules(): Promise<any> {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "micronaut-web-main-site-markdown-"),
  );
  const entryFile = path.join(temporaryDirectory, "entry.ts");
  const outputFile = path.join(temporaryDirectory, "entry.cjs");
  await fs.writeFile(
    entryFile,
    `
export { parseMarkdownCodeSnippetVariants } from "${path.join(projectDirectory, "src", "lib", "code-snippet-markdown.ts")}";
export { renderMainSiteCodeSnippets } from "${path.join(projectDirectory, "src", "lib", "main-site-code-snippets.ts")}";
export { rewriteRootRelativeHtml } from "${path.join(projectDirectory, "src", "lib", "main-site-link-rewrite.ts")}";
`,
    "utf8",
  );

  await build({
    bundle: true,
    entryPoints: [entryFile],
    external: ["astro:*"],
    format: "cjs",
    jsx: "automatic",
    outfile: outputFile,
    platform: "node",
    plugins: [
      {
        name: "project-alias",
        setup(builder: any): any {
          builder.onResolve({ filter: /^@\// }, (args: any): any => ({
            path: resolveProjectAlias(args.path),
          }));
        },
      },
    ],
    target: "node20",
  });

  return require(outputFile);
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(file);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [file] : [];
    }),
  );
  return files.flat().sort();
}

function resolveProjectAlias(specifier: any): any {
  const basePath = path.join(projectDirectory, "src", specifier.slice(2));
  for (const candidate of [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.astro`,
  ]) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return basePath;
}

async function readCodeExampleEntries(): Promise<any> {
  const directory = path.join(
    projectDirectory,
    "src",
    "content",
    "main-site",
    "pages",
    "code-examples",
  );
  const fileNames = (await fs.readdir(directory)).filter((fileName: any): any =>
    fileName.endsWith(".md"),
  );
  const entries = await Promise.all(
    fileNames.map(async (fileName: any): Promise<any> => {
      const source = await fs.readFile(path.join(directory, fileName), "utf8");
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
      assert.ok(match, `${fileName} must start with frontmatter`);
      const body = source.slice(match[0].length);
      const data = parseSimpleFrontmatter(match[1]);
      return { body, data, fileName };
    }),
  );

  return entries.sort(
    (left: any, right: any): any =>
      left.data.order - right.data.order ||
      left.data.title.localeCompare(right.data.title),
  );
}

function parseSimpleFrontmatter(source: any): any {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line: any): any => {
        const separator = line.indexOf(":");
        assert.notEqual(separator, -1, `Invalid frontmatter line: ${line}`);
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim();
        return [key, key === "order" ? Number(value) : value];
      }),
  );
}
