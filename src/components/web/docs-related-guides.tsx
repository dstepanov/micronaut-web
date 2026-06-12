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
  const showMoreHref = React.useMemo(
    () => guideSearchHref(topicAliases.find((alias) => alias.trim())),
    [topicAliases],
  );
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
      className="docs-related-guides"
      data-docs-related-guides
      aria-busy={!loaded}
    >
      <div className="docs-related-guides-header">
        <div className="docs-related-guides-heading-wrap">
          <h2 className="docs-related-guides-heading">Latest guides</h2>
        </div>
      </div>
      <div className="docs-related-guides-grid">
        {loaded
          ? guides.map((guide, index) => (
              <div key={guide.slug} className="docs-related-guide-item">
                <RelatedGuideCard guide={guide} />
                {index === guides.length - 1 ? (
                  <div className="docs-related-guides-more-row">
                    <Button
                      asChild
                      size="sm"
                      variant="link"
                      className="docs-related-guides-more-button"
                    >
                      <a href={showMoreHref} data-docs-related-guides-show-more>
                        Show more
                        <ArrowRightIcon className="docs-related-guides-icon" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div
                    className="docs-related-guides-spacer"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))
          : [0, 1, 2].map((index) => <RelatedGuideSkeleton key={index} />)}
      </div>
    </section>
  );
}

function RelatedGuideSkeleton() {
  return (
    <Card className="docs-related-guide-card" aria-hidden="true">
      <CardHeader>
        <div className="docs-related-guide-skeleton-badges">
          <Skeleton className="docs-related-guide-skeleton-badge-primary" />
          <Skeleton className="docs-related-guide-skeleton-badge-secondary" />
        </div>
        <Skeleton className="docs-related-guide-skeleton-title" />
        <div className="docs-related-guide-skeleton-description">
          <Skeleton className="docs-related-guide-skeleton-line-full" />
          <Skeleton className="docs-related-guide-skeleton-line-short" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="docs-related-guide-skeleton-meta" />
      </CardContent>
      <CardFooter>
        <Skeleton className="docs-related-guide-skeleton-button" />
      </CardFooter>
    </Card>
  );
}

function RelatedGuideCard({ guide }: { guide: GeneratedGuide }) {
  const option = preferredGuideOption(guide);
  const href = withSurfacePath(
    "guides",
    option
      ? guideOptionPath(option, "/guides")
      : guideOverviewPath(guide, "/guides"),
  );
  const badges = (
    guide.categories.length ? guide.categories : guide.tags
  ).slice(0, 2);

  return (
    <Card className="docs-related-guide-card">
      <CardHeader>
        {badges.length > 0 ? (
          <div className="docs-related-guide-badges">
            {badges.map((badge) => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
        <CardTitle className="docs-related-guide-title">
          <a href={href} className="docs-related-guide-title-link">
            {guide.title}
          </a>
        </CardTitle>
        <CardDescription className="docs-related-guide-description">
          {guide.intro}
        </CardDescription>
      </CardHeader>
      <CardContent className="docs-related-guide-meta-content">
        <div className="docs-related-guide-meta">
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
            <ArrowRightIcon className="docs-related-guides-icon" />
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

function guideSearchHref(topicAlias: string | undefined) {
  const query = topicAlias?.trim();
  if (!query) {
    return withSurfacePath("guides", "/guides/");
  }
  return withSurfacePath("guides", `/guides/?q=${encodeURIComponent(query)}`);
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
