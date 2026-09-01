const sidebar = document.querySelector<HTMLElement>("[data-docs-sidebar]");
const sidebarToggle = document.querySelector<HTMLButtonElement>(
  "[data-docs-sidebar-toggle]",
);
const mobileNavigation = document.querySelector<HTMLDialogElement>(
  "[data-docs-mobile-nav]",
);
const mobileNavigationTrigger = document.querySelector<HTMLButtonElement>(
  "[data-docs-mobile-nav-trigger]",
);
const mobileNavigationClose = document.querySelector<HTMLButtonElement>(
  "[data-docs-mobile-nav-close]",
);
const sidebarCookieName = "sidebar_state";
const sidebarCookieMaxAge = 60 * 60 * 24 * 7;

function sidebarIsOpen() {
  return !document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .includes(`${sidebarCookieName}=false`);
}

function setSidebarOpen(open: boolean) {
  if (!sidebar || !sidebarToggle) return;
  sidebar.dataset.state = open ? "expanded" : "collapsed";
  sidebar.dataset.collapsible = open ? "" : "icon";
  sidebarToggle.setAttribute("aria-expanded", String(open));
  document.cookie = `${sidebarCookieName}=${open}; path=/; max-age=${sidebarCookieMaxAge}`;
}

setSidebarOpen(sidebarIsOpen());
sidebarToggle?.addEventListener("click", () => {
  setSidebarOpen(!sidebarIsOpen());
});
document.addEventListener("keydown", (event) => {
  if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    setSidebarOpen(!sidebarIsOpen());
  }
});
mobileNavigationTrigger?.addEventListener("click", () =>
  mobileNavigation?.showModal(),
);
mobileNavigationClose?.addEventListener("click", () =>
  mobileNavigation?.close(),
);
mobileNavigation?.addEventListener("click", (event) => {
  if (event.target === mobileNavigation) mobileNavigation.close();
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest("a[href]");
  if (link && !event.target.closest("[data-docs-project-section-toggle]")) {
    mobileNavigation.close();
  }
});

// The reference row starts in the flow at the top of the page and pins under
// the topbar as the reader scrolls. Shrinking the observer root to one pixel
// below the row's own pin offset reports it as fully visible only while it is
// still in the flow, so the buttons can lift off the prose they scroll over.
// Where the row is not pinned at all — a phone, where it stays in the flow —
// there is no offset to read and nothing to observe.
const referenceLinks = document.querySelector<HTMLElement>(
  "[data-docs-reference-links]",
);
const referencePinOffset = referenceLinks
  ? Number.parseFloat(getComputedStyle(referenceLinks).top)
  : Number.NaN;
if (referenceLinks && Number.isFinite(referencePinOffset)) {
  new IntersectionObserver(
    ([entry]) => {
      referenceLinks.dataset.stuck = String(entry.intersectionRatio < 1);
    },
    { threshold: [1], rootMargin: `-${referencePinOffset + 1}px 0px 0px 0px` },
  ).observe(referenceLinks);
}
