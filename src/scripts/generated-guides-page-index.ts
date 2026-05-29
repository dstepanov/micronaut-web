import { enhanceSectionPageIndex } from "./section-page-index";

const initGeneratedGuidesPageIndex = () => {
  enhanceSectionPageIndex({
    activeClassName: "active",
    currentContainerSelector: "[data-guide-page-index]",
    currentLinkSelector: "[data-guide-page-index-link]",
    linkSelector: "[data-guide-page-index-link], [data-guide-section-link]",
    mutationSelector:
      "[data-guide-page-index], [data-guide-page-index-link], [data-guide-section-link]",
    rootIdAttribute: "rootId",
    rootLinkSelector: "[data-guide-section-link]",
    scrollContainerSelector: "[data-guide-page-index-inner]",
    stateKey: "guides",
    targetIdAttribute: "sectionId",
    topLinkSelector: "[data-guide-page-index-top]",
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGeneratedGuidesPageIndex, {
    once: true,
  });
} else {
  initGeneratedGuidesPageIndex();
}
