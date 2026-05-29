import { renderToStaticMarkup } from "react-dom/server";

import {
  CopyIcon,
  DocsPropertiesSnippetCard,
  DocsSnippetCard,
  DocsSnippetCopyButton,
} from "@/components/web/docs-snippet-card";

const codeSnippetPlaceholders = [
  "snippetId",
  "optionsLabel",
  "optionButtonsHtml",
  "copyLabel",
  "snippetPanelsHtml",
];

const propertiesSnippetPlaceholders = [
  "propertiesId",
  "propertiesAnchorId",
  "propertiesEyebrow",
  "propertiesTitle",
  "propertiesCountLabel",
  "propertiesTableHtml",
];

function CodeSnippetTemplate({ dependency = false }: { dependency?: boolean }) {
  return (
    <DocsSnippetCard
      id="{{snippetId}}"
      kind={dependency ? "dependency" : "code"}
      action={
        <DocsSnippetCopyButton data-copy-active-snippet="">
          <CopyIcon />
          <span className="sr-only">{"{{copyLabel}}"}</span>
        </DocsSnippetCopyButton>
      }
      controls={
        <div
          className="docs-snippet-tabs docs-code-tabs docs-code-tabs-multi flex flex-wrap items-center gap-1"
          role="tablist"
          aria-label="{{optionsLabel}}"
        >
          {"{{optionButtonsHtml}}"}
        </div>
      }
    >
      {"{{snippetPanelsHtml}}"}
    </DocsSnippetCard>
  );
}

function PropertiesSnippetTemplate() {
  return (
    <DocsPropertiesSnippetCard
      id="{{propertiesId}}"
      anchorId="{{propertiesAnchorId}}"
      title="{{propertiesTitle}}"
      eyebrow="{{propertiesEyebrow}}"
      countLabel="{{propertiesCountLabel}}"
    >
      {"{{propertiesTableHtml}}"}
    </DocsPropertiesSnippetCard>
  );
}

function template(html: string, placeholders: string[]) {
  return {
    html: `${html}\n`,
    placeholders,
  };
}

export function renderDocsSnippetTemplates() {
  return {
    "docs/snippets/code-snippet.html": template(
      renderToStaticMarkup(<CodeSnippetTemplate />),
      codeSnippetPlaceholders,
    ),
    "docs/snippets/dependency-snippet.html": template(
      renderToStaticMarkup(<CodeSnippetTemplate dependency />),
      codeSnippetPlaceholders,
    ),
    "docs/snippets/properties-snippet.html": template(
      renderToStaticMarkup(<PropertiesSnippetTemplate />),
      propertiesSnippetPlaceholders,
    ),
  };
}
