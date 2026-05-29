"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
};

export function CodeBlock({
  code,
  language = "text",
  filename,
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const plainLines = useMemo(() => code.split("\n"), [code]);

  return (
    <div
      className={cn(
        "h-full overflow-auto bg-code font-mono text-[13px] leading-6 text-code-foreground",
        className,
      )}
    >
      {filename && <div className="sr-only">Previewing {filename}</div>}
      <pre className="min-w-max py-2" tabIndex={0}>
        <code className={`language-${language}`} data-lang={language}>
          {plainLines.map((line, index) => (
            <span
              key={`${filename ?? language}-${index}`}
              className={cn(
                "grid min-h-6 hover:bg-muted/40",
                showLineNumbers
                  ? "grid-cols-[3.5rem_max-content]"
                  : "grid-cols-[max-content]",
              )}
            >
              {showLineNumbers && (
                <span className="sticky left-0 z-10 select-none border-r bg-background/95 pr-3 text-right text-muted-foreground">
                  {index + 1}
                </span>
              )}
              <span className="whitespace-pre px-4">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
