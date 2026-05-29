import type { ComponentProps, ReactNode } from "react";
import { Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { docsSnippetCodeLanguageIcon } from "@/components/web/docs-snippet-icons";
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
      className={cn(
        "docs-snippet-copy docs-code-copy text-code-muted hover:bg-code-border hover:text-code-foreground dark:hover:bg-code-border",
        className,
      )}
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
        "docs-code-language language-option inline-flex h-6 items-center gap-1 align-middle leading-none text-code-muted aria-selected:font-semibold aria-selected:text-code-foreground",
        active
          ? "selected font-semibold text-code-foreground"
          : "text-code-muted",
        className,
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
        "docs-code-language docs-code-language-static inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-md px-2 text-xs leading-none font-medium whitespace-nowrap text-code-muted",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function CopyIcon() {
  return <Copy aria-hidden="true" focusable="false" />;
}

export function DocsSnippetCodeLanguageIcon({
  className,
  language,
}: {
  className?: string;
  language: string;
}) {
  const { icon, key } = docsSnippetCodeLanguageIcon(language);

  return (
    <span
      className={cn(
        "docs-code-language-icon inline-flex size-3.5 shrink-0 items-center justify-center self-center leading-none [&_svg]:block [&_svg]:size-full",
        `docs-code-language-icon-${key}`,
        icon.fill ? "docs-code-language-icon-fill" : undefined,
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox={icon.viewBox}
        fill={icon.fill ? "currentColor" : "none"}
        stroke={icon.fill ? undefined : "currentColor"}
        strokeWidth={icon.fill ? undefined : 2}
        strokeLinecap={icon.fill ? undefined : "round"}
        strokeLinejoin={icon.fill ? undefined : "round"}
        focusable="false"
        dangerouslySetInnerHTML={{ __html: icon.body }}
      />
    </span>
  );
}

export function SnippetKindIcon({
  kind,
}: {
  kind: DocsSnippetKind | "properties";
}) {
  const language =
    kind === "properties"
      ? "properties"
      : kind === "dependency"
        ? "gradle"
        : "text";
  return (
    <DocsSnippetCodeLanguageIcon
      language={language}
      className="docs-snippet-kind-icon"
    />
  );
}

type DocsSnippetCardProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  controls?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
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
  footer,
  id,
  kind = "code",
  title,
}: DocsSnippetCardProps) {
  const externalHeader = kind === "dependency" && Boolean(title || description);
  const hasHeaderText = Boolean(title || description) && !externalHeader;

  return (
    <>
      {externalHeader ? (
        <div className="docs-snippet-external-header my-0 mt-[1.35rem] mb-[0.45rem]">
          {title ? (
            <div className="docs-snippet-external-header-title my-0 text-[0.95rem] leading-[1.45] font-bold text-foreground [overflow-wrap:anywhere] [&_code]:whitespace-normal">
              {title}
            </div>
          ) : null}
          {description ? (
            <div className="docs-snippet-external-header-description mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
      <Card
        id={id}
        className={cn(
          "docs-snippet-template docs-code-block my-5 flex flex-col gap-0 overflow-hidden rounded-xl border border-code-border bg-code-tab py-0 text-code-foreground shadow-sm shadow-black/[0.03] dark:shadow-black/20",
          kind === "dependency"
            ? "docs-properties-template docs-dependency-template"
            : "docs-code-snippet-template",
          footer ? "docs-code-block-with-footer" : undefined,
          className,
        )}
        data-snippet-kind={kind}
      >
        <CardHeader
          className={
            hasHeaderText
              ? "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 border-b border-code-border bg-code-tab px-4 py-2.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:!pb-2.5"
              : "docs-code-toolbar docs-snippet-card-header !flex min-h-10 items-center justify-between gap-3 border-b border-code-border bg-code-tab px-3 py-2 [.border-b]:!pb-2"
          }
        >
          {title && !externalHeader ? (
            <CardTitle className="docs-snippet-heading flex min-w-0 items-center gap-2 text-sm leading-5 font-semibold text-code-foreground">
              <SnippetKindIcon kind={kind} />
              <span>{title}</span>
            </CardTitle>
          ) : null}
          {description && !externalHeader ? (
            <CardDescription className="docs-snippet-description text-xs leading-5 text-code-muted">
              {description}
            </CardDescription>
          ) : null}
          {controls ? (
            <div className="docs-snippet-actions flex flex-wrap items-center justify-start justify-self-start gap-2">
              {controls}
            </div>
          ) : null}
          {action ? (
            <CardAction
              className={
                hasHeaderText
                  ? undefined
                  : "ml-auto self-center justify-self-auto"
              }
            >
              {action}
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="docs-snippet-panels overflow-hidden bg-code px-0 text-code-foreground">
          {children}
        </CardContent>
        {footer ? (
          <div
            data-slot="card-footer"
            className="docs-snippet-card-footer docs-code-callouts block border-t border-code-border bg-code-tab px-6 pt-3 pb-2 text-sm leading-5 text-code-foreground [&_code]:!rounded-none [&_code]:!bg-code-foreground/10 [&_code]:!p-0 [&_code]:!text-[1em] [&_code]:!leading-[inherit] [&_code]:!text-code-foreground [&_ol]:grid [&_ol]:gap-[0.35rem] [&_ol]:!m-0 [&_ol]:!p-0 [&_ol]:list-none [&_ol]:[counter-reset:docs-code-callout] [&_li]:grid [&_li]:grid-cols-[auto_minmax(0,1fr)] [&_li]:items-start [&_li]:gap-[0.7rem] [&_li]:[counter-increment:docs-code-callout] [&_li+li]:!mt-0 [&_li::before]:mt-[0.2rem] [&_li::before]:inline-flex [&_li::before]:h-[1.15rem] [&_li::before]:w-[1.15rem] [&_li::before]:items-center [&_li::before]:justify-center [&_li::before]:rounded-full [&_li::before]:[border:1px_solid_color-mix(in_oklab,var(--code-foreground)_82%,var(--code))] [&_li::before]:bg-code-foreground [&_li::before]:text-code [&_li::before]:text-[0.72rem] [&_li::before]:leading-none [&_li::before]:font-bold [&_li::before]:content-[counter(docs-code-callout)] [&_table]:w-full [&_table]:border-collapse [&_td]:align-top [&_td:first-child]:w-[1.15rem] [&_td:first-child]:align-middle [&_td:first-child]:pr-[0.7rem] [&_td:first-child]:pt-0 [&_tr+tr_td]:pt-[0.55rem] [&_tr+tr_td:first-child]:pt-0 [&_td:first-child_.conum]:ml-0 [&_td:first-child_.conum]:inline-flex [&_td:first-child_.conum]:h-[1.15rem] [&_td:first-child_.conum]:w-[1.15rem] [&_td:first-child_.conum]:items-center [&_td:first-child_.conum]:justify-center [&_td:first-child_.conum]:rounded-full [&_td:first-child_.conum]:[border:1px_solid_color-mix(in_oklab,var(--code-foreground)_82%,var(--code))] [&_td:first-child_.conum]:bg-code-foreground [&_td:first-child_.conum]:text-code [&_td:first-child_.conum]:[font-family:var(--shell-font)] [&_td:first-child_.conum]:text-[0.72rem] [&_td:first-child_.conum]:leading-none [&_td:first-child_.conum]:font-bold [&_td:first-child_.conum]:not-italic [&_td:first-child_.conum::before]:content-[attr(data-value)] [&_td:first-child_.conum+b]:hidden [&_.colist]:!m-0 [&_p]:!m-0"
          >
            {footer}
          </div>
        ) : null}
      </Card>
    </>
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
  title,
}: DocsPropertiesSnippetCardProps) {
  return (
    <Card
      id={id}
      className="docs-properties-template my-5 flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card py-0 text-card-foreground shadow-sm shadow-black/[0.03] dark:shadow-black/20"
    >
      <a
        className="docs-properties-anchor block h-0 overflow-hidden no-underline"
        id={anchorId}
        href={`#${anchorId}`}
        aria-hidden="true"
      />
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 border-b border-code-border bg-code-tab px-4 py-2.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:!pb-2.5">
        <CardTitle className="docs-properties-heading flex min-w-0 items-center gap-2 text-sm leading-5 font-semibold">
          <SnippetKindIcon kind="properties" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="docs-properties-description text-xs leading-5">
          {eyebrow}
        </CardDescription>
        <CardAction>
          <Badge
            variant="secondary"
            className="docs-properties-count inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent bg-secondary px-2.5 py-1 text-[0.78rem] font-medium whitespace-nowrap text-secondary-foreground"
          >
            {countLabel}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="docs-properties-scroll overflow-x-auto px-0 [&_table.tableblock]:w-full [&_table.tableblock]:!m-0 [&_table.tableblock]:border-collapse [&_table.tableblock]:text-[0.92rem] [&_table.tableblock]:leading-[1.45] [&_table.tableblock_caption]:!m-0 [&_table.tableblock_caption]:text-left [&_table.tableblock_caption]:font-bold [&_table.tableblock_caption]:text-foreground [&_table.tableblock_:where(th,td)]:border [&_table.tableblock_:where(th,td)]:border-border [&_table.tableblock_:where(th,td)]:px-3 [&_table.tableblock_:where(th,td)]:py-[0.65rem] [&_table.tableblock_:where(th,td)]:align-top [&_table.tableblock_th]:bg-muted [&_table.tableblock_th]:font-bold [&_table.tableblock_th]:text-foreground">
        {children}
      </CardContent>
    </Card>
  );
}
