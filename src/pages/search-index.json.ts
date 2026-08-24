import { searchItems, type BlogSearchPost } from "@/lib/content-catalog";
import { loadDocsProjectCatalog } from "@/lib/docs-project-catalog";
import { docsProjectFromCatalog } from "@/lib/content-catalog";
import { readGeneratedGuidesManifest } from "@/lib/generated-guides";
import { cleanExcerptText, getBlogPosts } from "@/lib/main-site-content";

export const prerender = true;

/**
 * The site-mode search catalog. The dialog fetches this route when it opens
 * rather than importing the catalog, which would put it in the eagerly
 * hydrated header bundle on every page.
 *
 * Everything here reads the *generated* content. Building it from the
 * checked-in `@/data` samples published an index that knew 4 of 177 guides
 * and none of the blog posts.
 */
export async function GET() {
  const [catalog, guidesManifest, posts] = await Promise.all([
    loadDocsProjectCatalog(),
    readGeneratedGuidesManifest(),
    getBlogPosts(),
  ]);

  const items = searchItems({
    projects: catalog.projects.map(docsProjectFromCatalog),
    guides: guidesManifest.guides,
    posts: posts.map(({ entry, href }): BlogSearchPost => {
      const { title, description, categories, tags } = entry.data;
      return {
        title,
        // Post excerpts run to a few hundred characters; the result row only
        // ever shows one line, and 300 posts of full excerpt bloat the index.
        description: excerpt(cleanExcerptText(description)),
        href,
        topics: [...categories, ...tags],
      };
    }),
  });

  return new Response(JSON.stringify({ items }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function excerpt(value: string, limit = 180) {
  if (value.length <= limit) {
    return value;
  }
  const clipped = value.slice(0, limit);
  const boundary = clipped.lastIndexOf(" ");
  return `${(boundary > 0 ? clipped.slice(0, boundary) : clipped).trimEnd()}…`;
}
