import type { APIRoute, GetStaticPaths } from "astro";

import { readGeneratedGuidesManifest } from "@/lib/generated-guides";
import { productionUrl } from "@/lib/route-compatibility";
import { shouldBuildGuidesRoutes } from "@/lib/surface-routes";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!shouldBuildGuidesRoutes()) {
    return [];
  }
  const manifest = await readGeneratedGuidesManifest();
  return manifest.guides.flatMap((guide) =>
    guide.options.map((option) => ({
      params: { download: option.zipUrl.replace(/\.zip$/, "") },
      props: { zipUrl: productionUrl("guides", option.zipUrl) }
    }))
  );
};

export const GET: APIRoute<{ zipUrl: string }> = ({ props, redirect }) => {
  return redirect(props.zipUrl, 302);
};
