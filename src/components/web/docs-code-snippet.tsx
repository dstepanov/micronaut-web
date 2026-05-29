"use client";

import { type ReactNode, useRef, useState } from "react";

import {
  CopyIcon,
  DocsSnippetCard,
  DocsSnippetCodeLanguageIcon,
  DocsSnippetCopyButton,
  type DocsSnippetKind,
  DocsSnippetLanguageButton,
  DocsSnippetStaticLanguage,
} from "@/components/web/docs-snippet-card";

export type CodeSnippetLanguage =
  | "java"
  | "kotlin"
  | "groovy"
  | "bash"
  | "gradle"
  | "maven"
  | "text"
  | (string & {});

export type CodeSnippetVariant = {
  language: CodeSnippetLanguage;
  label: string;
  code: string;
  active?: boolean;
  fileName?: string;
  highlightedHtml?: string;
  highlighterLanguage?: string;
  panelId?: string;
  tabId?: string;
};

export type CodeSnippetExample = {
  id: string;
  label: string;
  title?: string;
  description?: string;
  callouts?: ReactNode[];
  variants: CodeSnippetVariant[];
};

export function ShikiCodeBlock({
  code,
  highlightedHtml,
  language,
}: {
  code: string;
  highlightedHtml?: string;
  language: string;
}) {
  const normalizedLanguage = language.trim().toLowerCase() || "text";

  return (
    <pre
      className="shiki shiki-themes github-light-default github-dark-default !m-0 !max-w-full !overflow-x-auto !rounded-none !border-0 !bg-code !px-6 !py-4 text-sm !leading-6 !text-code-foreground"
      tabIndex={0}
    >
      {highlightedHtml ? (
        <code
          className={`language-${normalizedLanguage} shiki-code grid min-w-max font-mono !text-[0.85rem] !leading-6 [&_.line]:min-h-[1.5rem] dark:[&_span[style]]:![color:var(--shiki-dark,var(--shiki-light,currentColor))] dark:[&_span[style]]:![font-style:var(--shiki-dark-font-style,var(--shiki-light-font-style,inherit))] dark:[&_span[style]]:![font-weight:var(--shiki-dark-font-weight,var(--shiki-light-font-weight,inherit))] dark:[&_span[style]]:![text-decoration:var(--shiki-dark-text-decoration,var(--shiki-light-text-decoration,inherit))] [&_.conum]:ml-1 [&_.conum]:inline-flex [&_.conum]:h-[1.05rem] [&_.conum]:w-[1.05rem] [&_.conum]:items-center [&_.conum]:justify-center [&_.conum]:rounded-full [&_.conum]:[border:1px_solid_color-mix(in_oklab,var(--code-foreground)_82%,var(--code))] [&_.conum]:bg-code-foreground [&_.conum]:![color:var(--code)] [&_.conum]:[font-family:var(--shell-font)] [&_.conum]:text-[0.68rem] [&_.conum]:leading-none [&_.conum]:font-bold [&_.conum]:not-italic [&_.conum]:align-[0.08em] [&_.conum::before]:content-[attr(data-value)]`}
          data-lang={normalizedLanguage}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <code
          className={`language-${normalizedLanguage} shiki-code grid min-w-max font-mono !text-[0.85rem] !leading-6 [&_.line]:min-h-[1.5rem] dark:[&_span[style]]:![color:var(--shiki-dark,var(--shiki-light,currentColor))] dark:[&_span[style]]:![font-style:var(--shiki-dark-font-style,var(--shiki-light-font-style,inherit))] dark:[&_span[style]]:![font-weight:var(--shiki-dark-font-weight,var(--shiki-light-font-weight,inherit))] dark:[&_span[style]]:![text-decoration:var(--shiki-dark-text-decoration,var(--shiki-light-text-decoration,inherit))] [&_.conum]:ml-1 [&_.conum]:inline-flex [&_.conum]:h-[1.05rem] [&_.conum]:w-[1.05rem] [&_.conum]:items-center [&_.conum]:justify-center [&_.conum]:rounded-full [&_.conum]:[border:1px_solid_color-mix(in_oklab,var(--code-foreground)_82%,var(--code))] [&_.conum]:bg-code-foreground [&_.conum]:![color:var(--code)] [&_.conum]:[font-family:var(--shell-font)] [&_.conum]:text-[0.68rem] [&_.conum]:leading-none [&_.conum]:font-bold [&_.conum]:not-italic [&_.conum]:align-[0.08em] [&_.conum::before]:content-[attr(data-value)]`}
          data-lang={normalizedLanguage}
        >
          {code}
        </code>
      )}
    </pre>
  );
}

