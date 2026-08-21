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
mobileNavigationTrigger?.addEventListener("click", () => mobileNavigation?.showModal());
mobileNavigationClose?.addEventListener("click", () => mobileNavigation?.close());
mobileNavigation?.addEventListener("click", (event) => {
  if (event.target === mobileNavigation) mobileNavigation.close();
  if ((event.target as Element).closest("a[href]")) mobileNavigation.close();
});
