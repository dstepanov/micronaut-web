import { createRoot } from "react-dom/client";

import { SiteHeader } from "@/components/web/site-header";
import type { SiteSurfaceUrls } from "@/lib/base-path";
import "@/styles/globals.css";

type HeaderSurface = "main" | "docs" | "guides" | "launch";

type HeaderElement = HTMLElement & {
  dataset: DOMStringMap & {
    docsSearchIndexUrl?: string;
    docsUrl?: string;
    guidesUrl?: string;
    mainUrl?: string;
    surface?: string;
  };
};

const headerSelector = "[data-micronaut-site-header]";
const styleSelector = "link[data-micronaut-site-header-style]";
const mountedHeaders = new WeakSet<HTMLElement>();

ensureShellStyles();
mountAll();

window.MicronautSiteHeader = {
  mount: mountHeader,
  mountAll,
};

function mountAll(): void {
  for (const element of document.querySelectorAll<HTMLElement>(
    headerSelector,
  )) {
    mountHeader(element);
  }
}

function mountHeader(element: HTMLElement): void {
  if (mountedHeaders.has(element)) {
    return;
  }
  mountedHeaders.add(element);
  const headerElement = element as HeaderElement;
  const urls = navigationUrls(headerElement);
  createRoot(headerElement).render(
    <SiteHeader
      docsSearchIndexUrl={headerElement.dataset.docsSearchIndexUrl}
      navigationUrls={urls}
      surface={surface(headerElement.dataset.surface)}
    />,
  );
}

function ensureShellStyles(): void {
  if (document.querySelector(styleSelector)) {
    return;
  }
  const script = document.currentScript;
  if (!(script instanceof HTMLScriptElement) || !script.src) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("site-header.css", script.src).toString();
  link.dataset.micronautSiteHeaderStyle = "";
  document.head.append(link);
}

function navigationUrls(element: HeaderElement): SiteSurfaceUrls {
  return {
    main: element.dataset.mainUrl,
    docs: element.dataset.docsUrl,
    guides: element.dataset.guidesUrl,
  };
}

function surface(value: string | undefined): HeaderSurface {
  if (
    value === "main" ||
    value === "docs" ||
    value === "guides" ||
    value === "launch"
  ) {
    return value;
  }
  return "main";
}
