/**
 * Base path of the guides surface. Lives here rather than in the route's
 * frontmatter because Astro hoists `getStaticPaths` into its own bundle,
 * where only imported bindings are in scope.
 */
export const GUIDES_ROOT = "/guides";

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
  return guidePagePath(option.file, root);
}

export function guideOverviewPath(guide: GeneratedGuide, root = "/latest") {
  const option = preferredGuideOption(guide);
  return option
    ? guideOptionPath(option, root)
    : guidePagePath(guide.overviewFile, root);
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
  return `${normalizedRoot(root)}/tag-${tagSlug(tag)}/`;
}

/** Category filter on the guides index; applied client-side on the static page. */
export function guideCategoryPath(category: string, root = "/latest") {
  return `${normalizedRoot(root)}/?category=${tagSlug(category)}`;
}

/**
 * How the upstream guides index identified a category in URLs and anchors: by
 * the Java enum constant name, which is not always the slug of the title it
 * displays ("Testing" was `TEST`, "MongoDB" was `DATA_MONGO`). That index gave
 * every category section an `id="<name>"` and linked a `tag-<name>.html` page
 * beside it, so both forms have to keep resolving here.
 */
const legacyCategoryNames: Record<string, string> = {
  getting_started: "Getting Started",
  core_basics: "Core Basics",
  validation: "Validation",
  development: "Development",
  test: "Testing",
  mcp: "MCP",
  object_storage: "Object Storage",
  email: "Email",
  messaging: "Messaging",
  logging: "Logging",
  scheduling: "Scheduling",
  cache: "Cache",
  patterns: "Patterns",
  internationalization: "i18n",
  database_modeling: "Database Modeling",
  data_jdbc: "Data JDBC",
  data_jpa: "Data JPA",
  schema_migration: "Schema Migration",
  data_rdbc: "Data R2DBC",
  data_mongo: "MongoDB",
  data_access: "Data Access",
  security: "Micronaut Security",
  authorization_code: "Authorization Code",
  client_credentials: "Client Credentials",
  secrets_manager: "Secrets Manager",
  http: "HTTP Server",
  http_client: "HTTP Client",
  beyond_json: "Beyond JSON",
  jax_rs: "JAX-RS",
  websockets: "WebSockets",
  graphql: "GraphQL",
  open_api: "OpenAPI",
  json_schema: "JSON Schema",
  distributed_tracing: "Distributed Tracing",
  service_discovery: "Service Discovery",
  distributed_configuration: "Distributed Configuration",
  metrics: "Metrics",
  distribution: "Distribution",
  registry: "Registry",
  graalvm: "GraalVM",
  crac: "Coordinated Restore at Checkpoint",
  kubernetes: "Kubernetes",
  serverless: "Serverless",
  aws_lambda: "AWS Lambda",
  scale_to_zero_containers: "Scale to Zero Containers",
  views: "Views",
  turbo: "Turbo",
  static_resources: "Static Resources",
  kotlin: "Kotlin",
  graalpy: "GraalPy",
  spring: "Spring Boot",
  spring_boot_to_micronaut_building_a_rest_api:
    "Boot to Micronaut Building a REST API",
};

/**
 * Categories the upstream index published tag pages for that have since been
 * renamed. Their pages survive on the legacy host only because its deploys
 * accumulate files, but guide content still links to them.
 */
const retiredCategoryNames: Record<string, string> = {
  spring_boot_to_micronaut: "Spring Boot",
  building_a_rest_api: "Boot to Micronaut Building a REST API",
};

/**
 * Legacy `tag-*` slugs that no current tag produces, each mapped to the tag
 * page now listing the same guides. Categories become tags, so a category's
 * own tag page is the destination for the name the old index used for it.
 */
export function legacyGuideTagRedirects(
  root = "/latest",
): Array<[slug: string, destination: string]> {
  return Object.entries({
    ...legacyCategoryNames,
    ...retiredCategoryNames,
  }).map(([name, category]) => [name, guideTagPath(category, root)]);
}

/** The id the upstream index gave this category's section, for old deep links. */
export function legacyCategoryAnchor(category: string): string | undefined {
  return Object.entries(legacyCategoryNames).find(
    ([, title]) => title === category,
  )?.[0];
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

function guidePagePath(file: string, root: string) {
  return `${normalizedRoot(root)}/${file.replace(/\.html$/, "")}/`;
}
