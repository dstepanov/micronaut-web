"use client";

import { type ReactNode, useRef, useState } from "react";

import {
  CopyIcon,
  DocsSnippetCard,
  DocsSnippetCodeLanguageIcon,
  DocsSnippetCopyButton,
  DocsSnippetLanguageButton,
  DocsSnippetStaticLanguage
} from "@/components/web/docs-snippet-card";
import { docsSnippetStyles } from "@/components/web/docs-snippet-styles";

export type CodeSnippetLanguage = "java" | "kotlin" | "groovy" | "bash" | "gradle" | "maven" | "text";

export type CodeSnippetVariant = {
  language: CodeSnippetLanguage;
  label: string;
  fileName: string;
  code: string;
  highlightedHtml?: string;
  highlighterLanguage?: string;
};

export type CodeSnippetExample = {
  id: string;
  label: string;
  title: string;
  description: string;
  callouts?: ReactNode[];
  variants: CodeSnippetVariant[];
};

export function ShikiCodeBlock({
  code,
  highlightedHtml,
  language
}: {
  code: string;
  highlightedHtml?: string;
  language: string;
}) {
  const normalizedLanguage = language.trim().toLowerCase() || "text";

  return (
    <pre className={docsSnippetStyles.codePre} tabIndex={0}>
      {highlightedHtml ? (
        <code
          className={`language-${normalizedLanguage} ${docsSnippetStyles.codeElement}`}
          data-lang={normalizedLanguage}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <code className={`language-${normalizedLanguage} ${docsSnippetStyles.codeElement}`} data-lang={normalizedLanguage}>
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
  onLanguageChange?: (language: CodeSnippetLanguage) => void;
};

export function DocsCodeSnippet({ example, activeLanguage, className, onLanguageChange }: DocsCodeSnippetProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [internalActiveLanguage, setInternalActiveLanguage] = useState<CodeSnippetLanguage>(example.variants[0]?.language || "text");
  const [copied, setCopied] = useState(false);
  const currentLanguage = activeLanguage || internalActiveLanguage;
  const activeIndex = Math.max(
    0,
    example.variants.findIndex((variant) => variant.language === currentLanguage)
  );
  const activeVariant = example.variants[activeIndex] || example.variants[0];
  const hasLanguageOptions = example.variants.length > 1;

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

  return (
    <DocsSnippetCard
      className={className}
      controls={
        hasLanguageOptions ? (
          <div className={docsSnippetStyles.tabs} role="tablist" aria-label={`${example.label} language`}>
            {example.variants.map((variant, index) => {
              const active = index === activeIndex;
              const tabId = `${example.id}-${variant.language}-tab`;
              const panelId = `${example.id}-${variant.language}-panel`;
              return (
                <DocsSnippetLanguageButton
                  key={variant.language}
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
                  onClick={() => activate(index)}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                      return;
                    }
                    event.preventDefault();
                    const offset = event.key === "ArrowRight" ? 1 : -1;
                    const nextIndex = (index + offset + example.variants.length) % example.variants.length;
                    activate(nextIndex, true);
                  }}
                >
                  <DocsSnippetCodeLanguageIcon language={variant.language} />
                  <span className={docsSnippetStyles.languageText}>{variant.label}</span>
                </DocsSnippetLanguageButton>
              );
            })}
          </div>
        ) : (
          <DocsSnippetStaticLanguage aria-label={`${activeVariant.label} snippet`}>
            <DocsSnippetCodeLanguageIcon language={activeVariant.language} />
            <span className={docsSnippetStyles.languageText}>{activeVariant.label}</span>
          </DocsSnippetStaticLanguage>
        )
      }
      action={
        <DocsSnippetCopyButton
          aria-label={copied ? "Copied" : `Copy ${activeVariant.fileName}`}
          title={copied ? "Copied" : `Copy ${activeVariant.fileName}`}
          onClick={copyActiveSnippet}
        >
          <CopyIcon />
          <span className="sr-only" aria-live="polite">
            {copied ? "Copied" : "Copy code"}
          </span>
        </DocsSnippetCopyButton>
      }
      footer={example.callouts?.length ? (
        <ol>
          {example.callouts.map((callout, index) => (
            <li key={index}>
              <p>{callout}</p>
            </li>
          ))}
        </ol>
      ) : undefined}
    >
      {example.variants.map((variant, index) => {
        const active = index === activeIndex;
        return (
          <div
            key={variant.language}
            id={`${example.id}-${variant.language}-panel`}
            role="tabpanel"
            aria-labelledby={`${example.id}-${variant.language}-tab`}
            aria-hidden={!active}
            hidden={!active}
            className={docsSnippetStyles.panel}
          >
            <ShikiCodeBlock code={variant.code} highlightedHtml={variant.highlightedHtml} language={variant.language} />
          </div>
        );
      })}
    </DocsSnippetCard>
  );
}
