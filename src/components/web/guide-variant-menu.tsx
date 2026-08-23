import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type GuideVariantLink = {
  id: string;
  languageLabel: string;
  buildToolLabel: string;
  href: string;
  active: boolean;
};

/**
 * The only interactive part of a guide card. The card itself is static markup,
 * so this island carries just the variant links instead of re-serializing the
 * whole guide.
 */
export function GuideVariantMenu({
  title,
  variants,
}: {
  title: string;
  variants: GuideVariantLink[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-sm"
          variant="outline"
          className="rounded-l-none border-l-0"
          aria-label={`Choose variant for ${title}`}
        >
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>Variants</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {variants.map((variant) => (
          <DropdownMenuItem key={variant.id} asChild>
            <a
              href={variant.href}
              aria-current={variant.active ? "page" : undefined}
            >
              <span>{variant.languageLabel}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {variant.buildToolLabel}
              </span>
              {variant.active ? <CheckIcon className="ml-1 size-4" /> : null}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
