"use client";

import { useEffect, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_PROGRAMMING_LANGUAGE,
  PROGRAMMING_LANGUAGE_EVENT,
  PROGRAMMING_LANGUAGE_LABELS,
  PROGRAMMING_LANGUAGES,
  isProgrammingLanguage,
  readProgrammingLanguagePreference,
  saveProgrammingLanguagePreference,
  type ProgrammingLanguage,
} from "@/lib/programming-language-preference";
import { cn } from "@/lib/utils";

type ProgrammingLanguageSelectorProps = {
  className?: string;
  initialLanguage?: ProgrammingLanguage;
};

export function ProgrammingLanguageSelector({
  className,
  initialLanguage = DEFAULT_PROGRAMMING_LANGUAGE,
}: ProgrammingLanguageSelectorProps) {
  const [language, setLanguage] =
    useState<ProgrammingLanguage>(initialLanguage);

  useEffect(() => {
    const preferredLanguage = readProgrammingLanguagePreference();
    setLanguage(preferredLanguage);

    function onLanguageChange(event: Event) {
      const detail = (event as CustomEvent<{ language?: ProgrammingLanguage }>)
        .detail;
      if (isProgrammingLanguage(detail?.language)) {
        setLanguage(detail.language);
      }
    }

    window.addEventListener(PROGRAMMING_LANGUAGE_EVENT, onLanguageChange);
    return () => {
      window.removeEventListener(PROGRAMMING_LANGUAGE_EVENT, onLanguageChange);
    };
  }, []);

  function selectLanguage(next: ProgrammingLanguage) {
    setLanguage(next);
    saveProgrammingLanguagePreference(next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Programming language preference"
          title="Select default programming language"
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium shadow-xs transition-colors",
            "focus-visible:outline-none",
            "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            className,
          )}
        >
          <span className="sr-only">Code language:</span>
          <span aria-hidden="true">
            {PROGRAMMING_LANGUAGE_LABELS[language]}
          </span>
          <ChevronDownIcon className="size-3" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PROGRAMMING_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => selectLanguage(lang)}
            aria-current={lang === language ? "true" : undefined}
          >
            {PROGRAMMING_LANGUAGE_LABELS[lang]}
            {lang === language ? (
              <CheckIcon className="ml-auto size-4" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
