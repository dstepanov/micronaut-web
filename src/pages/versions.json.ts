import docsVersions from "@/data/docs-versions.json";

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(docsVersions, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
