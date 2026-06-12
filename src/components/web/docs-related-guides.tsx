import * as React from "react";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { withSurfacePath } from "@/lib/base-path";
import {
  guideOptionPath,
  guideOverviewPath,
  preferredGuideOption,
  type GeneratedGuide,
  type GeneratedGuidesManifest,
} from "@/lib/generated-guide-routing";

type DocsRelatedGuidesProps = {
  manifestUrl: string;
  topicAliases: string[];
};

export function DocsRelatedGuides({
  manifestUrl,
  topicAliases,
}: DocsRelatedGuidesProps) {
  const normalizedAliases = React.useMemo(
    () => new Set(topicAliases.map(normalizeTopic).filter(Boolean)),
    [topicAliases],
  );
  const [guides, setGuides] = React.useState<GeneratedGuide[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!normalizedAliases.size) {
      setLoaded(true);
      setGuides([]);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function loadGuides() {
      try {
        const response = await fetch(manifestUrl, {
          credentials: "omit",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Guide manifest returned ${response.status}`);
        }
        const manifest = await response.json();
        if (!isGeneratedGuidesManifest(manifest)) {
          throw new Error("Guide manifest is missing guides.");
        }
        if (active) {
          setGuides(latestMatchingGuides(manifest.guides, normalizedAliases));
        }
      } catch {
        if (active) {
          setGuides([]);
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    setLoaded(false);
    loadGuides();

    return () => {
      active = false;
      controller.abort();
    };
  }, [manifestUrl, normalizedAliases]);

  if (!normalizedAliases.size || (loaded && guides.length === 0)) {
    return null;
  }

  return (
    <section
      className="mt-10 grid gap-4"
      data-docs-related-guides
      aria-busy={!loaded}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Badge variant="secondary">Guides</Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Related guides
          </h2>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {loaded
          ? guides.map((guide) => (
              <RelatedGuideCard key={guide.slug} guide={guide} />
            ))
          : [0, 1, 2].map((index) => <RelatedGuideSkeleton key={index} />)}
      </div>
    </section>
  );
}

function RelatedGuideSkeleton() {
  return (
    <Card className="h-full rounded-lg" aria-hidden="true">
      <CardHeader>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-4/5" />
        <div className="grid gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-5 w-36" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-28" />
      </CardFooter>
    </Card>
  );
}

function RelatedGuideCard({ guide }: { guide: GeneratedGuide }) {
  const option = preferredGuideOption(guide);
  const href = withSurfacePath(
    "guides",
    option ? guideOptionPath(option, "/guides") : guideOverviewPath(guide, "/guides"),
  );
  const badges = (guide.categories.length ? guide.categories : guide.tags).slice(
    0,
    2,
  );

  return (
    <Card className="h-full rounded-lg">
      <CardHeader>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
        <CardTitle className="text-lg leading-snug">
          <a href={href} className="text-inherit no-underline hover:text-brand">
            {guide.title}
          </a>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {guide.intro}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {guide.publicationDate ? (
            <time dateTime={guide.publicationDate}>
              {formatGuideDate(guide.publicationDate)}
            </time>
          ) : null}
          {guide.estimatedMinutes > 0 ? (
            <span>{guide.estimatedMinutes} min</span>
          ) : null}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" variant="outline">
          <a href={href}>
            Read guide
            <ArrowRightIcon className="size-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function latestMatchingGuides(
  guides: GeneratedGuide[],
  aliases: Set<string>,
): GeneratedGuide[] {
  return guides
    .filter((guide) => guideMatchesAliases(guide, aliases))
    .sort(
      (left, right) =>
        right.publicationDate.localeCompare(left.publicationDate) ||
        left.title.localeCompare(right.title),
    )
    .slice(0, 3);
}

function guideMatchesAliases(guide: GeneratedGuide, aliases: Set<string>) {
  const topics = new Set(
    [guide.slug, ...guide.tags, ...guide.categories]
      .map(normalizeTopic)
      .filter(Boolean),
  );
  return [...aliases].some((alias) => topics.has(alias));
}

function normalizeTopic(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isGeneratedGuidesManifest(
  value: unknown,
): value is GeneratedGuidesManifest {
  return (
    value !== null &&
    typeof value === "object" &&
    Array.isArray((value as { guides?: unknown }).guides)
  );
}

function formatGuideDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}
