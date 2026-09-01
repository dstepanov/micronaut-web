const root = document.querySelector<HTMLElement>(
  "[data-docs-configuration-reference]",
);
const input = root?.querySelector<HTMLInputElement>(
  "[data-docs-configuration-filter]",
);
const count = root?.querySelector<HTMLElement>(
  "[data-docs-configuration-count]",
);
const empty = root?.querySelector<HTMLElement>(
  "[data-docs-configuration-empty]",
);
const modules = Array.from(
  root?.querySelectorAll<HTMLElement>("[data-docs-configuration-module]") || [],
);
const moduleLinks = new Map(
  Array.from(
    root?.querySelectorAll<HTMLAnchorElement>(
      "[data-docs-configuration-module-link]",
    ) || [],
    (link) => [link.hash.slice(1), link],
  ),
);

input?.addEventListener("input", () => {
  const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let visibleProperties = 0;
  let visibleModules = 0;
  for (const module of modules) {
    let moduleMatches = 0;
    for (const table of module.querySelectorAll<HTMLElement>(
      "[data-docs-configuration-table]",
    )) {
      let tableMatches = 0;
      for (const row of table.querySelectorAll<HTMLElement>("tbody tr")) {
        const haystack = row.dataset.terms || "";
        const matches = terms.every((term) => haystack.includes(term));
        row.hidden = !matches;
        if (matches) {
          tableMatches += 1;
        }
      }
      table.hidden = tableMatches === 0;
      moduleMatches += tableMatches;
    }
    module.hidden = moduleMatches === 0;
    const link = moduleLinks.get(module.id);
    if (link) {
      link.hidden = module.hidden;
    }
    visibleProperties += moduleMatches;
    if (moduleMatches > 0) {
      visibleModules += 1;
    }
  }
  if (count) {
    const total = count.dataset.docsConfigurationTotal;
    const noun = count.dataset.docsConfigurationNoun || "modules";
    const groupsLabel = `${visibleModules} ${
      visibleModules === 1 ? noun.replace(/s$/, "") : noun
    }`;
    count.textContent = terms.length
      ? `${visibleProperties} of ${total} properties across ${groupsLabel}`
      : `${total} properties across ${groupsLabel}`;
  }
  if (empty) {
    empty.hidden = visibleProperties > 0;
  }
});
