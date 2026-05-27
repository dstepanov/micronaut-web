import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  guideOptionPath,
  guideOverviewPath,
  guideTagPath,
  preferredGuideOption,
  type GeneratedGuide,
} from "@/lib/generated-guides";
import { withBasePath } from "@/lib/base-path";

export function LatestGuideCard({
  guide,
  root = "/latest",
}: {
  guide: GeneratedGuide;
  root?: string;
}) {
  const option = preferredGuideOption(guide);
  const href = withBasePath(
    option ? guideOptionPath(option, root) : guideOverviewPath(guide, root),
  );
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {(guide.categories.length ? guide.categories : ["Guide"])
            .slice(0, 2)
            .map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
        </div>
        <CardTitle className="text-xl leading-tight">
          <a href={href} className="text-inherit no-underline hover:text-brand">
            {guide.title}
          </a>
        </CardTitle>
        <CardDescription>{guide.intro}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-1.5">
          {guide.tags.slice(0, 5).map((tag) => (
            <a
              key={tag}
              href={withBasePath(guideTagPath(tag, root))}
              className="no-underline"
              aria-label={`Open guides tagged ${tag}`}
            >
              <Badge variant="outline">{tag}</Badge>
            </a>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{guide.estimatedMinutes} min</span>
          <Button asChild variant="ghost" size="sm">
            <a href={href} aria-label={`Read ${guide.title}`}>
              Read
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
