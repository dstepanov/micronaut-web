import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/base-path";

type ActionLinkProps = {
  href: string;
  label: string;
  external?: boolean;
} & Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

export function ActionLink({ href, label, external = false, variant, size, className }: ActionLinkProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={external ? href : withBasePath(href)} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {label}
      </a>
    </Button>
  );
}
