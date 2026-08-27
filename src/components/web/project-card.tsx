import { ExternalLink } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBadge } from "@/components/web/icon-badge";
import { withBasePath } from "@/lib/base-path";
import type { DocsProject } from "@/lib/content-catalog";

export function ProjectCard({ project }: { project: DocsProject }) {
  const destination = project.externalUrl || withBasePath(project.href);

  return (
    <Card className="group relative grid h-full w-full grid-rows-[auto_1fr_auto] gap-2.5 rounded-lg p-3.5 py-3.5 transition focus-within:border-foreground/30 hover:border-foreground/30 hover:shadow-md">
      <CardHeader className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 gap-y-1 px-4">
        <IconBadge
          name={project.icon}
          size="sm"
          themeTreatment={project.iconThemeTreatment || "monochrome"}
        />
        <div className="min-w-0">
          <CardTitle className="text-[0.96rem] leading-snug">
            {/* The whole card is the link; the GitHub control sits above it. */}
            <a
              href={destination}
              className="text-foreground no-underline after:absolute after:inset-0 after:rounded-lg group-hover:underline"
            >
              {project.shortName}
            </a>
          </CardTitle>
          <CardDescription className="mt-1 text-[0.8rem] leading-snug">
            {project.shortDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {/* Descriptions run 210-290 characters, so they fit without clamping;
            clamping cut most of them mid-sentence. */}
        <p className="text-[0.86rem] leading-6 text-muted-foreground">
          {project.longDescription}
        </p>
      </CardContent>
      <CardFooter className="mt-auto items-center justify-between gap-3 px-4 pt-0 text-xs text-muted-foreground">
        {project.repositoryUrl ? (
          <a
            href={project.repositoryUrl}
            className="relative z-10 inline-flex min-h-7 items-center gap-1.5 rounded-md border bg-background px-2 text-foreground no-underline hover:bg-muted"
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.shortName} on GitHub`}
          >
            GitHub
            <ExternalLink className="size-4" />
          </a>
        ) : (
          <span />
        )}
        {project.version ? (
          <span className="shrink-0 text-[0.72rem] leading-5">
            {project.version}
          </span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
