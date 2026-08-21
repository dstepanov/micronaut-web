import "@/styles/globals.css";

const headerSelector = "[data-micronaut-site-header]";
const styleSelector = "link[data-micronaut-site-header-style]";
let headerClient: Promise<typeof import("./site-header-shell-client")> | undefined;

ensureShellStyles();
mountAll();

window.MicronautSiteHeader = {
  mount: loadHeader,
  mountAll,
};

function mountAll(): void {
  for (const element of document.querySelectorAll<HTMLElement>(headerSelector)) {
    element.addEventListener("pointerenter", loadHeader, { once: true });
    element.addEventListener("focusin", loadHeader, { once: true });
    element.addEventListener("touchstart", loadHeader, { once: true, passive: true });
  }

  document.addEventListener("click", (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-micronaut-header-interaction]",
    );
    if (!trigger) return;
    event.preventDefault();
    headerClient ||= import("./site-header-shell-client");
    void headerClient.then(({ mountAll: mountHeaderClient }) => {
      mountHeaderClient();
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(trigger.dataset.micronautHeaderInteraction || "")
          ?.click();
      });
    });
  });
}

function loadHeader(): void {
  headerClient ||= import("./site-header-shell-client");
  void headerClient.then(({ mountAll: mountHeaderClient }) => mountHeaderClient());
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
