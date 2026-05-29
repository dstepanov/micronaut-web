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
  setProjectSectionsExpanded(slug, sections.some((section) => section.hidden));
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

  enhanceSectionPageIndex({
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
