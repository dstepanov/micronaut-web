export function enhanceGeneratedContentHtml(html: string) {
  return labelGeneratedHeadingAnchors(
    html.replaceAll("visually-hidden", "sr-only"),
  );
}

export function generatedHtmlLabel(html: string) {
  return decodeHtmlEntities(html)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type GeneratedDocSection = {
  id: string;
  label: string;
  depth: number;
  indent: number;
  parentId?: string;
};

/**
 * Section list for the docs "In this section" rail.
 *
 * `indent` is deliberately not the heading level. Asciidoctor flattens numbered
 * sub-sections — "2.3.1 IntelliJ IDEA" renders as an `<h2>`, the same level as
 * its parent "2.3 Setting up an IDE" — while an unnumbered child such as
 * "Eclipse and Gradle" is an `<h3>`. Indenting by heading level therefore
 * inverted the real hierarchy, so the section number wins when there is one,
 * and unnumbered headings nest under the last numbered one.
 */
export function extractGeneratedDocSections(
  html: string,
): GeneratedDocSection[] {
  const sections: GeneratedDocSection[] = [];
  const headingPattern =
    /<h([1-6])\b([^>]*)\bid="([^"]+)"([^>]*)>([\s\S]*?)<\/h\1>/g;
  let activeTopLevelId: string | undefined;
  let lastNumbered: { indent: number; depth: number } | undefined;
  for (const match of html.matchAll(headingPattern)) {
    const depth = Number(match[1]);
    const label = generatedHtmlLabel(match[5]);
    if (label) {
      if (depth === 1) {
        activeTopLevelId = match[3];
      }
      const numbered = /^(\d+(?:\.\d+)*)\s/.exec(label);
      let indent: number;
      if (numbered) {
        indent = numbered[1].split(".").length;
        lastNumbered = { indent, depth };
      } else if (lastNumbered) {
        indent = lastNumbered.indent + Math.max(1, depth - lastNumbered.depth);
      } else {
        indent = depth;
      }
      sections.push({
        id: match[3],
        label,
        depth,
        indent,
        parentId: depth === 1 ? undefined : activeTopLevelId,
      });
    }
    if (sections.length >= 600) {
      break;
    }
  }
  return sections;
}

function labelGeneratedHeadingAnchors(html: string) {
  return html.replace(
    /<h([1-6])([^>]*) id="([^"]+)"([^>]*)><a class="anchor" href="#([^"]+)"([^>]*)><\/a>([\s\S]*?)<\/h\1>/g,
    (
      match,
      level,
      beforeId,
      id,
      afterId,
      href,
      anchorAttributes,
      labelHtml,
    ) => {
      if (/\saria-label=/.test(anchorAttributes)) {
        return match;
      }
      const label = generatedHtmlLabel(labelHtml) || id;
      return `<h${level}${beforeId} id="${id}"${afterId}><a class="anchor" href="#${href}" aria-label="${attribute(`Link to ${label}`)}"${anchorAttributes}></a>${labelHtml}</h${level}>`;
    },
  );
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function attribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
