"use client";

import { useEffect, useRef, useState } from "react";

import {
  CopyIcon,
  DocsSnippetCard,
  DocsSnippetCopyButton,
  DocsSnippetLanguageButton,
  DocsSnippetStaticLanguage
} from "@/components/web/docs-snippet-card";
import { docsSnippetStyles } from "@/components/web/docs-snippet-styles";
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

const shikiThemes = {
  light: "github-light-default",
  dark: "github-dark-default"
} as const;

const shikiLanguageAliases: Record<string, string> = {
  bash: "shellscript",
  console: "shellscript",
  gradle: "kotlin",
  maven: "xml",
  pom: "xml",
  sh: "shellscript",
  shell: "shellscript",
  text: "text",
  txt: "text",
  zsh: "shellscript"
};

const highlightedCodeCache = new Map<string, Promise<string>>();

function LanguageIcon({ language }: { language: CodeSnippetLanguage }) {
  const icon = languageIcons[language] || languageIcons.text;

  return (
    <img
      src={withBasePath(icon || "/micronaut-assets/icons/languages/text.svg")}
      alt=""
      aria-hidden="true"
      className={docsSnippetStyles.languageImageIcon}
    />
  );
}

function shikiLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  return shikiLanguageAliases[normalized] || normalized || "text";
}

function extractCodeHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return (template.content.querySelector("code")?.innerHTML || "")
    .replace(/&#x3C;(\d+)>/g, '<i class="conum" data-value="$1"></i>');
}

async function highlightedCodeHtml(code: string, language: string) {
  const cacheKey = `${language}\0${code}`;
  const cached = highlightedCodeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const highlighted = import("shiki")
    .then(({ codeToHtml }) => codeToHtml(code, {
      lang: shikiLanguage(language),
      themes: shikiThemes
    }))
    .then(extractCodeHtml);
  highlightedCodeCache.set(cacheKey, highlighted);
  return highlighted;
}

export function ShikiCodeBlock({ code, language }: { code: string; language: string }) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setHighlightedHtml(null);
    highlightedCodeHtml(code, language)
      .then((html) => {
        if (active) {
          setHighlightedHtml(html);
        }
      })
      .catch(() => {
        if (active) {
          setHighlightedHtml(null);
        }
      });

    return () => {
      active = false;
    };
  }, [code, language]);

  return (
    <pre className={docsSnippetStyles.codePre} tabIndex={0}>
      {highlightedHtml ? (
        <code
          className={`language-${language} ${docsSnippetStyles.codeElement}`}
          data-lang={language}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <code className={`language-${language} ${docsSnippetStyles.codeElement}`} data-lang={language}>
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
                  <LanguageIcon language={variant.language} />
                  <span className={docsSnippetStyles.languageText}>{variant.label}</span>
                </DocsSnippetLanguageButton>
              );
            })}
          </div>
        ) : (
          <DocsSnippetStaticLanguage aria-label={`${activeVariant.label} snippet`}>
            <LanguageIcon language={activeVariant.language} />
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
            <ShikiCodeBlock code={variant.code} language={variant.language} />
          </div>
        );
      })}
    </DocsSnippetCard>
  );
}
