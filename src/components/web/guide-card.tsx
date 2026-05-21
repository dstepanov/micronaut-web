import { ArrowRight, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { ProtocolGuide } from "@/lib/protocol";

export function GuideCard({ guide }: { guide: ProtocolGuide }) {
  const primaryCategory = guide.categories[0] || "Guide";
  const tags = guide.tags.slice(0, 4);

  return (
    <Card className="group h-full transition hover:border-primary/40 hover:shadow-md">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">{primaryCategory}</Badge>
        <CardAction>
          <Badge variant="outline">{guide.estimatedMinutes} min</Badge>
        </CardAction>
        <CardTitle className="text-lg leading-tight">
          <a href={guide.href} className="after:absolute after:inset-0">
            {guide.title}
          </a>
        </CardTitle>
        <CardDescription className="line-clamp-3">{guide.intro}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
          {guide.tags.length > tags.length ? <Badge variant="outline">+{guide.tags.length - tags.length}</Badge> : null}
        </div>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-3 border-t bg-muted/30 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {guide.publicationDate || "Published guide"}
        </span>
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </CardFooter>
    </Card>
  );
}
