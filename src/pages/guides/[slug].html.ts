import type { APIRoute, GetStaticPaths } from "astro";

import {
  allGeneratedGuideTags,
  guideOptionPath,
  preferredGuideOption,
  guideTagPath,
  readGeneratedGuidesManifest,
  tagSlug,
} from "@/lib/generated-guides";
import { withBasePath } from "@/lib/base-path";
import { appendRequestSearch } from "@/lib/route-compatibility";
import { shouldBuildGuidesRoutes } from "@/lib/surface-routes";

const guidesRoot = "/guides";

export const getStaticPaths: GetStaticPaths = async () => {
  if (!shouldBuildGuidesRoutes()) {
    return [];
  }
  const manifest = await readGeneratedGuidesManifest();
  const paths: Array<{
    params: { slug: string };
    props: { destination: string };
  }> = [];
  const pages = new Set<string>();
  const addPath = (slug: string, destination: string) => {
    if (pages.has(slug)) {
      return;
    }
    pages.add(slug);
    paths.push({
      params: { slug },
      props: { destination },
    });
  };

  for (const tag of allGeneratedGuideTags(manifest.guides)) {
    addPath(
      `tag-${tagSlug(tag)}`,
      guideTagPath(tag, guidesRoot).replace(/\.html$/, "/"),
    );
  }
  for (const guide of manifest.guides) {
    const overviewOption = preferredGuideOption(guide);
    addPath(
      guide.slug,
      (overviewOption
        ? guideOptionPath(overviewOption, guidesRoot)
        : `${guidesRoot}/`
      ).replace(/\.html$/, "/"),
    );
    for (const option of guide.options) {
      addPath(
        option.file.replace(/\.html$/, ""),
        guideOptionPath(option, guidesRoot).replace(/\.html$/, "/"),
      );
    }
  }

  return paths;
};

export const GET: APIRoute<{ destination: string }> = ({
  props,
  redirect,
  url,
}) => {
  return redirect(
    appendRequestSearch(withBasePath(props.destination), url),
    301,
  );
};
