import { promises as fs } from "node:fs";
import path from "node:path";

import { micronautExtensionRegistry } from "../asciidoc/extensions/index.ts";
import { renderAsciiDoc } from "../asciidoc/rendering.ts";
import { optimizeImages } from "../shared/generated-html.ts";
import { attribute, html } from "../shared/html.ts";
import {
  renderAttributes,
  singleDocumentAttributes,
  sourceDocsEditUrl,
} from "./project-meta.ts";
import {
  type DocsProject,
  type Properties,
  readProperties,
} from "./project-manifest.ts";
import { docsSnippetSamples } from "./snippet-samples.ts";
import { type TocNode, readGuideToc } from "./toc.ts";
import {
  claimId,
  prefixIds,
  prefixedId,
  rewriteUrls,
  uniquifyIds,
} from "./urls.ts";

type DocsRenderContext = {
  project: DocsProject;
  platformVersion: string;
  submoduleDirectory: string;
  sourceDocsDirectory: string;
  guideSourceDirectory: string;
  attributes: Properties;
  renderOptions: { strict?: boolean };
  claimedIds: Set<string>;
  reservedSectionIds: ReadonlySet<string>;
};

export async function renderProject(
  asciidoctor: typeof import("@asciidoctor/core"),
  docsDirectory: string,
  documentedProject: DocsProject,
  platformVersion: string,
  renderOptions: { strict?: boolean } = {},
): Promise<string> {
  // Javadoc is published per release, so the version this page documents
  // travels with the project and every `api:` macro links the API the page
  // was written against instead of whatever `latest` has become.
  const project: DocsProject = platformVersion
    ? { ...documentedProject, version: platformVersion }
    : documentedProject;
  const submoduleDirectory = path.join(docsDirectory, project.submodulePath);
  const sourceDocsDirectory = path.join(
    submoduleDirectory,
    "src",
    "main",
    "docs",
  );
  const guideSourceDirectory = path.join(sourceDocsDirectory, "guide");
  const toc = project.docsSourceFile
    ? undefined
    : await readGuideToc(guideSourceDirectory);
  const projectProperties = await readProperties(
    path.join(submoduleDirectory, "gradle.properties"),
    false,
  );
  const attributes = {
    ...renderAttributes(
      project,
      platformVersion,
      submoduleDirectory,
      sourceDocsDirectory,
      projectProperties,
    ),
    ...(project.docsSourceFile
      ? await singleDocumentAttributes(submoduleDirectory, projectProperties)
      : {}),
  };
  const context = {
    project,
    platformVersion,
    submoduleDirectory,
    sourceDocsDirectory,
    guideSourceDirectory,
    attributes,
    renderOptions,
    claimedIds: new Set<string>(),
    // Section headings anchor the page navigation, so every section id is
    // spoken for before any content heading gets the chance to take one, even
    // for sections that appear later in the page.
    reservedSectionIds: tocNodeIds(toc?.children || [], project.slug),
  };

  let content = `<span class="project-document-anchor" id="${attribute(project.slug)}-docs" aria-hidden="true"></span>\n`;
  content += `<div class="project">\n    <h1>${html(project.displayName.replace(/^Micronaut\s+/i, ""))}</h1>\n</div>\n`;
  if (toc) {
    for (const node of toc.children) {
      content += await renderNode(asciidoctor, context, node);
    }
  } else {
    content += await renderSingleDocument(asciidoctor, context);
  }

  content = prefixIds(content, project.slug);
  content = rewriteUrls(content, project);
  content = optimizeImages(content);
  return content.trim();
}

async function renderNode(
  asciidoctor: typeof import("@asciidoctor/core"),
  context: DocsRenderContext,
  node: TocNode,
): Promise<string> {
  const sourceFile = path.join(context.guideSourceDirectory, node.file);
  const converted = await convertSource(
    asciidoctor,
    context,
    await fs.readFile(sourceFile, "utf8"),
    node.file,
  );

  // Claimed in document order: the first section to use an id keeps it, and a
  // table of contents that repeats a key gets the repeat suffixed.
  const sectionId = claimId(node.id, context.project.slug, context.claimedIds);
  let htmlContent = `${sectionHeading({
    editUrl: `${sourceDocsEditUrl(context.project)}/guide/${node.file}`,
    headingLevel: node.level === 0 ? 1 : 2,
    number: node.number,
    sectionId,
    titleHtml: html(node.title),
  })}\n${uniquifyIds(converted, context.project.slug, context.claimedIds, context.reservedSectionIds)}\n`;
  for (const child of node.children) {
    htmlContent += await renderNode(asciidoctor, context, child);
  }
  return htmlContent;
}

