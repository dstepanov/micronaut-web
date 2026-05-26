"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuideCard } from "@/components/web/guide-card";
import { withBasePath } from "@/lib/base-path";
import {
  featuredGuides,
  guideOverviewPath,
  latestGuideSummaries,
  staticGeneratedGuidesManifest,
} from "@/lib/content-catalog";

export function GuidesCatalogTabs() {
  const featured = featuredGuides();
  const latest = latestGuideSummaries(12);
  const all = staticGeneratedGuidesManifest.guides;

  return (
    <Tabs defaultValue="featured" className="gap-6">
      <TabsList>
        <TabsTrigger value="featured">Featured</TabsTrigger>
        <TabsTrigger value="latest">Latest</TabsTrigger>
        <TabsTrigger value="all">All Guides</TabsTrigger>
      </TabsList>
      <TabsContent value="featured">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
        </div>
      </TabsContent>
      <TabsContent value="latest">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latest.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
        </div>
      </TabsContent>
      <TabsContent value="all">
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Guide</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Topic</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Tags</th>
                <th className="px-4 py-3 font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {all.slice(0, 80).map((guide) => (
                <tr key={guide.slug} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">{guide.title}</div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">{guide.intro}</div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{guide.categories[0] || "Guide"}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {guide.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm">
                      <a href={withBasePath(guideOverviewPath(guide, "/guides"))}>Open</a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
