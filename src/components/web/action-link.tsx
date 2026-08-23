import type { ComponentProps } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";

type ActionLinkProps = {
  href: string;
  label: string;
  external?: boolean;
  /** Trailing arrow for text-like links so they read as links, not labels. */
  arrow?: boolean;
} & Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

export function ActionLink({
  href,
  label,
  external = false,
  arrow = false,
  variant,
  size,
  className,
}: ActionLinkProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={external ? href : withBasePath(href)}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {label}
        {arrow ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
      </a>
    </Button>
  );
}
