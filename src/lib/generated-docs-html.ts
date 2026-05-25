export function enhanceGeneratedContentHtml(html: string) {
  return labelGeneratedHeadingAnchors(html.replaceAll("visually-hidden", "sr-only"));
}

export function generatedHtmlLabel(html: string) {
  return decodeHtmlEntities(html)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function labelGeneratedHeadingAnchors(html: string) {
  return html.replace(
    /<h([1-6])([^>]*) id="([^"]+)"([^>]*)><a class="anchor" href="#([^"]+)"([^>]*)><\/a>([\s\S]*?)<\/h\1>/g,
    (match, level, beforeId, id, afterId, href, anchorAttributes, labelHtml) => {
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
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function attribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
