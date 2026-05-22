import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DocsSnippetKind = "code" | "dependency";

export function DocsSnippetCopyButton({
  children,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn("docs-snippet-copy docs-code-copy", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function DocsSnippetLanguageButton({
  active,
  children,
  className,
  ...props
}: ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="xs"
      className={cn(
        "docs-code-language language-option",
        active ? "selected font-semibold text-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function DocsSnippetStaticLanguage({
  children,
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="button"
      data-variant="ghost"
      data-size="xs"
      className={cn(
        "docs-code-language docs-code-language-static inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function SnippetKindIcon({ kind }: { kind: DocsSnippetKind | "properties" }) {
  if (kind === "dependency") {
    return (
      <span className="docs-code-language-icon docs-code-language-icon-gradle docs-code-language-icon-fill docs-snippet-kind-icon size-3.5" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
          <path d="M22.695 4.297a3.807 3.807 0 0 0-5.29-.09.368.368 0 0 0 0 .533l.46.47a.363.363 0 0 0 .474.032 2.182 2.182 0 0 1 2.86 3.291c-3.023 3.02-7.056-5.447-16.211-1.083a1.24 1.24 0 0 0-.534 1.745l1.571 2.713a1.238 1.238 0 0 0 1.681.461l.037-.02-.029.02.688-.384a16.083 16.083 0 0 0 2.193-1.635.384.384 0 0 1 .499-.016.357.357 0 0 1 .016.534 16.435 16.435 0 0 1-2.316 1.741H8.77l-.696.39a1.958 1.958 0 0 1-.963.25 1.987 1.987 0 0 1-1.726-.989L3.9 9.696C1.06 11.72-.686 15.603.26 20.522a.363.363 0 0 0 .354.296h1.675a.363.363 0 0 0 .37-.331 2.478 2.478 0 0 1 4.915 0 .36.36 0 0 0 .357.317h1.638a.363.363 0 0 0 .357-.317 2.478 2.478 0 0 1 4.914 0 .363.363 0 0 0 .358.317h1.627a.363.363 0 0 0 .363-.357c.037-2.294.656-4.93 2.42-6.25 6.108-4.57 4.502-8.486 3.088-9.9zm-6.229 6.901l-1.165-.584a.73.73 0 1 1 1.165.587z" />
        </svg>
      </span>
    );
  }

  if (kind === "properties") {
    return (
      <span className="docs-code-language-icon docs-code-language-icon-properties docs-snippet-kind-icon size-3.5" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M4.5 7h7" />
          <path d="M15.5 7h4" />
          <path d="M4.5 12h4" />
          <path d="M12.5 12h7" />
          <path d="M4.5 17h9" />
          <path d="M17.5 17h2" />
          <circle cx="13.5" cy="7" r="2" />
          <circle cx="10.5" cy="12" r="2" />
          <circle cx="15.5" cy="17" r="2" />
        </svg>
      </span>
    );
  }

  return (
    <span className="docs-code-language-icon docs-code-language-icon-text docs-snippet-kind-icon size-3.5" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    </span>
  );
}

type DocsSnippetCardProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  controls?: ReactNode;
  description?: ReactNode;
  id?: string;
  kind?: DocsSnippetKind;
  title?: ReactNode;
};

export function DocsSnippetCard({
  action,
  children,
  className,
  controls,
  description,
  id,
  kind = "code",
  title
}: DocsSnippetCardProps) {
  const hasHeaderText = Boolean(title || description);

  return (
    <Card
      id={id}
      className={cn(
        "docs-snippet-template docs-code-block gap-0 overflow-hidden py-0",
        kind === "dependency" ? "docs-properties-template docs-dependency-template" : "docs-code-snippet-template",
        className
      )}
      data-snippet-kind={kind}
    >
      <CardHeader
        className={
          hasHeaderText
            ? "gap-1 border-b px-4 py-1.5 [.border-b]:pb-1.5"
            : "docs-code-toolbar docs-snippet-card-header !flex min-h-8 items-center justify-between gap-2.5 px-2.5 py-1"
        }
      >
        {title ? (
          <CardTitle className="docs-snippet-heading flex items-center gap-2 text-xs">
            <SnippetKindIcon kind={kind} />
            <span>{title}</span>
          </CardTitle>
        ) : null}
        {description ? <CardDescription className="docs-snippet-description text-xs leading-5">{description}</CardDescription> : null}
        {controls ? (
          <div className="docs-snippet-actions flex flex-wrap items-center justify-start justify-self-start gap-2">
            {controls}
          </div>
        ) : null}
        {action ? <CardAction className={hasHeaderText ? undefined : "ml-auto self-center justify-self-auto"}>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="docs-snippet-panels overflow-hidden px-0">{children}</CardContent>
    </Card>
  );
}

type DocsPropertiesSnippetCardProps = {
  anchorId: string;
  children: ReactNode;
  countLabel: ReactNode;
  id: string;
  eyebrow: ReactNode;
  title: ReactNode;
};

export function DocsPropertiesSnippetCard({
  anchorId,
  children,
  countLabel,
  id,
  eyebrow,
  title
}: DocsPropertiesSnippetCardProps) {
  return (
    <Card id={id} className="docs-properties-template gap-0 overflow-hidden py-0">
      <a className="docs-properties-anchor" id={anchorId} href={`#${anchorId}`} aria-hidden="true" />
      <CardHeader className="gap-1 border-b px-4 py-1.5 [.border-b]:pb-1.5">
        <CardTitle className="docs-properties-heading flex items-center gap-2 text-xs">
          <SnippetKindIcon kind="properties" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="docs-properties-description text-xs leading-5">{eyebrow}</CardDescription>
        <CardAction>
          <Badge variant="secondary" className="docs-properties-count">
            {countLabel}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="docs-properties-scroll px-0">{children}</CardContent>
    </Card>
  );
}
