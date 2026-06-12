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
        active ? "selected" : undefined,
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
      className={cn("docs-code-language docs-code-language-static", className)}
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
        "docs-code-language-icon",
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
        <div className="docs-snippet-external-header">
          {title ? (
            <div className="docs-snippet-external-header-title">{title}</div>
          ) : null}
          {description ? (
            <div className="docs-snippet-external-header-description">
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
      <Card
        id={id}
        className={cn(
          "docs-snippet-template docs-code-block",
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
              ? "docs-snippet-card-header-with-text"
              : "docs-code-toolbar docs-snippet-card-header"
          }
        >
          {title && !externalHeader ? (
            <CardTitle className="docs-snippet-heading">
              <SnippetKindIcon kind={kind} />
              <span>{title}</span>
            </CardTitle>
          ) : null}
          {description && !externalHeader ? (
            <CardDescription className="docs-snippet-description">
              {description}
            </CardDescription>
          ) : null}
          {controls ? (
            <div className="docs-snippet-actions">{controls}</div>
          ) : null}
          {action ? (
            <CardAction
              className={hasHeaderText ? undefined : "docs-snippet-card-action"}
            >
              {action}
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="docs-snippet-panels">{children}</CardContent>
        {footer ? (
          <div
            data-slot="card-footer"
            className="docs-snippet-card-footer docs-code-callouts"
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
    <Card id={id} className="docs-properties-template">
      <a
        className="docs-properties-anchor"
        id={anchorId}
        href={`#${anchorId}`}
        aria-hidden="true"
      />
      <CardHeader className="docs-properties-card-header">
        <CardTitle className="docs-properties-heading">
          <SnippetKindIcon kind="properties" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="docs-properties-description">
          {eyebrow}
        </CardDescription>
        <CardAction className="docs-properties-card-action">
          <Badge variant="secondary" className="docs-properties-count">
            {countLabel}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="docs-properties-scroll">{children}</CardContent>
    </Card>
  );
}
