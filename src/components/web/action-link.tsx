import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type ActionLinkProps = {
  href: string;
  label: string;
  external?: boolean;
} & Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

export function ActionLink({ href, label, external = false, variant, size, className }: ActionLinkProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {label}
      </a>
    </Button>
  );
}
