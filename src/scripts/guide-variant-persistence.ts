import { saveGuideVariantPreference } from "@/lib/guide-variant-preference";

// Choosing a variant from the guide reader's "Different variants" list stores
// the same preference the guides index uses for its "Read" links.
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const link = target.closest<HTMLAnchorElement>(
    "a[data-guide-variant-language][data-guide-variant-build-tool]",
  );
  const language = link?.dataset.guideVariantLanguage;
  const buildTool = link?.dataset.guideVariantBuildTool;
  if (language && buildTool) {
    saveGuideVariantPreference({ language, buildTool });
  }
});
