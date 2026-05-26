(function(){const docsPropertiesTemplate = {"html":"\u003cdiv data-slot=\"card\" class=\"docs-properties-template my-5 flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card py-0 text-card-foreground shadow-sm shadow-black/[0.03] dark:shadow-black/20\" id=\"{{propertiesId}}\">\u003ca class=\"docs-properties-anchor block h-0 overflow-hidden no-underline\" id=\"{{propertiesAnchorId}}\" href=\"#{{propertiesAnchorId}}\" aria-hidden=\"true\">\u003c/a>\u003cdiv data-slot=\"card-header\" class=\"[.border-b]:pb-6 @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 border-b border-code-border bg-code-tab px-4 py-2.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:!pb-2.5\">\u003cdiv data-slot=\"card-title\" class=\"docs-properties-heading flex min-w-0 items-center gap-2 text-sm leading-5 font-semibold\">\u003cspan class=\"docs-code-language-icon inline-flex size-3.5 shrink-0 items-center justify-center self-center leading-none [&amp;_svg]:block [&amp;_svg]:size-full docs-code-language-icon-properties docs-snippet-kind-icon\" aria-hidden=\"true\">\u003csvg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\">\u003cpath d=\"M4.5 7h7\">\u003c/path>\u003cpath d=\"M15.5 7h4\">\u003c/path>\u003cpath d=\"M4.5 12h4\">\u003c/path>\u003cpath d=\"M12.5 12h7\">\u003c/path>\u003cpath d=\"M4.5 17h9\">\u003c/path>\u003cpath d=\"M17.5 17h2\">\u003c/path>\u003ccircle cx=\"13.5\" cy=\"7\" r=\"2\">\u003c/circle>\u003ccircle cx=\"10.5\" cy=\"12\" r=\"2\">\u003c/circle>\u003ccircle cx=\"15.5\" cy=\"17\" r=\"2\">\u003c/circle>\u003c/svg>\u003c/span>\u003cspan>{{propertiesTitle}}\u003c/span>\u003c/div>\u003cdiv data-slot=\"card-description\" class=\"text-muted-foreground docs-properties-description text-xs leading-5\">{{propertiesEyebrow}}\u003c/div>\u003cdiv data-slot=\"card-action\" class=\"col-start-2 row-span-2 row-start-1 self-start justify-self-end\">\u003cspan data-slot=\"badge\" data-variant=\"secondary\" class=\"transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;&gt;svg]:pointer-events-none [&amp;&gt;svg]:size-3 [a&amp;]:hover:bg-secondary/90 docs-properties-count inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent bg-secondary px-2.5 py-1 text-[0.78rem] font-medium whitespace-nowrap text-secondary-foreground\">{{propertiesCountLabel}}\u003c/span>\u003c/div>\u003c/div>\u003cdiv data-slot=\"card-content\" class=\"docs-properties-scroll overflow-x-auto px-0 [&amp;_table.tableblock]:w-full [&amp;_table.tableblock]:!m-0 [&amp;_table.tableblock]:border-collapse [&amp;_table.tableblock]:text-[0.92rem] [&amp;_table.tableblock]:leading-[1.45] [&amp;_table.tableblock_caption]:!m-0 [&amp;_table.tableblock_caption]:text-left [&amp;_table.tableblock_caption]:font-bold [&amp;_table.tableblock_caption]:text-foreground [&amp;_table.tableblock_:where(th,td)]:border [&amp;_table.tableblock_:where(th,td)]:border-border [&amp;_table.tableblock_:where(th,td)]:px-3 [&amp;_table.tableblock_:where(th,td)]:py-[0.65rem] [&amp;_table.tableblock_:where(th,td)]:align-top [&amp;_table.tableblock_th]:bg-muted [&amp;_table.tableblock_th]:font-bold [&amp;_table.tableblock_th]:text-foreground\">{{propertiesTableHtml}}\u003c/div>\u003c/div>\n","placeholders":["propertiesId","propertiesAnchorId","propertiesEyebrow","propertiesTitle","propertiesCountLabel","propertiesTableHtml"]};
const docsPropertiesCardClass = "docs-properties-template my-5 flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card py-0 text-card-foreground shadow-sm shadow-black/[0.03] dark:shadow-black/20";

  (() => {
    void docsPropertiesCardClass;

    const escapeHtml = (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;");

    const renderSharedPropertiesCard = ({ propertiesId, propertiesAnchorId, propertiesTitle, propertiesEyebrow, propertiesCountLabel }) => {
      const source = docsPropertiesTemplate.html;
      const html = source.replace(/{{(\w+)}}/g, (_, key) => ({
        propertiesId: escapeHtml(propertiesId),
        propertiesAnchorId: escapeHtml(propertiesAnchorId),
        propertiesTitle: escapeHtml(propertiesTitle),
        propertiesEyebrow: escapeHtml(propertiesEyebrow),
        propertiesCountLabel: escapeHtml(propertiesCountLabel),
        propertiesTableHtml: ""
      })[key] ?? "");
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      return template.content.firstElementChild;
    };

    const enhanceProperties = (root) => {
      const tables = Array.from(root.querySelectorAll("table.tableblock"));
      let propertiesIndex = 0;
      for (const table of tables) {
        const caption = table.querySelector("caption");
        if (!caption || !/configuration properties/i.test(caption.textContent || "") || table.closest(".docs-properties-template")) {
          continue;
        }

        const title = caption.textContent.trim().replace(/^Table\s+\d+\.\s*/i, "");
        const rows = table.querySelectorAll("tbody tr").length;
        const previous = table.previousElementSibling;
        const anchor = previous?.tagName === "A" && previous.id ? previous : undefined;
        const propertiesAnchorId = anchor?.id || `generated-properties-${propertiesIndex}`;
        const template = renderSharedPropertiesCard({
          propertiesId: `${propertiesAnchorId}-properties`,
          propertiesAnchorId,
          propertiesTitle: title,
          propertiesEyebrow: "Configuration properties",
          propertiesCountLabel: `${rows} ${rows === 1 ? "property" : "properties"}`
        });
        const scroller = template?.querySelector(":scope > [data-slot='card-content']");
        if (!template || !scroller) {
          continue;
        }
        caption.classList.add("sr-only");

        const insertionPoint = anchor || table;
        insertionPoint.parentNode.insertBefore(template, insertionPoint);
        if (anchor) {
          anchor.remove();
        }
        scroller.append(table);
        propertiesIndex += 1;
      }
    };

    const init = () => {
      document.querySelectorAll("[data-generated-docs]").forEach((root) => {
        if (root.dataset.generatedDocsPropertiesEnhanced === "true") {
          return;
        }
        root.dataset.generatedDocsPropertiesEnhanced = "true";
        enhanceProperties(root);
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }
  })();
})();