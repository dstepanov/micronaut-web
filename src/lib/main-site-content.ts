import { getCollection, render, type CollectionEntry } from "astro:content";

import { withBasePath } from "@/lib/base-path";
import { routeSlugsForPost } from "@/lib/blog-redirects";
import {
  extractFaqItemsFromHtml,
  type MainSiteFaqItem,
} from "@/lib/main-site-faq";
import { renderMainSiteCodeSnippets } from "@/lib/main-site-code-snippets";
import { rewriteRootRelativeHtml } from "@/lib/main-site-link-rewrite";

export type MainSitePageEntry = CollectionEntry<"mainSitePages">;
export type BlogPostEntry = CollectionEntry<"blogPosts">;

export type MainSitePageModel = {
  slug: string;
  entry: MainSitePageEntry;
};

export type MainSitePageSummary = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
};

export type GeneratedMainSitePage = MainSitePageSummary & {
  intro: string;
};

export type MainSiteFooterGroup = {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

export type BlogPostModel = {
  slug: string;
  href: string;
  routeSlugs: string[];
  entry: BlogPostEntry;
};

export type BlogArchiveModel = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  page?: number;
  totalPages?: number;
};

export function isGeneralBlogPost(post: BlogPostModel): boolean {
  const categories = new Set([
    post.entry.data.category,
    ...post.entry.data.categories,
  ]);
  return (
    !categories.has("release-announcements") &&
    !categories.has("success-story")
  );
}

export type SuccessStory = {
  title: string;
  organization: string;
  tag: string;
  summary: string;
  detail: string;
  proofs: string[];
  scenario: string;
  challenge: string;
  micronautUse: string;
  outcome: string;
  technologies: string[];
  href: string;
  sourceUrl?: string;
  logo?: string;
  logoDark?: string;
  logoClass?: string;
  logoInvertOnDark: boolean;
};

export type { MainSiteFaqItem };

export const generatedMainSitePages: GeneratedMainSitePage[] = [
  {
    slug: "micronaut-success-stories",
    title: "Micronaut Success Stories",
    eyebrow: "Resources",
    description:
      "Real teams use Micronaut for serverless APIs, Grails migrations, workflow orchestration, IoT microservices, event platforms, legacy tool upgrades, and SaaS backends.",
    intro:
      "The success stories index is generated from the metadata on each success-story page.",
  },
];

function slugFromEntry(entry: { id: string }) {
  return entry.id.replace(/\.md$/, "").replace(/\/index$/, "");
}

export function normalizeRouteSlug(slug: string) {
  return slug.replace(/^\/+|\/+$/g, "");
}

function localMainSiteResourcePath(pathname: string) {
  return `/micronaut-assets/main-site${pathname}`;
}

function rewriteMicronautPath(pathname: string) {
  if (pathname.startsWith("/wp-content/uploads/")) {
    return localMainSiteResourcePath(pathname);
  }
  return pathname;
}

function byOrderThenTitle<
  T extends { entry: { data: { order?: number; title: string } } },
>(left: T, right: T) {
  return (
    (left.entry.data.order ?? Number.MAX_SAFE_INTEGER) -
      (right.entry.data.order ?? Number.MAX_SAFE_INTEGER) ||
    left.entry.data.title.localeCompare(right.entry.data.title)
  );
}

function byPostDateThenOrder(left: BlogPostModel, right: BlogPostModel) {
  const leftDate = left.entry.data.date?.getTime() ?? 0;
  const rightDate = right.entry.data.date?.getTime() ?? 0;
  return rightDate - leftDate || byOrderThenTitle(left, right);
}

