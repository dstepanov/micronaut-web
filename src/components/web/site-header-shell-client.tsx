import { hydrateRoot } from "react-dom/client";

import { SiteHeader } from "@/components/web/site-header";
import type { SiteSurfaceUrls } from "@/lib/base-path";

type HeaderSurface = "main" | "docs" | "guides";
type HeaderElement = HTMLElement & {
  dataset: DOMStringMap & {
    docsSearchIndexUrl?: string;
    docsUrl?: string;
    guidesUrl?: string;
    mainUrl?: string;
    surface?: string;
  };
};

const mountedHeaders = new WeakSet<HTMLElement>();

export function mountAll(): void {
  for (const element of document.querySelectorAll<HTMLElement>(
    "[data-micronaut-site-header]",
  )) {
    if (mountedHeaders.has(element)) continue;
    mountedHeaders.add(element);
    const header = element as HeaderElement;
    hydrateRoot(
      header,
      <SiteHeader
        docsSearchIndexUrl={header.dataset.docsSearchIndexUrl}
        navigationUrls={navigationUrls(header)}
        surface={surface(header.dataset.surface)}
      />,
    );
  }
}

function navigationUrls(element: HeaderElement): SiteSurfaceUrls {
  return {
    main: element.dataset.mainUrl,
    docs: element.dataset.docsUrl,
    guides: element.dataset.guidesUrl,
  };
}

function surface(value: string | undefined): HeaderSurface {
  return value === "docs" || value === "guides" || value === "main"
    ? value
    : "main";
}
