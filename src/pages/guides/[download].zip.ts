import type { APIRoute, GetStaticPaths } from "astro";

import { readGeneratedGuidesManifest } from "@/lib/generated-guides";
import { productionUrl } from "@/lib/route-compatibility";

export const getStaticPaths: GetStaticPaths = async () => {
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
