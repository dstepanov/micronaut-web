type SectionPageIndexState = {
  animationFrame?: number;
  initialized?: boolean;
  observer?: MutationObserver;
};

type SectionPageIndexWindow = Window & {
  __micronautSectionPageIndex?: Record<string, SectionPageIndexState>;
};

type SectionPageIndexOptions = {
  activeClassName?: string;
  activeDatasetKey?: string;
  currentContainerSelector?: string;
  currentLinkSelector?: string;
  linkSelector: string;
  mutationSelector?: string;
  rootIdAttribute?: string;
  rootLinkSelector?: string;
  scrollContainerSelector?: string;
  stateKey: string;
  targetIdAttribute?: string;
  topLinkSelector?: string;
};

const stateFor = (key: string) => {
  const pageIndexWindow = window as SectionPageIndexWindow;
  pageIndexWindow.__micronautSectionPageIndex ||= {};
  pageIndexWindow.__micronautSectionPageIndex[key] ||= {};
  return pageIndexWindow.__micronautSectionPageIndex[key];
};

const dataValue = (element: HTMLElement, key: string | undefined) =>
  key ? element.dataset[key] : undefined;

const decodedHash = () => {
  if (!window.location.hash) {
    return undefined;
  }
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return window.location.hash.slice(1);
  }
};

const decodedHrefTarget = (link: HTMLElement) => {
  const href = link.getAttribute("href");
  if (!href?.startsWith("#")) {
    return undefined;
  }
  const targetId = href.slice(1);
  try {
    return decodeURIComponent(targetId);
  } catch {
    return targetId;
  }
};

const targetIdForLink = (
  link: HTMLElement,
  options: SectionPageIndexOptions,
) => dataValue(link, options.targetIdAttribute) || decodedHrefTarget(link);

const rootIdForLink = (link: HTMLElement, options: SectionPageIndexOptions) =>
  dataValue(link, options.rootIdAttribute) || targetIdForLink(link, options);

