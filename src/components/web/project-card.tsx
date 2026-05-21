import { ExternalLink } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { IconGlyph } from "@/components/web/icon-glyph";
import type { ProtocolProject } from "@/lib/protocol";

export function ProjectCard({ project }: { project: ProtocolProject }) {
  return (
    <Card className="group relative grid h-full min-h-[252px] w-full grid-rows-[auto_minmax(84px,1fr)_auto] gap-2.5 rounded-lg p-3.5 py-3.5 transition hover:border-foreground/30 hover:shadow-md">
      <CardHeader className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 gap-y-1 px-4">
        <span className="flex size-8 items-center justify-center rounded-lg border bg-secondary text-secondary-foreground">
          <IconGlyph name={project.icon} className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <CardTitle className="text-[0.96rem] leading-snug">
            <a href={project.href} className="text-foreground no-underline hover:underline">
              {project.displayName}
            </a>
          </CardTitle>
          <CardDescription className="mt-1 line-clamp-2 text-[0.8rem] leading-snug">
            {project.shortDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="min-h-20 px-4">
        <p className="line-clamp-5 text-[0.86rem] leading-6 text-muted-foreground">{project.longDescription}</p>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-3 px-4 pt-0 text-xs text-muted-foreground">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          <a
            href={project.href}
            className="relative z-10 inline-flex min-h-7 items-center rounded-md border bg-background px-2 text-foreground no-underline hover:bg-muted"
          >
            Docs
          </a>
          {project.repositoryUrl ? (
            <a
              href={project.repositoryUrl}
              className="relative z-10 inline-flex min-h-7 items-center gap-1.5 rounded-md border bg-background px-2 text-foreground no-underline hover:bg-muted"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </span>
        {project.version ? <span className="shrink-0 text-[0.72rem] leading-5">{project.version}</span> : null}
      </CardFooter>
    </Card>
  );
}
