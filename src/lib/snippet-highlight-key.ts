export function snippetVariantHighlightKey(snippetId: string, language: string) {
  return `${snippetId}:${language.trim().toLowerCase() || "text"}`;
}
