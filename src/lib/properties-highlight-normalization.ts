const DEFAULT_PROPERTIES_TEXT_STYLE = "color:#1F2328;--shiki-dark:#E6EDF3";

export function normalizeEmptyPropertiesAssignmentHighlighting(
  highlightedHtml: string,
): string {
  return highlightedHtml.replace(
    /<span class="line">([\s\S]*?)<\/span>(?=\n<span class="line">|\n?<\/code>|$)/g,
    (lineHtml: string, lineInnerHtml: string): string => {
      if (/\bclass="[^"]*\bconum\b/.test(lineInnerHtml)) {
        return lineHtml;
      }
      const lineText = decodeHtml(lineInnerHtml.replace(/<[^>]+>/g, ""));
      if (!emptyPropertiesAssignment(lineText)) {
        return lineHtml;
      }
      return `<span class="line"><span style="${propertiesDefaultTextStyle(lineInnerHtml)}">${escapeHtml(lineText)}</span></span>`;
    },
  );
}

function emptyPropertiesAssignment(line: string): boolean {
  return /^[ \t]*[^#!;:=\s][^=]*=[ \t]*$/.test(line);
}

function propertiesDefaultTextStyle(lineInnerHtml: string): string {
  return (
    /<span style="([^"]*)">=<\/span>\s*$/.exec(lineInnerHtml)?.[1] ||
    DEFAULT_PROPERTIES_TEXT_STYLE
  );
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#8217;", "'")
    .replaceAll("&#x3C;", "<")
    .replaceAll("&amp;", "&");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
