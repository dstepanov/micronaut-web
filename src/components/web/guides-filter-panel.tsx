import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IconGlyph } from "@/components/web/icon-glyph";
import { withBasePath } from "@/lib/base-path";
import {
  guideCategories,
  staticGeneratedGuidesManifest,
} from "@/lib/content-catalog";

export function GuidesFilterPanel() {
  const topTags = Array.from(
    new Set(staticGeneratedGuidesManifest.guides.flatMap((guide) => guide.tags)),
  )
    .sort()
    .slice(0, 36);
  const categories = guideCategories();

  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="grid gap-5 p-2">
          <section className="grid gap-2">
            <h2 className="px-2 text-[0.72rem] font-normal text-muted-foreground">Topics</h2>
            {categories.slice(0, 18).map((category) => (
              <a
                key={category.slug}
                href={withBasePath(`/guides/?category=${category.slug}`)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.82rem] leading-5 text-sidebar-foreground/80 no-underline hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <IconGlyph name={category.icon} className="size-3.5" />
                <span>{category.name}</span>
              </a>
            ))}
          </section>
          <Separator className="bg-sidebar-border/60" />
          <section className="grid gap-2">
            <h2 className="px-2 text-[0.72rem] font-normal text-muted-foreground">Tags</h2>
            <div className="flex flex-wrap gap-1.5 px-2">
              {topTags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </aside>
  );
}
