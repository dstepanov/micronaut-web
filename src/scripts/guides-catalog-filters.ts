const catalog = document.querySelector<HTMLElement>("[data-guides-catalog]");

if (catalog) {
  const activeTag = catalog.dataset.activeTag || "";
  const searchInput =
    catalog.querySelector<HTMLInputElement>('input[name="q"]');
  const cards = Array.from(
    catalog.querySelectorAll<HTMLElement>("[data-guide-card]"),
  );
  // Cards move into the flat search list while a query is active; remember
  // where each came from so clearing the query restores the grouped browser.
  const homeGrid = new Map<HTMLElement, HTMLElement | null>(
    cards.map((card) => [card, card.parentElement]),
  );

  type FilterState = {
    query: string;
    category: string;
    tag: string;
    sort: string;
  };

  const readState = (): FilterState => {
    const params = new URLSearchParams(window.location.search);
    return {
      query: (params.get("q") || "").trim(),
      category: normalizeTopic(params.get("category") || ""),
      tag: normalizeTopic(activeTag || params.get("tag") || ""),
      sort: params.get("sort") || "latest",
    };
  };

  const render = (state: FilterState) => {
    const { query, category, tag, sort } = state;
    const hasFilters = Boolean(query || category || tag || sort !== "latest");
    const normalizedQuery = query.toLowerCase();
    const querySlug = normalizeTopic(query);

    // Rebuild every grid in its prerendered order before filtering, so
    // repeated live-search renders always start from the same layout.
    for (const card of cards) {
      homeGrid.get(card)?.append(card);
      card.hidden = !guideCardMatches(card, {
        category,
        normalizedQuery,
        querySlug,
        tag,
      });
    }
    const visibleCount = cards.filter((card) => !card.hidden).length;

    const directory = catalog.querySelector<HTMLElement>(
      "[data-guides-directory]",
    );
    if (directory) {
      directory.hidden = hasFilters;
    }
    const latestSection = catalog.querySelector<HTMLElement>(
      "[data-guides-latest-section]",
    );
    if (latestSection) {
      latestSection.hidden = hasFilters;
    }

    // A text search asks "what matches, newest first", so it renders as one
    // flat sorted list; without a query, filters show the grouped browser.
    const results = catalog.querySelector<HTMLElement>("[data-guides-results]");
    if (results) {
      results.hidden = !hasFilters || Boolean(query);
    }
    const searchSection = catalog.querySelector<HTMLElement>(
      "[data-guides-search-results]",
    );
    const searchList = searchSection?.querySelector<HTMLElement>(
      "[data-guides-search-list]",
    );
    if (searchSection && searchList) {
      if (query) {
        for (const card of cards) {
          if (!card.hidden) {
            searchList.append(card);
          }
        }
        sortGuideCards(searchList, sort);
        const count = searchSection.querySelector<HTMLElement>(
          "[data-guides-search-count]",
        );
        if (count) {
          count.textContent = `${visibleCount} ${
            visibleCount === 1 ? "guide" : "guides"
          }`;
        }
      }
      searchSection.hidden = !query || visibleCount === 0;
    }

    for (const group of Array.from(
      catalog.querySelectorAll<HTMLElement>("[data-guide-category-group]"),
    )) {
      group.hidden =
        hasFilters && !query
          ? !group.querySelector("[data-guide-card]:not([hidden])")
          : false;
    }
    if (hasFilters && !query) {
      for (const grid of Array.from(
        catalog.querySelectorAll<HTMLElement>("[data-guide-card-grid]"),
      )) {
        sortGuideCards(grid, sort);
      }
    }

    for (const link of Array.from(
      catalog.querySelectorAll<HTMLAnchorElement>(
        "[data-guide-category-jump-link]",
      ),
    )) {
      if (link.dataset.category === category) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }

    const emptyState = catalog.querySelector<HTMLElement>(
      "[data-guides-empty]",
    );
    if (emptyState) {
      emptyState.hidden = !hasFilters || visibleCount > 0;
    }
  };

  const initial = readState();
  if (searchInput) {
    searchInput.value = initial.query;
  }
  render(initial);

  // Live search: keep the URL shareable while filtering on every keystroke.
  let debounceTimer: number | undefined;
  searchInput?.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const value = searchInput.value.trim();
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      const suffix = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${suffix ? `?${suffix}` : ""}`,
      );
      render(readState());
    }, 150);
  });

  window.addEventListener("popstate", () => {
    const state = readState();
    if (searchInput) {
      searchInput.value = state.query;
    }
    render(state);
  });

  const categoryJump = catalog.querySelector<HTMLDetailsElement>(
    "[data-guide-category-jump]",
  );
  categoryJump?.addEventListener("click", (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest("[data-guide-category-jump-link]")
    ) {
      categoryJump.open = false;
    }
  });
}

function guideCardMatches(
  card: HTMLElement,
  filters: {
    category: string;
    normalizedQuery: string;
    querySlug: string;
    tag: string;
  },
) {
  const search = card.dataset.search || "";
  const categories = splitDatasetList(card.dataset.categories);
  const tags = splitDatasetList(card.dataset.tags);

  if (
    filters.normalizedQuery &&
    !search.includes(filters.normalizedQuery) &&
    !Boolean(filters.querySlug && search.includes(filters.querySlug))
  ) {
    return false;
  }
  if (filters.category && !categories.includes(filters.category)) {
    return false;
  }
  if (filters.tag && !tags.includes(filters.tag)) {
    return false;
  }
  return true;
}

function sortGuideCards(grid: HTMLElement, sort: string) {
  const cards = Array.from(
    grid.querySelectorAll<HTMLElement>("[data-guide-card]"),
  );
  const sorted = cards.sort((left, right) => {
    if (sort === "title") {
      return dataTitle(left).localeCompare(dataTitle(right));
    }
    if (sort === "duration") {
      return (
        dataNumber(left, "minutes") - dataNumber(right, "minutes") ||
        dataTitle(left).localeCompare(dataTitle(right))
      );
    }
    return (
      (right.dataset.date || "").localeCompare(left.dataset.date || "") ||
      dataTitle(left).localeCompare(dataTitle(right))
    );
  });
  for (const card of sorted) {
    grid.append(card);
  }
}

function dataTitle(card: HTMLElement) {
  return card.dataset.title || "";
}

function dataNumber(card: HTMLElement, key: string) {
  const value = Number(card.dataset[key]);
  return Number.isFinite(value) ? value : 0;
}

function splitDatasetList(value: string | undefined) {
  return (value || "").split("|").filter(Boolean);
}

function normalizeTopic(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
