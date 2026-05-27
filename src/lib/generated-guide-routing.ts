export type GeneratedGuideOption = {
  id: string;
  label: string;
  language: string;
  languageLabel: string;
  buildTool: string;
  buildToolLabel: string;
  file: string;
  fragment: string;
  zipUrl: string;
};

export type GeneratedGuide = {
  slug: string;
  title: string;
  intro: string;
  authors: string[];
  tags: string[];
  categories: string[];
  publicationDate: string;
  estimatedMinutes: number;
  overviewFile: string;
  defaultOptionFile: string;
  options: GeneratedGuideOption[];
};

export type GeneratedGuidesManifest = {
  generatedAt: string;
  guideCount: number;
  guides: GeneratedGuide[];
};

export function allGeneratedGuideTags(guides: Array<{ tags: string[] }>) {
  return Array.from(new Set(guides.flatMap((guide) => guide.tags))).sort();
}

export function tagSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function guideOptionPath(
  option: GeneratedGuideOption,
  root = "/latest",
) {
  return `${normalizedRoot(root)}/${option.file}`;
}

export function guideOverviewPath(guide: GeneratedGuide, root = "/latest") {
  return `${normalizedRoot(root)}/${guide.overviewFile}`;
}

export function preferredGuideOption(guide: GeneratedGuide) {
  return (
    guide.options.find(
      (option) => option.language === "java" && option.buildTool === "gradle",
    ) ||
    guide.options.find((option) => option.file === guide.defaultOptionFile) ||
    guide.options.find((option) => option.language === "java") ||
    guide.options[0]
  );
}

export function guideTagPath(tag: string, root = "/latest") {
  return `${normalizedRoot(root)}/tag-${tagSlug(tag)}.html`;
}

export function latestGuides(guides: GeneratedGuide[], limit = 8) {
  return [...guides]
    .sort(
      (left, right) =>
        right.publicationDate.localeCompare(left.publicationDate) ||
        left.title.localeCompare(right.title),
    )
    .slice(0, limit);
}

function normalizedRoot(root: string) {
  const value = root.endsWith("/") ? root.slice(0, -1) : root;
  return value || "";
}
