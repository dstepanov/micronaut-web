"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileCode2, FileText, FolderGit2, Package, Rocket, Search, SlidersHorizontal, Tag } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";
import {
  docsSearchItems,
  searchItems,
  type SearchItem,
} from "@/lib/content-catalog";

type MainSiteSearchPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
};

function ResultIcon({ kind }: { kind: SearchItem["kind"] }) {
  if (kind === "Guide") return <BookOpen />;
  if (kind === "Tag") return <Tag />;
  if (kind === "Class") return <FileCode2 />;
  if (kind === "Property") return <SlidersHorizontal />;
  if (kind === "Repo") return <FolderGit2 />;
  if (kind === "Project") return <Package />;
  return <FileText />;
}

const docsScopes = ["All", "Projects", "Docs", "Properties", "Classes", "Repos"] as const;
type DocsScope = (typeof docsScopes)[number];

function scopeForItem(item: SearchItem): Exclude<DocsScope, "All"> {
  if (item.scope) return item.scope;
  if (item.kind === "Project") return "Projects";
  if (item.kind === "Property") return "Properties";
  if (item.kind === "Class") return "Classes";
  if (item.kind === "Repo") return "Repos";
  return "Docs";
}

function matchesSearchItem(item: SearchItem, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return [item.kind, item.title, item.description, item.terms]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export function SearchDialog({
  className,
  mainSitePages = [],
  mode = "site",
  buttonLabel
}: {
  className?: string;
  mainSitePages?: MainSiteSearchPage[];
  mode?: "site" | "docs";
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [docsScope, setDocsScope] = useState<DocsScope>("All");
  const [generatedDocsItems, setGeneratedDocsItems] = useState<SearchItem[]>([]);
  const items = useMemo(() => searchItems(), []);
  const fallbackDocsItems = useMemo(() => docsSearchItems(), []);
  const docs = useMemo(() => items.filter((item) => item.href.startsWith("/docs/")).slice(0, 80), [items]);
  const guides = useMemo(() => items.filter((item) => item.href.startsWith("/guides/")).slice(0, 80), [items]);
  const tags = useMemo(() => items.filter((item) => item.kind === "Tag").slice(0, 40), [items]);
  const pages = useMemo(() => mainSitePages.slice(0, 80), [mainSitePages]);
  const docsModeItems = useMemo(() => {
    const source = generatedDocsItems.length ? generatedDocsItems : fallbackDocsItems;
    return source
      .filter((item) => docsScope === "All" || scopeForItem(item) === docsScope)
      .filter((item) => matchesSearchItem(item, searchQuery))
      .slice(0, 240);
  }, [docsScope, fallbackDocsItems, generatedDocsItems, searchQuery]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || mode !== "docs" || generatedDocsItems.length) {
      return;
    }
    let cancelled = false;
    fetch(withBasePath("/docs/search-index.json"))
      .then((response) => response.ok ? response.json() : undefined)
      .then((payload) => {
        if (!cancelled && Array.isArray(payload?.items)) {
          setGeneratedDocsItems(payload.items);
        }
      })
      .catch(() => {
        // The fallback project index is already available synchronously.
      });
    return () => {
      cancelled = true;
    };
  }, [generatedDocsItems.length, mode, open]);

  const navigateTo = (href: string) => {
    window.location.href = withBasePath(href);
    setOpen(false);
  };

  const dialogTitle = mode === "docs" ? "Search Micronaut Docs" : "Search Micronaut";
  const dialogDescription = mode === "docs"
    ? "Search projects, classes, properties, docs, and repositories."
    : "Search projects, guides, sections, and tags.";
  const placeholder = mode === "docs"
    ? "Search projects, classes, properties, docs..."
    : "Search projects, guides, sections, and tags...";
  const resolvedButtonLabel = buttonLabel || "Search docs...";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={className}
        aria-label="Search Micronaut"
        onClick={() => setOpen(true)}
      >
        <Search />
        <span className="hidden min-w-32 text-left text-muted-foreground/90 sm:inline">{resolvedButtonLabel}</span>
        <kbd className={cn(
          "ml-auto hidden rounded border px-1.5 py-0.5 text-[0.7rem] text-muted-foreground md:inline",
          buttonLabel ? "border-mn-border bg-mn-surface-raised" : "bg-muted"
        )}>
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle}
        description={dialogDescription}
        className="max-w-2xl"
      >
        <CommandInput placeholder={placeholder} value={searchQuery} onValueChange={setSearchQuery} />
        <CommandList className="max-h-[28rem]">
          <CommandEmpty>No results found.</CommandEmpty>
          {mode === "docs" ? (
            <>
              <div className="flex flex-wrap gap-1 border-b p-2">
                {docsScopes.map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                      docsScope === scope && "bg-accent text-accent-foreground"
                    )}
                    aria-pressed={docsScope === scope}
                    onClick={() => setDocsScope(scope)}
                  >
                    {scope}
                  </button>
                ))}
              </div>
              {docsScopes.filter((scope) => scope !== "All").map((scope) => {
                const scopedItems = docsModeItems.filter((item) => scopeForItem(item) === scope);
                if (!scopedItems.length) return null;
                return (
                  <CommandGroup key={scope} heading={scope}>
                    {scopedItems.map((item) => (
                      <CommandItem
                        key={`${item.scope}-${item.kind}-${item.href}-${item.title}`}
                        value={`${item.kind} ${item.title} ${item.description} ${item.terms}`}
                        onSelect={() => navigateTo(item.href)}
                      >
                        <ResultIcon kind={item.kind} />
                        <span className="grid min-w-0 gap-0.5">
                          <span className="truncate font-medium">{item.title}</span>
                          <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                        </span>
                        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
                          {scope}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          ) : (
            <>
              <CommandGroup heading="Actions">
                <CommandItem
                  value="Launch create project application starter"
                  onSelect={() => navigateTo("/launch/")}
                >
                  <Rocket />
                  <span className="grid min-w-0 gap-0.5">
                    <span className="truncate font-medium">Launch a project</span>
                    <span className="truncate text-xs text-muted-foreground">Choose features and generate a Micronaut application.</span>
                  </span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Main site">
                {pages.map((page) => (
                  <CommandItem
                    key={page.slug}
                    value={`Page ${page.title} ${page.eyebrow} ${page.description}`}
                    onSelect={() => navigateTo(`/${page.slug}/`)}
                  >
                    <FileText />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate font-medium">{page.title}</span>
                      <span className="truncate text-xs text-muted-foreground">{page.description}</span>
                    </span>
                    <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
                      Page
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Docs and APIs">
                {docs.map((item) => (
                  <CommandItem
                    key={`${item.kind}-${item.href}-${item.title}`}
                    value={`${item.kind} ${item.title} ${item.description} ${item.terms}`}
                    onSelect={() => navigateTo(item.href)}
                  >
                    <ResultIcon kind={item.kind} />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                    </span>
                    <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
                      Docs
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Guides">
                {guides.map((item) => (
                  <CommandItem
                    key={`${item.kind}-${item.href}-${item.title}`}
                    value={`${item.kind} ${item.title} ${item.description} ${item.terms}`}
                    onSelect={() => navigateTo(item.href)}
                  >
                    <ResultIcon kind={item.kind} />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                    </span>
                    <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
                      Guide
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Tags">
                {tags.map((item) => (
                  <CommandItem
                    key={`${item.kind}-${item.href}-${item.title}`}
                    value={`${item.kind} ${item.title} ${item.description} ${item.terms}`}
                    onSelect={() => navigateTo(item.href)}
                  >
                    <ResultIcon kind={item.kind} />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                    </span>
                    <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
                      Tag
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
