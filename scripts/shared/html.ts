export function html(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function attribute(value: unknown): string {
  return html(value).replaceAll('"', "&quot;");
}

export function decodeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#8217;", "'")
    .replaceAll("&#x3C;", "<")
    .replaceAll("&amp;", "&");
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
