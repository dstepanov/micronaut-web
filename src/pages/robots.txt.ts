import type { APIRoute } from "astro";

/**
 * Emitted per surface: each deployment publishes its own sitemap, so the
 * Sitemap line has to be resolved from the site and base of this build.
 */
export const GET: APIRoute = ({ site }) => {
  const basePath = import.meta.env.BASE_URL || "/";
  const sitemapUrl = new URL(
    `${basePath}sitemap-index.xml`.replace(/\/{2,}/g, "/"),
    site,
  ).toString();
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
