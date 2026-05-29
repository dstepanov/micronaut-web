import { renderToStaticMarkup } from "react-dom/server";

import { ShikiCodeBlock } from "./docs-code-snippet";
import {
  CopyIcon,
  DocsPropertiesSnippetCard,
  DocsSnippetCard,
  DocsSnippetCodeLanguageIcon,
  DocsSnippetCopyButton,
  DocsSnippetLanguageButton,
} from "./docs-snippet-card";

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

type GeneratedSnippetCardInput = {
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

export function renderGeneratedSnippetCard(input: GeneratedSnippetCardInput) {
  return `${renderToStaticMarkup(<GeneratedSnippetCard {...input} />)}\n`;
}

export function renderGeneratedPropertiesCard(
  input: GeneratedPropertiesCardInput,
) {
  return `${renderToStaticMarkup(<GeneratedPropertiesCard {...input} />)}\n`;
}

function GeneratedSnippetCard({
  copyLabel,
  descriptionHtml = "",
  footerHtml = "",
  id,
  kind,
  optionsLabel,
  titleHtml = "",
  variants,
}: GeneratedSnippetCardInput) {
  const controls = (
    <div
      className="docs-snippet-tabs docs-code-tabs docs-code-tabs-multi flex flex-wrap items-center gap-1"
      role="tablist"
      aria-label={optionsLabel}
    >
      {variants.map((variant, index) => (
        <DocsSnippetLanguageButton
          key={`${variant.language}-${index}`}
          active={variant.active}
          id={variant.tabId}
          type="button"
          role="tab"
          aria-controls={variant.panelId}
          aria-selected={variant.active}
          data-lang={variant.language}
          tabIndex={variant.active ? 0 : -1}
        >
          <DocsSnippetCodeLanguageIcon language={variant.language} />
          <span className="docs-code-language-text inline-flex items-center leading-none">
            {variant.label}
          </span>
        </DocsSnippetLanguageButton>
      ))}
    </div>
  );
  const action = (
    <DocsSnippetCopyButton data-copy-active-snippet="">
      <CopyIcon />
      <span className="sr-only">{copyLabel}</span>
    </DocsSnippetCopyButton>
  );
  const card = (
    <DocsSnippetCard
      id={id}
      kind={kind}
      title={kind === "dependency" ? htmlInline(titleHtml) : undefined}
      description={
        kind === "dependency" ? htmlInline(descriptionHtml) : undefined
      }
      controls={controls}
      action={action}
      footer={footerHtml ? htmlBlock(footerHtml) : undefined}
    >
      {variants.map((variant) => (
        <div
          key={variant.panelId}
          id={variant.panelId}
          role="tabpanel"
          aria-labelledby={variant.tabId}
          aria-hidden={!variant.active}
          hidden={!variant.active}
          className="docs-code-content docs-snippet-card-content bg-code text-code-foreground"
        >
          <ShikiCodeBlock
            code={variant.source}
            highlightedHtml={variant.highlightedHtml}
            language={variant.language}
          />
        </div>
      ))}
    </DocsSnippetCard>
  );

  if (kind === "dependency") {
    return card;
  }
  return (
    <>
      <GeneratedSnippetIntro
        titleHtml={titleHtml}
        descriptionHtml={descriptionHtml}
      />
      {card}
    </>
  );
}

function GeneratedSnippetIntro({
  descriptionHtml,
  titleHtml,
}: {
  descriptionHtml: string;
  titleHtml: string;
}) {
  if (!titleHtml && !descriptionHtml) {
    return null;
  }
  if (descriptionHtml) {
    return (
      <div className="docs-snippet-external-header my-0 mt-[1.35rem] mb-[0.45rem]">
        {titleHtml ? (
          <div
            className="docs-snippet-external-header-title my-0 text-[0.95rem] leading-[1.45] font-bold text-foreground [overflow-wrap:anywhere] [&_code]:whitespace-normal"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
        ) : null}
        <div
          className="docs-snippet-external-header-description mt-1 text-sm leading-6 text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
    );
  }
  return (
    <div
      className="title docs-snippet-external-title my-0 mt-[1.35rem] mb-[0.45rem] text-[0.95rem] leading-[1.45] font-bold text-foreground [overflow-wrap:anywhere] [&_code]:whitespace-normal"
      dangerouslySetInnerHTML={{ __html: titleHtml }}
    />
  );
}

function GeneratedPropertiesCard({
  anchorId,
  countLabel,
  eyebrow,
  id,
  tableHtml,
  title,
}: GeneratedPropertiesCardInput) {
  return (
    <DocsPropertiesSnippetCard
      id={id}
      anchorId={anchorId}
      title={title}
      eyebrow={eyebrow}
      countLabel={countLabel}
    >
      {htmlBlock(tableHtml)}
    </DocsPropertiesSnippetCard>
  );
}

function htmlInline(value: string) {
  return value ? <span dangerouslySetInnerHTML={{ __html: value }} /> : null;
}

function htmlBlock(value: string) {
  return <div dangerouslySetInnerHTML={{ __html: value }} />;
}
