/// <reference types="astro/client" />

declare module "*.mjs" {
  export const buildDocsSearchIndex: (projects: Array<Record<string, unknown>>, generatedHtmlBySlug?: Record<string, string>) => unknown[];
  export const extractGeneratedDocSearchItems: (project: Record<string, unknown>, html: string) => unknown[];
}