type DocsCodeSnippetProps = {
  example: CodeSnippetExample;
  activeLanguage?: CodeSnippetLanguage;
  className?: string;
  copyLabel?: string;
  description?: ReactNode;
  externalHeader?: boolean;
  footer?: ReactNode;
  kind?: DocsSnippetKind;
  onLanguageChange?: (language: CodeSnippetLanguage) => void;
  optionsLabel?: string;
  showSingleVariantAsTabs?: boolean;
  staticEnhancement?: boolean;
  title?: ReactNode;
};

export function DocsCodeSnippet({
  example,
  activeLanguage,
  className,
  copyLabel = "Copy code",
  description,
  externalHeader = false,
  footer,
  kind = "code",
  onLanguageChange,
  optionsLabel,
  showSingleVariantAsTabs = false,
  staticEnhancement = false,
  title,
}: DocsCodeSnippetProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const defaultActiveIndex = Math.max(
    0,
    example.variants.findIndex((variant) => variant.active),
  );
  const [internalActiveLanguage, setInternalActiveLanguage] =
    useState<CodeSnippetLanguage>(
      example.variants[defaultActiveIndex]?.language ||
        example.variants[0]?.language ||
        "text",
    );
  const [copied, setCopied] = useState(false);
  const currentLanguage = activeLanguage || internalActiveLanguage;
  const activeIndex = staticEnhancement
    ? defaultActiveIndex
    : Math.max(
        0,
        example.variants.findIndex(
          (variant) => variant.language === currentLanguage,
        ),
      );
  const activeVariant = example.variants[activeIndex] || example.variants[0];
  const hasLanguageOptions =
    showSingleVariantAsTabs || example.variants.length > 1;
  const renderedFooter =
    footer ||
    (example.callouts?.length ? (
      <ol>
        {example.callouts.map((callout, index) => (
          <li key={index}>
            <p>{callout}</p>
          </li>
        ))}
      </ol>
    ) : undefined);

  function activate(index: number, focus = false) {
    const variant = example.variants[index];
    if (!variant) {
      return;
    }
    if (!activeLanguage) {
      setInternalActiveLanguage(variant.language);
    }
    onLanguageChange?.(variant.language);
    setCopied(false);
    if (focus) {
      window.requestAnimationFrame(() => tabRefs.current[index]?.focus());
    }
  }

  async function copyActiveSnippet() {
    if (!activeVariant) {
      return;
    }
    try {
      await navigator.clipboard.writeText(activeVariant.code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = activeVariant.code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!activeVariant) {
    return null;
  }

  const card = (
    <DocsSnippetCard
      id={example.id}
      className={className}
      kind={kind}
      title={externalHeader ? undefined : title}
      description={externalHeader ? undefined : description}
      controls={
        hasLanguageOptions ? (
          <div
            className="docs-snippet-tabs docs-code-tabs docs-code-tabs-multi flex flex-wrap items-center gap-1"
            role="tablist"
            aria-label={optionsLabel || `${example.label} language`}
          >
            {example.variants.map((variant, index) => {
              const active = index === activeIndex;
              const tabId = snippetTabId(example.id, variant);
              const panelId = snippetPanelId(example.id, variant);
              return (
                <DocsSnippetLanguageButton
                  key={`${variant.language}-${index}`}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  active={active}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-controls={panelId}
                  aria-selected={active}
                  data-lang={variant.language}
                  tabIndex={active ? 0 : -1}
                  onClick={
                    staticEnhancement ? undefined : () => activate(index)
                  }
                  onKeyDown={
                    staticEnhancement
                      ? undefined
                      : (event) => {
                          if (
                            event.key !== "ArrowRight" &&
                            event.key !== "ArrowLeft"
                          ) {
                            return;
                          }
                          event.preventDefault();
                          const offset = event.key === "ArrowRight" ? 1 : -1;
                          const nextIndex =
                            (index + offset + example.variants.length) %
                            example.variants.length;
                          activate(nextIndex, true);
                        }
                  }
                >
                  <DocsSnippetCodeLanguageIcon language={variant.language} />
                  <span className="docs-code-language-text inline-flex items-center leading-none">
                    {variant.label}
                  </span>
                </DocsSnippetLanguageButton>
              );
            })}
          </div>
        ) : (
          <DocsSnippetStaticLanguage
            aria-label={`${activeVariant.label} snippet`}
          >
            <DocsSnippetCodeLanguageIcon language={activeVariant.language} />
            <span className="docs-code-language-text inline-flex items-center leading-none">
              {activeVariant.label}
            </span>
          </DocsSnippetStaticLanguage>
        )
      }
      action={
        <DocsSnippetCopyButton
          aria-label={
            copied ? "Copied" : `Copy ${activeVariant.fileName || copyLabel}`
          }
          title={
            copied ? "Copied" : `Copy ${activeVariant.fileName || copyLabel}`
          }
          onClick={staticEnhancement ? undefined : copyActiveSnippet}
          {...(staticEnhancement ? { "data-copy-active-snippet": "" } : {})}
        >
          <CopyIcon />
          <span className="sr-only" aria-live="polite">
            {copied ? "Copied" : copyLabel}
          </span>
        </DocsSnippetCopyButton>
      }
      footer={renderedFooter}
    >
      {example.variants.map((variant, index) => {
        const active = index === activeIndex;
        const tabId = snippetTabId(example.id, variant);
        const panelId = snippetPanelId(example.id, variant);
        return (
          <div
            key={`${variant.language}-${index}`}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            aria-hidden={!active}
            hidden={!active}
            className="docs-code-content docs-snippet-card-content bg-code text-code-foreground"
          >
            <ShikiCodeBlock
              code={variant.code}
              highlightedHtml={variant.highlightedHtml}
              language={variant.language}
            />
          </div>
        );
      })}
    </DocsSnippetCard>
  );

  if (externalHeader) {
    return (
      <>
        {renderSnippetExternalHeader(title, description)}
        {card}
      </>
    );
  }

  return card;
}

function renderSnippetExternalHeader(
  title?: ReactNode,
  description?: ReactNode,
) {
  if (!title && !description) {
    return null;
  }
  if (description) {
    return (
      <div className="docs-snippet-external-header my-0 mt-[1.35rem] mb-[0.45rem]">
        {title ? (
          <div className="docs-snippet-external-header-title my-0 text-[0.95rem] leading-[1.45] font-bold text-foreground [overflow-wrap:anywhere] [&_code]:whitespace-normal">
            {title}
          </div>
        ) : null}
        <div className="docs-snippet-external-header-description mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </div>
      </div>
    );
  }
  return (
    <div className="title docs-snippet-external-title my-0 mt-[1.35rem] mb-[0.45rem] text-[0.95rem] leading-[1.45] font-bold text-foreground [overflow-wrap:anywhere] [&_code]:whitespace-normal">
      {title}
    </div>
  );
}

function snippetTabId(exampleId: string, variant: CodeSnippetVariant) {
  return variant.tabId || `${exampleId}-${variant.language}-tab`;
}

function snippetPanelId(exampleId: string, variant: CodeSnippetVariant) {
  return variant.panelId || `${exampleId}-${variant.language}-panel`;
}
