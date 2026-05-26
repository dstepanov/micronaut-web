"use client";

import { useEffect, useState } from "react";

import { withBasePath, withSurfacePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";

export type VersionOption = {
  label: string;
  href: string;
  current?: boolean;
};

type VersionSelectorProps = {
  label: string;
  options: VersionOption[];
  surface?: "main" | "docs" | "guides" | "launch";
  className?: string;
};

export function VersionSelector({ label, options, surface, className }: VersionSelectorProps) {
  const current = options.find((option) => option.current) || options[0];
  const [selectedHref, setSelectedHref] = useState(current?.href || "");
  const route = (href: string) => surface ? withSurfacePath(surface, href) : withBasePath(href);

  useEffect(() => {
    const match = options.find((option) => pathMatchesCurrentLocation(route(option.href)));
    if (match) {
      setSelectedHref(match.href);
    }
  }, [options, surface]);

  if (!current || options.length < 2) {
    return null;
  }

  return (
    <label className={cn("grid min-w-0 gap-1 text-xs text-muted-foreground", className)}>
      <span className="font-medium text-foreground">{label}</span>
      <select
        className="h-8 min-w-0 rounded-md border bg-background px-2 text-xs text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        value={selectedHref}
        aria-label={label}
        onChange={(event) => {
          const href = event.currentTarget.value;
          if (href) {
            setSelectedHref(href);
            window.location.href = route(href);
          }
        }}
      >
        {options.map((option) => (
          <option key={option.href} value={option.href}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function pathMatchesCurrentLocation(href: string) {
  const destination = normalizedPathname(href);
  const current = normalizedPathname(window.location.href);
  return current === destination || current.startsWith(`${destination.replace(/\/$/, "")}/`);
}

function normalizedPathname(href: string) {
  return new URL(href, window.location.href).pathname.replace(/\/index\.html$/, "/");
}
