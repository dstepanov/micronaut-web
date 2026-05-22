"use client";

import { useRef, useState } from "react";

import {
  CopyIcon,
  DocsSnippetCard,
  DocsSnippetCopyButton,
  DocsSnippetLanguageButton,
  DocsSnippetStaticLanguage
} from "@/components/web/docs-snippet-card";
import { withBasePath } from "@/lib/base-path";

export type CodeSnippetLanguage = "java" | "kotlin" | "groovy" | "bash" | "text";

export type CodeSnippetVariant = {
  language: CodeSnippetLanguage;
  label: string;
  fileName: string;
  code: string;
};

export type CodeSnippetExample = {
  id: string;
  label: string;
  title: string;
  description: string;
  variants: CodeSnippetVariant[];
};

const languageIcons: Partial<Record<CodeSnippetLanguage, string>> = {
  bash: "/micronaut-assets/icons/brands/gnubash.svg",
  groovy: "/micronaut-assets/icons/brands/apachegroovy.svg",
  java: "/micronaut-assets/icons/languages/java.svg",
  kotlin: "/micronaut-assets/icons/brands/kotlin.svg",
  text: "/micronaut-assets/icons/languages/text.svg"
};

const highlightedTerms = new Set([
  "class",
  "interface",
  "import",
  "return",
  "fun",
  "void",
  "def",
  "expect",
  "lateinit",
  "var",
  "val",
  "mn"
]);

const typeTerms = new Set([
  "Collections",
  "HelloClient",
  "HelloController",
  "HelloControllerSpec",
  "HelloControllerTest",
  "Map",
  "Specification",
  "String"
]);

function LanguageIcon({ language }: { language: CodeSnippetLanguage }) {
  const icon = languageIcons[language] || languageIcons.text;

  return (
    <img
      src={withBasePath(icon || "/micronaut-assets/icons/languages/text.svg")}
      alt=""
      aria-hidden="true"
      className="docs-code-language-icon size-3.5 dark:invert"
    />
  );
}

function HighlightedCode({ code }: { code: string }) {
  const tokenPattern = /(@\w+|".*?"|'.*?'|--[\w-]+|\b[\w.]+\b)/g;

  return (
    <>
      {code.split("\n").map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} className="line block min-h-[1.5em]">
          {line.split(tokenPattern).map((part, partIndex) => {
            if (part.startsWith("@") || part.startsWith("--")) {
              return (
                <span key={partIndex} className="text-primary">
                  {part}
                </span>
              );
            }
            if (part.startsWith("\"") || part.startsWith("'")) {
              return (
                <span key={partIndex} className="text-amber-700 dark:text-amber-300">
                  {part}
                </span>
              );
            }
            if (highlightedTerms.has(part)) {
              return (
                <span key={partIndex} className="text-sky-700 dark:text-sky-300">
                  {part}
                </span>
              );
            }
            if (typeTerms.has(part) || /^[A-Z][\w.]*$/.test(part)) {
              return (
                <span key={partIndex} className="text-violet-700 dark:text-violet-300">
                  {part}
                </span>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </span>
      ))}
    </>
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
          <div className="docs-snippet-tabs docs-code-tabs docs-code-tabs-multi flex flex-wrap items-center gap-1" role="tablist" aria-label={`${example.label} language`}>
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
                  <LanguageIcon language={variant.language} />
                  <span className="docs-code-language-text">{variant.label}</span>
                </DocsSnippetLanguageButton>
              );
            })}
          </div>
        ) : (
          <DocsSnippetStaticLanguage aria-label={`${activeVariant.label} snippet`}>
            <LanguageIcon language={activeVariant.language} />
            <span className="docs-code-language-text">{activeVariant.label}</span>
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
            className="docs-code-content docs-snippet-card-content"
          >
            <pre className="shiki shiki-themes github-light-default github-dark-default overflow-x-auto px-6 py-4 text-sm leading-6" tabIndex={0}>
              <code className={`language-${variant.language} shiki-code grid min-w-max font-mono text-[0.85rem] leading-6`} data-lang={variant.language}>
                <HighlightedCode code={variant.code} />
              </code>
            </pre>
          </div>
        );
      })}
    </DocsSnippetCard>
  );
}
