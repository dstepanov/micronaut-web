"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuideCard } from "@/components/web/guide-card";
import { ProjectCard } from "@/components/web/project-card";
import {
  featuredGuides,
  featuredProjects,
  latestGuideSummaries,
} from "@/lib/content-catalog";

export function HomeTabbedShowcase() {
  const projects = featuredProjects();
  const guides = featuredGuides();
  const latest = latestGuideSummaries(6);

  return (
    <Tabs defaultValue="projects" className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="projects">Featured projects</TabsTrigger>
          <TabsTrigger value="guides">Featured guides</TabsTrigger>
          <TabsTrigger value="latest">Latest guides</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="projects">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </TabsContent>
      <TabsContent value="guides">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {guides.slice(0, 8).map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
        </div>
      </TabsContent>
      <TabsContent value="latest">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latest.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
        </div>
      </TabsContent>
    </Tabs>
  );
}
