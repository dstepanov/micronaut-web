/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DEFAULT_GITHUB_PAGES_ORIGIN?: string;
  readonly MICRONAUT_DEPLOY_SURFACE?: "all" | "main" | "docs" | "guides";
  readonly MICRONAUT_DOCS_ROOT?: string;
  readonly MICRONAUT_DOCS_LATEST_ROOT?: string;
  readonly MICRONAUT_GUIDES_ROOT?: string;
  readonly MICRONAUT_GUIDES_LATEST_ROOT?: string;
  readonly MICRONAUT_GITHUB_PAGES_ORIGIN?: string;
  readonly MICRONAUT_MAIN_SITE_URL?: string;
  readonly MICRONAUT_DOCS_SITE_URL?: string;
  readonly MICRONAUT_GUIDES_SITE_URL?: string;
}

declare const __MICRONAUT_DEPLOYMENT__:
  | {
      readonly deploySurface?: "all" | "main" | "docs" | "guides";
      readonly docsRoot?: string;
      readonly docsLatestRoot?: string;
      readonly guidesRoot?: string;
      readonly guidesLatestRoot?: string;
      readonly githubPagesOrigin?: string;
      readonly mainSiteUrl?: string;
      readonly docsSiteUrl?: string;
      readonly guidesSiteUrl?: string;
    }
  | undefined;

interface Window {
  MicronautSiteHeader?: {
    mount(element: HTMLElement): void;
    mountAll(): void;
  };
}