export const mainSiteFooterGroups: MainSiteFooterGroup[] = [
  {
    title: "Resources",
    links: [
      { label: "Download", href: "/download/" },
      { label: "CLI", href: "/cli/" },
      { label: "Blog", href: "/blog/" },
      { label: "Success Stories", href: "/micronaut-success-stories/" },
      { label: "FAQ", href: "/faq/" },
    ],
  },
  {
    title: "Security",
    links: [
      {
        label: "Security Announcements",
        href: "/category/security-announcements/",
      },
      {
        label: "Security Advisory Disclosure",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/SECURITY_ADVISORY_DISCLOSURE.md",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Brand Guidelines", href: "/brand-guidelines/" },
      { label: "Logos", href: "/brand-guidelines/micronaut-logos/" },
      {
        label: "Contributor License Agreement",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/CONTRIBUTOR_LICENSE_AGREEMENT.md",
      },
      {
        label: "Intellectual Property",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/INTELLECTUAL_PROPERTY.md",
      },
      {
        label: "Trademark Policy",
        href: "/brand-guidelines/micronaut-trademark-policy/",
      },
    ],
  },
  {
    // Curated shortlist: every policy lives in the micronaut-policies repo, and
    // listing all fifteen made the footer roughly a fifth of the page height.
    title: "Policies",
    links: [
      {
        label: "Governance",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/GOVERNANCE.md",
      },
      {
        label: "Maintainers",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/MAINTAINERS.md",
      },
      {
        label: "Contributing",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/CONTRIBUTING.md",
      },
      {
        label: "Code of Conduct",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/CODE_OF_CONDUCT.md",
      },
      {
        label: "Conflict",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/CONFLICT.md",
      },
      {
        label: "Succession",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/SUCCESSION.md",
      },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Commercial Support", href: "/support/" },
      { label: "Partners", href: "/partners/" },
    ],
  },
  {
    title: "Planning",
    links: [
      {
        label: "Release Announcements",
        href: "/category/release-announcements/",
      },
      { label: "Roadmap", href: "/micronaut-roadmap/" },
      {
        label: "Versioning",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/VERSIONS_POLICY.md",
      },
      {
        label: "Release Management",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/RELEASE_MANAGEMENT.md",
      },
      {
        label: "Release Cadence",
        href: "https://github.com/micronaut-projects/micronaut-policies/blob/main/RELEASE_CADENCE.md",
      },
    ],
  },
  {
    title: "Learning",
    links: [
      { label: "Guides", href: "/guides/" },
      { label: "Docs", href: "/docs/" },
      {
        label: "Free Course",
        href: "https://mylearn.oracle.com/ou/course/micronaut-fundamentals/151938/",
      },
      { label: "Podcast", href: "https://micronautpodcast.com" },
    ],
  },
];

export async function getMainSitePages(): Promise<MainSitePageModel[]> {
  const entries = await getCollection("mainSitePages");
  return entries
    .map((entry: MainSitePageEntry) => ({
      slug: slugFromEntry(entry),
      entry,
    }))
    .sort(byOrderThenTitle);
}

export async function getMainSitePageSummaries(): Promise<
  MainSitePageSummary[]
> {
  const pages = await getMainSitePages();
  return [
    ...generatedMainSitePages,
    ...pages.map(({ slug, entry }) => ({
      slug,
      title: entry.data.title,
      eyebrow: entry.data.eyebrow,
      description: cleanExcerptText(entry.data.description),
    })),
  ];
}

let blogPostsPromise: Promise<BlogPostModel[]> | undefined;

/**
 * Memoized: every static page in `[...slug].astro` calls this, archive or not,
 * and the collection is immutable for the lifetime of a build.
 */
export function getBlogPosts(): Promise<BlogPostModel[]> {
  return (blogPostsPromise ??= getCollection("blogPosts").then(
    (entries: BlogPostEntry[]) =>
      entries
        .map((entry: BlogPostEntry) => ({
          slug: entry.data.slug,
          href: entry.data.href ?? `/${entry.data.slug}/`,
          routeSlugs: routeSlugsForPost(entry.data.slug),
          entry,
        }))
        .sort(byPostDateThenOrder),
  ));
}

export async function getBlogPostByRouteSlug(
  slug: string,
): Promise<BlogPostModel | undefined> {
  const routeSlug = normalizeRouteSlug(slug);
  const posts = await getBlogPosts();
  return posts.find((post) => post.routeSlugs.includes(routeSlug));
}

export async function getBlogPostsForArchive(
  slug: string,
): Promise<BlogPostModel[]> {
  const posts = await getBlogPosts();
  const pageSize = 24;
  if (slug === "blog") {
    return posts.filter(isGeneralBlogPost).slice(0, pageSize);
  }
  const blogPageMatch = slug.match(/^blog\/page\/(\d+)$/);
  if (blogPageMatch) {
    const page = Number(blogPageMatch[1]);
    if (!Number.isInteger(page) || page < 1) {
      return [];
    }
    const blogPosts = posts.filter(isGeneralBlogPost);
    return blogPosts.slice((page - 1) * pageSize, page * pageSize);
  }
  if (slug.startsWith("tag/")) {
    const tagSlug = slug.slice("tag/".length);
    return posts.filter((post) => post.entry.data.tags.includes(tagSlug));
  }
  if (!slug.startsWith("category/")) {
    return [];
  }
  const categorySlug = slug.slice("category/".length);
  return posts.filter(
    (post) =>
      post.entry.data.category === categorySlug ||
      post.entry.data.categories.includes(categorySlug),
  );
}

