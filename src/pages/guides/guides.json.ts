import type { APIRoute } from "astro";

import { guidesCatalogDocument } from "@/lib/generated-guide-feeds";
import { readGeneratedGuidesManifest } from "@/lib/generated-guides";

export const prerender = true;

export const GET: APIRoute = async () => {
  const manifest = await readGeneratedGuidesManifest();

  return new Response(
    `${JSON.stringify(guidesCatalogDocument(manifest), null, 2)}\n`,
    {
      headers: {
        "cache-control": "public, max-age=300",
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
};
