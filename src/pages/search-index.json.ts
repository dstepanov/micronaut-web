import { searchItems } from "@/lib/content-catalog";

export const prerender = true;

/**
 * The site-mode search catalog. It used to be imported straight into
 * `SearchDialog`, which put the 82 KB docs fixture and the guides fixture in
 * the eagerly hydrated header bundle on every page. The dialog fetches this
 * route when it opens instead, the way docs mode already did.
 */
export function GET() {
  return new Response(JSON.stringify({ items: searchItems() }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
