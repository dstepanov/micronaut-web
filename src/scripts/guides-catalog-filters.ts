const catalog = document.querySelector<HTMLElement>("[data-guides-catalog]");

if (catalog) {
  const params = new URLSearchParams(window.location.search);
  const activeTag = catalog.dataset.activeTag || "";
  const query = (params.get("q") || "").trim();
  const category = normalizeTopic(params.get("category") || "");
  const tag = normalizeTopic(activeTag || params.get("tag") || "");
  const sort = params.get("sort") || "latest";
  const hasFilters = Boolean(query || category || tag || sort !== "latest");
  const searchInput =
    catalog.querySelector<HTMLInputElement>('input[name="q"]');

  if (searchInput) {
    searchInput.value = query;
  }
  const cards = Array.from(
    catalog.querySelectorAll<HTMLElement>("[data-guide-card]"),
  );

  if (hasFilters) {
    const normalizedQuery = query.toLowerCase();
    const querySlug = normalizeTopic(query);
    const visibleCards = new Set<HTMLElement>();

    for (const card of cards) {
      const visible = guideCardMatches(card, {
        category,
        normalizedQuery,
        querySlug,
        tag,
      });
      card.hidden = !visible;
      if (visible) {
        visibleCards.add(card);
      }
    }

    for (const grid of Array.from(
      catalog.querySelectorAll<HTMLElement>("[data-guide-card-grid]"),
    )) {
      sortGuideCards(grid, sort);
    }

    for (const group of Array.from(
      catalog.querySelectorAll<HTMLElement>("[data-guide-category-group]"),
    )) {
      group.hidden = !Array.from(
        group.querySelectorAll<HTMLElement>("[data-guide-card]"),
      ).some((card) => !card.hidden);
    }

    const latestSection = catalog.querySelector<HTMLElement>(
      "[data-guides-latest-section]",
    );
    if (latestSection) {
      latestSection.hidden = true;
    }

    const emptyState = catalog.querySelector<HTMLElement>(
      "[data-guides-empty]",
    );
    if (emptyState) {
      emptyState.hidden = visibleCards.size > 0;
    }

    // Filter results must not hide matches behind collapsed sections.
    expandAllCategoryGroups(catalog);
  }

  for (const button of Array.from(
    catalog.querySelectorAll<HTMLButtonElement>("[data-guide-show-all]"),
  )) {
    button.addEventListener("click", () => {
      button
        .closest("[data-guide-category-group]")
        ?.querySelector("[data-guide-card-grid]")
        ?.removeAttribute("data-collapsed");
      button.hidden = true;
    });
  }

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

function expandAllCategoryGroups(catalog: HTMLElement) {
  for (const grid of Array.from(
    catalog.querySelectorAll<HTMLElement>("[data-guide-card-grid]"),
  )) {
    grid.removeAttribute("data-collapsed");
  }
  for (const button of Array.from(
    catalog.querySelectorAll<HTMLElement>("[data-guide-show-all]"),
  )) {
    button.hidden = true;
  }
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