const scrollOffset = () => {
  const scrollPaddingTop = Number.parseFloat(
    window.getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  const fixedOffset = (Number.isFinite(scrollPaddingTop) ? scrollPaddingTop : 80) + 16;
  return Math.max(fixedOffset, window.innerHeight * 0.25);
};

const scrollActiveLinkIntoView = (
  link: HTMLElement,
  options: SectionPageIndexOptions,
) => {
  if (!options.scrollContainerSelector) {
    return;
  }
  const container = link.closest<HTMLElement>(options.scrollContainerSelector);
  if (!container || container.scrollHeight <= container.clientHeight) {
    return;
  }
  const containerRect = container.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const margin = 20;
  if (linkRect.top < containerRect.top + margin) {
    container.scrollTop -= containerRect.top + margin - linkRect.top;
  } else if (linkRect.bottom > containerRect.bottom - margin) {
    container.scrollTop += linkRect.bottom - containerRect.bottom + margin;
  }
};

const sectionLinks = (options: SectionPageIndexOptions) =>
  Array.from(document.querySelectorAll<HTMLElement>(options.linkSelector));

const currentSectionLinks = (options: SectionPageIndexOptions) =>
  options.currentLinkSelector
    ? Array.from(
        document.querySelectorAll<HTMLElement>(options.currentLinkSelector),
      )
    : [];

const rootSectionLinks = (options: SectionPageIndexOptions) =>
  options.rootLinkSelector
    ? Array.from(document.querySelectorAll<HTMLElement>(options.rootLinkSelector))
    : [];

const sectionTargets = (
  links: HTMLElement[],
  options: SectionPageIndexOptions,
) => {
  const ids = new Set(
    links.map((link) => targetIdForLink(link, options)).filter(Boolean) as string[],
  );
  return Array.from(ids)
    .map((id) => document.getElementById(id))
    .filter((target): target is HTMLElement => Boolean(target))
    .sort(
      (left, right) =>
        left.getBoundingClientRect().top -
        right.getBoundingClientRect().top,
    );
};

const setLinkActive = (
  link: HTMLElement,
  active: boolean,
  options: SectionPageIndexOptions,
) => {
  if (options.activeClassName) {
    link.classList.toggle(options.activeClassName, active);
  }
  if (options.activeDatasetKey) {
    link.dataset[options.activeDatasetKey] = active ? "true" : "false";
  }
  if (active) {
    link.setAttribute("aria-current", "location");
  } else if (link.getAttribute("aria-current") === "location") {
    link.removeAttribute("aria-current");
  }
};

const syncCurrentSectionLinks = (
  activeRootId: string,
  options: SectionPageIndexOptions,
) => {
  const links = currentSectionLinks(options);
  if (!links.length) {
    return;
  }
  let visibleLinks = 0;
  for (const link of links) {
    const visible = rootIdForLink(link, options) === activeRootId;
    link.hidden = !visible;
    if (visible) {
      visibleLinks += 1;
    }
  }
  if (options.currentContainerSelector) {
    const container = document.querySelector<HTMLElement>(
      options.currentContainerSelector,
    );
    if (container) {
      container.hidden = visibleLinks === 0;
    }
  }
};

const syncTopLink = (activeRootId: string, options: SectionPageIndexOptions) => {
  if (!options.topLinkSelector) {
    return;
  }
  const topLink = document.querySelector<HTMLAnchorElement>(
    options.topLinkSelector,
  );
  if (!topLink) {
    return;
  }
  const rootLink = sectionLinks(options).find(
    (link) => targetIdForLink(link, options) === activeRootId,
  );
  const rootLabel = rootLink?.textContent?.trim() || "section";
  topLink.href = `#${activeRootId}`;
  topLink.setAttribute("aria-label", `Back to ${rootLabel}`);
  topLink.setAttribute("title", `Back to ${rootLabel}`);
};

const setActiveId = (activeId: string, options: SectionPageIndexOptions) => {
  const links = sectionLinks(options);
  const activeLink =
    links.find((link) => targetIdForLink(link, options) === activeId) ||
    links[0];
  const activeRootId = activeLink
    ? rootIdForLink(activeLink, options) || activeId
    : activeId;
  const roots = new Set(rootSectionLinks(options));
  const activeLinks: HTMLElement[] = [];

  for (const link of links) {
    const targetId = targetIdForLink(link, options);
    const active =
      targetId === activeId ||
      (roots.has(link) && targetId === activeRootId);
    setLinkActive(link, active, options);
    if (active) {
      activeLinks.push(link);
    }
  }

  syncCurrentSectionLinks(activeRootId, options);
  syncTopLink(activeRootId, options);

  for (const link of activeLinks) {
    scrollActiveLinkIntoView(link, options);
  }
};

const setActiveIdFromHash = (options: SectionPageIndexOptions) => {
  const activeId = decodedHash();
  if (!activeId) {
    return false;
  }
  if (
    !sectionLinks(options).some(
      (link) => targetIdForLink(link, options) === activeId,
    )
  ) {
    return false;
  }
  setActiveId(activeId, options);
  return true;
};

const nodeContainsPageIndexMarkup = (
  node: Node,
  selector: string,
) =>
  node instanceof Element &&
  (node.matches(selector) || Boolean(node.querySelector(selector)));

export const enhanceSectionPageIndex = (options: SectionPageIndexOptions) => {
  const state = stateFor(options.stateKey);

  const update = () => {
    const links = sectionLinks(options);
    const targets = sectionTargets(links, options);
    if (!links.length || !targets.length) {
      return;
    }

    const offset = scrollOffset();
    let activeTarget = targets[0];
    for (const target of targets) {
      if (target.getBoundingClientRect().top <= offset) {
        activeTarget = target;
      } else {
        break;
      }
    }
    if (activeTarget?.id) {
      setActiveId(activeTarget.id, options);
    }
  };

  const scheduleUpdate = () => {
    if (state.animationFrame) {
      window.cancelAnimationFrame(state.animationFrame);
    }
    state.animationFrame = window.requestAnimationFrame(() => {
      state.animationFrame = 0;
      update();
    });
  };

  const scheduleHashUpdate = () => {
    window.setTimeout(() => {
      if (!setActiveIdFromHash(options)) {
        scheduleUpdate();
      }
    }, 0);
    window.setTimeout(() => {
      if (!setActiveIdFromHash(options)) {
        scheduleUpdate();
      }
    }, 150);
  };

  if (state.initialized) {
    scheduleUpdate();
    return;
  }

  state.initialized = true;
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleHashUpdate);
  document.addEventListener("astro:hydrate", scheduleUpdate);

  const mutationSelector = options.mutationSelector || options.linkSelector;
  state.observer = new MutationObserver((mutations) => {
    if (
      mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) =>
          nodeContainsPageIndexMarkup(node, mutationSelector),
        ),
      )
    ) {
      scheduleUpdate();
    }
  });
  state.observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (window.location.hash) {
    scheduleHashUpdate();
  } else {
    scheduleUpdate();
  }
};
