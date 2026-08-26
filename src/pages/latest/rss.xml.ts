import type { APIRoute } from "astro";

import { guidesRssDocument } from "@/lib/generated-guide-feeds";
import { readGeneratedGuidesManifest } from "@/lib/generated-guides";

export const prerender = true;

export const GET: APIRoute = async () => {
  const manifest = await readGeneratedGuidesManifest();

  return new Response(guidesRssDocument(manifest), {
    headers: {
      "cache-control": "public, max-age=300",
      "content-type": "application/rss+xml; charset=utf-8",
    },
  });
};
