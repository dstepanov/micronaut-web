"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  FileCode2,
  FileText,
  FolderGit2,
  Package,
  Rocket,
  Search,
  SlidersHorizontal,
  Tag,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  withConfiguredBasePath,
  withBasePath,
  type SiteSurfaceUrls,
} from "@/lib/base-path";
import type { SearchItem } from "@/lib/content-catalog";

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

/**
 * Every result row in both modes renders the same icon / title / description /
 * badge layout; only the badge and the source of the row differ.
 */
function ResultItem({
  badge,
  description,
  icon,
  onSelect,
  title,
  value,
}: {
  badge: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
  title: string;
  value: string;
}) {
  return (
    <CommandItem value={value} onSelect={onSelect}>
      {icon}
      <span className="grid min-w-0 gap-0.5">
        <span className="truncate font-medium">{title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
        {badge}
      </span>
    </CommandItem>
  );
}

function SearchItemResults({
  badge,
  items,
  onSelect,
}: {
  badge: string;
  items: SearchItem[];
  onSelect: (href: string) => void;
}) {
  return items.map((item) => (
    <ResultItem
      key={`${item.scope ?? ""}-${item.kind}-${item.href}-${item.title}`}
      badge={badge}
      description={item.description}
      icon={<ResultIcon kind={item.kind} />}
      onSelect={() => onSelect(item.href)}
      title={item.title}
      value={`${item.kind} ${item.title} ${item.description} ${item.terms}`}
    />
  ));
}

const docsScopes = [
  "All",
  "Projects",
  "Docs",
  "Properties",
  "Classes",
  "Repos",
] as const;
type DocsScope = (typeof docsScopes)[number];

function scopeForItem(item: SearchItem): Exclude<DocsScope, "All"> {
  if (item.scope) return item.scope;
  if (item.kind === "Project") return "Projects";
  if (item.kind === "Property") return "Properties";
  if (item.kind === "Class") return "Classes";
  if (item.kind === "Repo") return "Repos";
  return "Docs";
}

/**
 * Scores every item once, then sorts. Lowercasing inside the comparator would
 * repeat the same work O(n log n) times per keystroke over the whole index.
 */
function matchingDocsSearchItems(items: SearchItem[], query: string) {
  const normalized = query.trim().toLowerCase();
  const scored: Array<{ item: SearchItem; score: number }> = [];
  for (const item of items) {
    if (!normalized) {
      scored.push({ item, score: 0 });
      continue;
    }
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();
    const terms = item.terms.toLowerCase();
    if (
      !`${item.kind.toLowerCase()} ${title} ${description} ${terms}`.includes(
        normalized,
      )
    ) {
      continue;
    }
    scored.push({
      item,
      score: title.startsWith(normalized)
        ? 3
        : title.includes(normalized)
          ? 2
          : description.includes(normalized) || terms.includes(normalized)
            ? 1
            : 0,
    });
  }
  scored.sort(
    (left, right) =>
      right.score - left.score ||
      (right.item.weight || 0) - (left.item.weight || 0) ||
      left.item.title.localeCompare(right.item.title),
  );
  return scored.map((entry) => entry.item);
}

export function SearchDialog({
  className,
  docsSearchIndexUrl,
  siteSearchIndexUrl,
  mainSitePages = [],
  mode = "site",
  navigationUrls,
  buttonLabel,
}: {
  className?: string;
  docsSearchIndexUrl?: string;
  siteSearchIndexUrl?: string;
  mainSitePages?: MainSiteSearchPage[];
  mode?: "site" | "docs";
  navigationUrls?: SiteSurfaceUrls;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [docsScope, setDocsScope] = useState<DocsScope>("All");
  // Both modes load their catalog from a static JSON route when the dialog is
  // first opened. Importing it instead put the docs and guides fixtures in the
  // header bundle, which every page hydrates.
  const [items, setItems] = useState<SearchItem[]>([]);
  const docs = useMemo(
    () => items.filter((item) => item.href.startsWith("/docs/")).slice(0, 80),
    [items],
  );
  const guides = useMemo(
    () => items.filter((item) => item.href.startsWith("/guides/")).slice(0, 80),
    [items],
  );
  const tags = useMemo(
    () => items.filter((item) => item.kind === "Tag").slice(0, 40),
    [items],
  );
  const pages = useMemo(() => mainSitePages.slice(0, 80), [mainSitePages]);
  const docsModeItems = useMemo(
    () =>
      matchingDocsSearchItems(
        items.filter(
          (item) => docsScope === "All" || scopeForItem(item) === docsScope,
        ),
        searchQuery,
      ).slice(0, 240),
    [docsScope, items, searchQuery],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || items.length) {
      return;
    }
    const indexUrl =
      mode === "docs"
        ? docsSearchIndexUrl || withBasePath("/docs/search-index.json")
        : siteSearchIndexUrl || withBasePath("/search-index.json");
    let cancelled = false;
    fetch(indexUrl)
      .then((response) => (response.ok ? response.json() : undefined))
      .then((payload) => {
        if (!cancelled && Array.isArray(payload?.items)) {
          setItems(payload.items);
        }
      })
      .catch(() => {
        // Leaves the dialog on its "No results found." state.
      });
    return () => {
      cancelled = true;
    };
  }, [docsSearchIndexUrl, items.length, mode, open, siteSearchIndexUrl]);

  const navigateTo = (href: string) => {
    window.location.href = withConfiguredBasePath(href, navigationUrls);
    setOpen(false);
  };

  const dialogTitle =
    mode === "docs" ? "Search Micronaut Docs" : "Search Micronaut";
  const dialogDescription =
    mode === "docs"
      ? "Search projects, classes, properties, docs, and repositories."
      : "Search projects, guides, sections, and tags.";
  const placeholder =
    mode === "docs"
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
        <span className="hidden min-w-32 text-left text-muted-foreground sm:inline">
          {resolvedButtonLabel}
        </span>
        <kbd
          className={cn(
            "ml-auto hidden rounded border px-1.5 py-0.5 text-[0.7rem] text-muted-foreground md:inline",
            buttonLabel ? "border-mn-border bg-mn-surface-raised" : "bg-muted",
          )}
        >
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={dialogTitle}
        description={dialogDescription}
        className="max-w-2xl"
        commandProps={mode === "docs" ? { shouldFilter: false } : undefined}
      >
        <CommandInput
          placeholder={placeholder}
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
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
                      docsScope === scope && "bg-accent text-accent-foreground",
                    )}
                    aria-pressed={docsScope === scope}
                    onClick={() => setDocsScope(scope)}
                  >
                    {scope}
                  </button>
                ))}
              </div>
              {docsScopes
                .filter((scope) => scope !== "All")
                .map((scope) => {
                  const scopedItems = docsModeItems.filter(
                    (item) => scopeForItem(item) === scope,
                  );
                  if (!scopedItems.length) return null;
                  return (
                    <CommandGroup key={scope} heading={scope}>
                      <SearchItemResults
                        badge={scope}
                        items={scopedItems}
                        onSelect={navigateTo}
                      />
                    </CommandGroup>
                  );
                })}
            </>
          ) : (
            <>
              <CommandGroup heading="Actions">
                <CommandItem
                  value="Launch create project application starter"
                  onSelect={() => navigateTo("https://launch.micronaut.io")}
                >
                  <Rocket />
                  <span className="grid min-w-0 gap-0.5">
                    <span className="truncate font-medium">
                      Launch a project
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Choose features and generate a Micronaut application.
                    </span>
                  </span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Main site">
                {pages.map((page) => (
                  <ResultItem
                    key={page.slug}
                    badge="Page"
                    description={page.description}
                    icon={<FileText />}
                    onSelect={() => navigateTo(`/${page.slug}/`)}
                    title={page.title}
                    value={`Page ${page.title} ${page.eyebrow} ${page.description}`}
                  />
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Docs and APIs">
                <SearchItemResults
                  badge="Docs"
                  items={docs}
                  onSelect={navigateTo}
                />
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Guides">
                <SearchItemResults
                  badge="Guide"
                  items={guides}
                  onSelect={navigateTo}
                />
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Tags">
                <SearchItemResults
                  badge="Tag"
                  items={tags}
                  onSelect={navigateTo}
                />
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
