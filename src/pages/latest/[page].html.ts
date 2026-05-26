import type { APIRoute, GetStaticPaths } from "astro";

import {
  allGeneratedGuideTags,
  guideOptionPath,
  guideOverviewPath,
  guideTagPath,
  readGeneratedGuidesManifest,
  tagSlug
} from "@/lib/generated-guides";
import { withBasePath } from "@/lib/base-path";
import { appendRequestSearch } from "@/lib/route-compatibility";
import { shouldBuildGuidesRoutes } from "@/lib/surface-routes";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!shouldBuildGuidesRoutes()) {
    return [];
  }
  const manifest = await readGeneratedGuidesManifest();
  const paths: Array<{ params: { page: string }; props: { destination: string } }> = [];
  const pages = new Set<string>();
  const addPath = (page: string, destination: string) => {
    if (pages.has(page)) {
      return;
    }
    pages.add(page);
    paths.push({
      params: { page },
      props: { destination }
    });
  };

  for (const tag of allGeneratedGuideTags(manifest.guides)) {
    addPath(`tag-${tagSlug(tag)}`, guideTagPath(tag).replace(/\.html$/, "/"));
  }
  for (const guide of manifest.guides) {
    addPath(guide.slug, guideOverviewPath(guide).replace(/\.html$/, "/"));
    for (const option of guide.options) {
      addPath(option.file.replace(/\.html$/, ""), guideOptionPath(option).replace(/\.html$/, "/"));
    }
  }

  return paths;
};

export const GET: APIRoute<{ destination: string }> = ({ props, redirect, url }) => {
  return redirect(
    appendRequestSearch(withBasePath(props.destination), url),
    301
  );
};