/**
 * Projects that publish a single AsciiDoc file have no table of contents to
 * render section by section, so the document's own top-level sections stand in
 * for one: each becomes a numbered page section like a TOC entry, and the
 * content that precedes them stays as the project's introduction.
 */
async function renderSingleDocument(
  asciidoctor: typeof import("@asciidoctor/core"),
  context: DocsRenderContext,
): Promise<string> {
  const docsSourceFile = context.project.docsSourceFile!;
  const converted = await convertSource(
    asciidoctor,
    context,
    await fs.readFile(
      path.join(context.submoduleDirectory, docsSourceFile),
      "utf8",
    ),
    docsSourceFile,
  );

  const parts = converted.split(/(?=<div class="sect1">)/);
  const editUrl = sourceDocsEditUrl(context.project, docsSourceFile);
  const reservedSectionIds = new Set(
    parts
      .map((part) => documentSectionHeading(part))
      .filter((heading) => heading !== undefined)
      .map((heading) => prefixedId(heading.id, context.project.slug)),
  );
  let content = "";
  let number = 0;
  for (const part of parts) {
    const heading = documentSectionHeading(part);
    if (!heading) {
      content += `${uniquifyIds(part, context.project.slug, context.claimedIds, reservedSectionIds)}\n`;
      continue;
    }
    number += 1;
    content += `${sectionHeading({
      editUrl,
      headingLevel: 1,
      number: String(number),
      sectionId: claimId(heading.id, context.project.slug, context.claimedIds),
      titleHtml: heading.titleHtml,
    })}\n${uniquifyIds(part.replace(heading.markup, ""), context.project.slug, context.claimedIds, reservedSectionIds)}\n`;
  }
  return content;
}

// The heading Asciidoctor renders for a top-level section, which the page
// heading with its number and contribute link replaces.
function documentSectionHeading(
  part: string,
): { id: string; markup: string; titleHtml: string } | undefined {
  const match =
    /^<div class="sect1">\s*(<h2 id="([^"]+)">([\s\S]*?)<\/h2>)/.exec(part);
  return match
    ? { id: match[2], markup: match[1], titleHtml: match[3] }
    : undefined;
}

function convertSource(
  asciidoctor: typeof import("@asciidoctor/core"),
  context: DocsRenderContext,
  source: string,
  sourceFile: string,
): Promise<string> {
  return renderAsciiDoc({
    asciidoctor,
    source,
    diagnosticsLabel: `${context.project.slug}/${sourceFile}`,
    strict: context.renderOptions.strict,
    convertOptions: {
      attributes: context.attributes,
      base_dir: context.submoduleDirectory,
      extension_registry: micronautExtensionRegistry(asciidoctor, context, {
        snippetSamples: docsSnippetSamples,
      }),
    },
    fatalDiagnostic: isFatalDocsDiagnostic,
    ignoredDiagnostic: isIgnoredDocsDiagnostic,
  });
}

export function isFatalDocsDiagnostic(diagnostic: string): boolean {
  return [
    /include file not found/i,
    /include file not readable/i,
    /include file has illegal reference to ancestor/i,
  ].some((fatalWarning) => fatalWarning.test(diagnostic));
}

// Source shapes that synced upstream docs are known to contain and that we
// cannot fix here. They are dropped rather than warned so that every diagnostic
// that does reach the log is one worth acting on.
export function isIgnoredDocsDiagnostic(diagnostic: string): boolean {
  return [/section title out of sequence/i, /unterminated listing block/i].some(
    (ignoredWarning) => ignoredWarning.test(diagnostic),
  );
}

function tocNodeIds(nodes: TocNode[], slug: string): Set<string> {
  const ids = new Set<string>();
  const visit = (node: TocNode): void => {
    ids.add(prefixedId(node.id, slug));
    for (const child of node.children) {
      visit(child);
    }
  };
  for (const node of nodes) {
    visit(node);
  }
  return ids;
}

function sectionHeading({
  editUrl,
  headingLevel,
  number,
  sectionId,
  titleHtml,
}: {
  editUrl: string;
  headingLevel: number;
  number: string;
  sectionId: string;
  titleHtml: string;
}): string {
  const id = attribute(sectionId);
  return `<div class="guide-section-heading">
    <h${headingLevel} id="${id}"><a class="anchor" href="#${id}"></a>${html(number)} ${titleHtml}</h${headingLevel}>
    <a class="contribute-btn" href="${attribute(editUrl)}" title="Improve this doc" aria-label="Improve this doc">
        <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
    </a>
</div>`;
}