export async function getBlogArchiveRoutes(): Promise<BlogArchiveModel[]> {
  const posts = await getBlogPosts();
  const blogPosts = posts.filter(isGeneralBlogPost);
  const pageSize = 24;
  const totalPages = Math.ceil(blogPosts.length / pageSize);
  const blogPageRoutes = Array.from(
    { length: Math.max(0, totalPages - 1) },
    (_item, index) => {
      const page = index + 2;
      return {
        slug: `blog/page/${page}`,
        title: `Micronaut Blog - Page ${page}`,
        eyebrow: "Blog",
        description:
          "Browse Micronaut project news, technical articles, release posts, and ecosystem updates.",
        page,
        totalPages,
      };
    },
  );
  const tags = Array.from(
    new Set(posts.flatMap((post) => post.entry.data.tags)),
  )
    .filter(Boolean)
    .sort();
  const tagRoutes = tags.map((tag) => ({
    slug: `tag/${tag}`,
    title: `Micronaut posts tagged ${tag}`,
    eyebrow: "Tag",
    description: `Browse Micronaut blog posts tagged ${tag}.`,
  }));
  return [...blogPageRoutes, ...tagRoutes];
}

export async function getSuccessStories(): Promise<SuccessStory[]> {
  const pages = await getMainSitePages();
  return pages
    .filter((page) => page.slug.startsWith("micronaut-success-stories/"))
    .sort((left, right) => {
      const leftOrder =
        left.entry.data.storyOrder ??
        left.entry.data.order ??
        Number.MAX_SAFE_INTEGER;
      const rightOrder =
        right.entry.data.storyOrder ??
        right.entry.data.order ??
        Number.MAX_SAFE_INTEGER;
      return (
        leftOrder - rightOrder ||
        left.entry.data.title.localeCompare(right.entry.data.title)
      );
    })
    .map(({ slug, entry }) => ({
      title: entry.data.title,
      organization: entry.data.organization ?? entry.data.title,
      tag: entry.data.label ?? "Story",
      summary: entry.data.summary ?? entry.data.description,
      detail: entry.data.detail ?? entry.data.description,
      proofs: entry.data.proofs,
      scenario: entry.data.scenario ?? entry.data.title,
      challenge: entry.data.challenge ?? entry.data.description,
      micronautUse: entry.data.micronautUse ?? entry.data.description,
      outcome: entry.data.outcome ?? entry.data.description,
      technologies: entry.data.technologies,
      href: `/${slug}/`,
      sourceUrl: entry.data.sourceUrl,
      logo: entry.data.logo,
      logoDark: entry.data.logoDark,
      logoClass: entry.data.logoClass,
      logoInvertOnDark: entry.data.logoInvertOnDark,
    }));
}

export async function renderMarkdownHtml(
  entry: MainSitePageEntry | BlogPostEntry,
) {
  await render(entry);
  const html = stripGeneratedPermalinkParagraphs(
    rewriteRootRelativeHtml(
      entry.rendered?.html ?? "",
      withBasePath,
      rewriteMicronautPath,
    ),
  );
  return renderMainSiteCodeSnippets(html);
}

export async function renderFaqItems(
  entry: MainSitePageEntry | BlogPostEntry,
): Promise<MainSiteFaqItem[]> {
  return extractFaqItemsFromHtml(await renderMarkdownHtml(entry));
}

/** Blog categories are stored as slugs, e.g. "release-announcements". */
export function formatCategoryLabel(category: string) {
  const label = category.replace(/-+/g, " ").trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function cleanExcerptText(value: string) {
  return decodeHtml(value)
    .replace(/\s*\[(?:&hellip;|…|\.\.\.)\]\s*$/gi, "...")
    .replace(/\s*\[&amp;hellip;\]\s*$/gi, "...")
    .replace(/\s+/g, " ")
    .trim();
}

function stripGeneratedPermalinkParagraphs(html: string) {
  return html.replace(
    /<p>\s*<a\s+([^>]*\bhref="([^"]+)"[^>]*)>([\s\S]*?)<\/a>\s*<\/p>/gi,
    (match, _attributes: string, href: string, labelHtml: string) => {
      const label = decodeHtml(stripHtml(labelHtml)).trim();
      const decodedHref = decodeHtml(href).trim();
      if (label === decodedHref && isGeneratedPermalink(decodedHref)) {
        return "";
      }
      return match;
    },
  );
}

function isGeneratedPermalink(href: string) {
  try {
    const url = new URL(href);
    return (
      Boolean(url.hash) &&
      url.hostname === "github.com" &&
      url.pathname.includes("/wiki/")
    );
  } catch {
    return false;
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

function decodeHtml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'");
}
