import type { APIRoute, GetStaticPaths } from "astro";

import {
  allGeneratedGuideTags,
  guideCategoryPath,
  guideOptionPath,
  preferredGuideOption,
  guideTagPath,
  readGeneratedGuidesManifest,
  tagSlug,
} from "@/lib/generated-guides";
import { withBasePath } from "@/lib/base-path";
import { preservingClientRedirect } from "@/lib/route-compatibility";
import { shouldBuildGuidesRoutes } from "@/lib/surface-routes";

const guidesRoot = "/guides";

/**
 * Tag pages older guides.micronaut.io builds published for since-retired
 * categories. Guide content and external sites still link to them — production
 * keeps serving the stale files because its deploys only accumulate — so each
 * redirects to the current listing of the same guides.
 */
const legacyTagDestinations: Record<string, string> = {
  spring_boot_to_micronaut: guideTagPath("spring-boot", guidesRoot),
  building_a_rest_api: guideCategoryPath(
    "Boot to Micronaut Building a REST API",
    guidesRoot,
  ),
};

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
    const destination = guideTagPath(tag, guidesRoot).replace(/\.html$/, "/");
    const canonicalTagSlug = tagSlug(tag);
    addPath(`tag-${canonicalTagSlug}`, destination);
    addPath(`tag-${canonicalTagSlug.replaceAll("-", "_")}`, destination);
  }
  for (const [slug, destination] of Object.entries(legacyTagDestinations)) {
    addPath(`tag-${slug}`, destination);
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

export const GET: APIRoute<{ destination: string }> = ({ props }) => {
  return preservingClientRedirect(
    withBasePath(props.destination),
    "the Micronaut guide",
  );
};
