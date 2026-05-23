import type { APIRoute, GetStaticPaths } from "astro";

import { getBlogPosts } from "@/lib/main-site-content";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getBlogPosts();
  return posts.flatMap((post) => post.routeSlugs
    .filter((routeSlug) => routeSlug.startsWith("blog/") && routeSlug.endsWith(".html"))
    .map((routeSlug) => ({
      params: {
        legacySlug: routeSlug.slice("blog/".length, -".html".length)
      },
      props: {
        destination: post.href
      }
    })));
};

export const GET: APIRoute<{ destination: string }> = ({ props, redirect }) => {
  return redirect(props.destination, 301);
};
