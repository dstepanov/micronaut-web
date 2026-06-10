import { enhanceSectionPageIndex } from "./section-page-index";

type DocsScrollSpyState = {
  initialized?: boolean;
};

type DocsScrollSpyWindow = Window & {
  __micronautDocsScrollSpy?: DocsScrollSpyState;
};

const scrollSpyState = () => {
  const scrollSpyWindow = window as DocsScrollSpyWindow;
  scrollSpyWindow.__micronautDocsScrollSpy ||= {};
  return scrollSpyWindow.__micronautDocsScrollSpy;
};

const activeProjectSectionToggles = (slug: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-docs-project-section-toggle]",
    ),
  ).filter((toggle) => toggle.dataset.docsProjectSlug === slug);

const projectSectionLists = (slug: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>("[data-docs-project-sections]"),
  ).filter((list) => list.dataset.docsProjectSlug === slug);

const setProjectSectionsExpanded = (slug: string, expanded: boolean) => {
  for (const toggle of activeProjectSectionToggles(slug)) {
    toggle.setAttribute("aria-expanded", String(expanded));
  }
  for (const list of projectSectionLists(slug)) {
    list.hidden = !expanded;
    list.dataset.state = expanded ? "expanded" : "collapsed";
  }
};

const toggleProjectSections = (toggle: HTMLElement) => {
  const slug = toggle.dataset.docsProjectSlug;
  if (!slug) {
    return;
  }
  const sections = projectSectionLists(slug);
  if (!sections.length) {
    return;
  }
  const expanded = toggle.getAttribute("aria-expanded") === "true";
  setProjectSectionsExpanded(slug, !expanded);
};

const visibleElementRect = (element: HTMLElement) => {
  const rect = element.getClientRects()[0];
  if (!rect) {
    return undefined;
  }
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return undefined;
  }
  return rect;
};

const scrollActiveProjectIntoView = () => {
  const activeLinks = Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-docs-active-project-link='true']",
    ),
  );
  for (const link of activeLinks) {
    const container = link.closest<HTMLElement>(
      "[data-docs-sidebar-scroll-container]",
    );
    if (!container || container.scrollHeight <= container.clientHeight) {
      continue;
    }
    const containerRect = visibleElementRect(container);
    const linkRect = visibleElementRect(link);
    if (!containerRect || !linkRect) {
      continue;
    }
    if (
      linkRect.top >= containerRect.top &&
      linkRect.bottom <= containerRect.bottom
    ) {
      continue;
    }

    const offset = Math.min(96, Math.max(24, container.clientHeight * 0.28));
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    container.scrollTop = Math.max(
      0,
      Math.min(
        maxScrollTop,
        container.scrollTop + linkRect.top - containerRect.top - offset,
      ),
    );
  }
};

const scheduleActiveProjectScroll = () => {
  window.requestAnimationFrame(scrollActiveProjectIntoView);
  window.setTimeout(scrollActiveProjectIntoView, 150);
};

const onProjectSectionToggleClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const toggle = target.closest<HTMLElement>(
    "[data-docs-project-section-toggle]",
  );
  if (!toggle) {
    return;
  }
  event.preventDefault();
  toggleProjectSections(toggle);
};

const enhanceDocsScrollSpy = () => {
  const state = scrollSpyState();
  if (!state.initialized) {
    state.initialized = true;
    document.addEventListener("click", onProjectSectionToggleClick);
  }

  scheduleActiveProjectScroll();

  enhanceSectionPageIndex({
    activeClassName: "active",
    activeDatasetKey: "active",
    currentContainerSelector: "[data-docs-current-section-index]",
    currentLinkSelector: "[data-docs-current-section-link]",
    linkSelector: "[data-docs-scroll-link]",
    mutationSelector:
      "[data-docs-scroll-link], [data-docs-scroll-container], [data-docs-current-section-index]",
    rootIdAttribute: "docsSectionRootId",
    rootLinkSelector: "[data-docs-project-section-link]",
    scrollContainerSelector: "[data-docs-scroll-container]",
    stateKey: "docs",
    targetIdAttribute: "docsTargetId",
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceDocsScrollSpy, {
    once: true,
  });
} else {
  enhanceDocsScrollSpy();
}
