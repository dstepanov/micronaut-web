import { renderToStaticMarkup } from "react-dom/server";

import { DocsCodeSnippet } from "./docs-code-snippet";
import { DocsPropertiesSnippetCard } from "./docs-snippet-card";

type GeneratedSnippetKind = "code" | "dependency";

type GeneratedSnippetVariant = {
  active: boolean;
  highlightedHtml: string;
  label: string;
  language: string;
  panelId: string;
  source: string;
  tabId: string;
};

type GeneratedSnippetInput = {
  copyLabel: string;
  descriptionHtml?: string;
  footerHtml?: string;
  id: string;
  kind: GeneratedSnippetKind;
  optionsLabel: string;
  titleHtml?: string;
  variants: GeneratedSnippetVariant[];
};

type GeneratedPropertiesCardInput = {
  anchorId: string;
  countLabel: string;
  eyebrow: string;
  id: string;
  tableHtml: string;
  title: string;
};

export function renderGeneratedSnippet(input: GeneratedSnippetInput) {
  const {
    copyLabel,
    descriptionHtml = "",
    footerHtml = "",
    id,
    kind,
    optionsLabel,
    titleHtml = "",
    variants,
  } = input;

  return `${renderToStaticMarkup(
    <DocsCodeSnippet
      example={{
        id,
        label: optionsLabel,
        variants: variants.map((variant) => ({
          active: variant.active,
          code: variant.source,
          fileName: variant.label,
          highlightedHtml: variant.highlightedHtml,
          label: variant.label,
          language: variant.language,
          panelId: variant.panelId,
          tabId: variant.tabId,
        })),
      }}
      kind={kind}
      copyLabel={copyLabel}
      description={htmlInline(descriptionHtml)}
      externalHeader={kind === "code"}
      footer={footerHtml ? htmlBlock(footerHtml) : undefined}
      optionsLabel={optionsLabel}
      showSingleVariantAsTabs
      staticEnhancement
      title={htmlInline(titleHtml)}
    />,
  )}\n`;
}

export function renderGeneratedPropertiesCard(
  input: GeneratedPropertiesCardInput,
) {
  const { anchorId, countLabel, eyebrow, id, tableHtml, title } = input;
  return `${renderToStaticMarkup(
    <DocsPropertiesSnippetCard
      id={id}
      anchorId={anchorId}
      title={title}
      eyebrow={eyebrow}
      countLabel={countLabel}
    >
      {htmlBlock(tableHtml)}
    </DocsPropertiesSnippetCard>,
  )}\n`;
}

function htmlInline(value: string) {
  return value ? <span dangerouslySetInnerHTML={{ __html: value }} /> : null;
}

function htmlBlock(value: string) {
  return <div dangerouslySetInnerHTML={{ __html: value }} />;
}
