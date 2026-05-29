(() => {
  const snippetText = (block: Element) => {
    const code = block.querySelector("code");
    return code?.innerText || code?.textContent || "";
  };

  const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  const decorateCopyButtonIcon = (button: HTMLElement) => {
    const icon = button.querySelector("svg");
    if (!icon) {
      return;
    }
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.setAttribute("stroke-width", "2");
  };

  const setCopyState = (button: HTMLElement, copied: boolean) => {
    button.setAttribute("aria-label", copied ? "Copied" : "Copy code");
    button.setAttribute("title", copied ? "Copied" : "Copy code");
    const label = button.querySelector("span");
    if (label) {
      label.textContent = copied ? "Copied" : "Copy code";
    }
  };

  const bindCopyButton = (button: HTMLElement, getText: () => string) => {
    if (button.dataset.copyEnhanced === "true") {
      return;
    }
    button.dataset.copyEnhanced = "true";
    button.addEventListener("click", async () => {
      try {
        await copyText(getText());
        setCopyState(button, true);
        window.setTimeout(() => setCopyState(button, false), 1400);
      } catch {
        button.setAttribute("aria-label", "Copy failed");
        button.setAttribute("title", "Copy failed");
        window.setTimeout(() => setCopyState(button, false), 1800);
      }
    });
  };

  const bindStaticSnippetTemplate = (template: HTMLElement) => {
    if (template.dataset.staticSnippetEnhanced === "true") {
      return;
    }
    const tabs = Array.from(
      template.querySelectorAll<HTMLElement>(
        ".docs-snippet-tabs button[role='tab']",
      ),
    );
    const panels = tabs
      .map((tab) =>
        document.getElementById(tab.getAttribute("aria-controls") || ""),
      )
      .filter((panel): panel is HTMLElement => Boolean(panel));
    const copyButton = template.querySelector<HTMLElement>(
      "[data-copy-active-snippet]",
    );
    if (!tabs.length || !panels.length) {
      return;
    }
    template.dataset.staticSnippetEnhanced = "true";
    let activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"),
    );

    const activate = (nextIndex: number) => {
      activeIndex = nextIndex;
      panels.forEach((panel, index) => {
        const active = index === activeIndex;
        panel.hidden = !active;
        panel.setAttribute("aria-hidden", String(!active));
      });
      tabs.forEach((tab, index) => {
        const active = index === activeIndex;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
          return;
        }
        event.preventDefault();
        const offset = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + offset + tabs.length) % tabs.length;
        activate(nextIndex);
        tabs[nextIndex]?.focus();
      });
    });

    if (copyButton) {
      decorateCopyButtonIcon(copyButton);
      bindCopyButton(copyButton, () => snippetText(panels[activeIndex]));
    }
    activate(activeIndex);
  };

  const enhanceTemplateSnippetControls = (root: Element) => {
    root.querySelectorAll<HTMLElement>(".docs-snippet-template").forEach(
      (template) => {
        bindStaticSnippetTemplate(template);
      },
    );
  };

  const stabilizeGeneratedImages = (root: Element) => {
    root.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      image.loading = image.loading || "lazy";
      image.decoding = image.decoding || "async";
      const applyDimensions = () => {
        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
          image.width = image.width || image.naturalWidth;
          image.height = image.height || image.naturalHeight;
        }
      };
      if (image.complete) {
        applyDimensions();
      } else {
        image.addEventListener("load", applyDimensions, { once: true });
      }
    });
  };

  const init = () => {
    document.querySelectorAll<HTMLElement>("[data-generated-docs]").forEach(
      (root) => {
        if (root.dataset.generatedDocsEnhanced === "true") {
          return;
        }
        root.dataset.generatedDocsEnhanced = "true";
        stabilizeGeneratedImages(root);
        enhanceTemplateSnippetControls(root);
      },
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
