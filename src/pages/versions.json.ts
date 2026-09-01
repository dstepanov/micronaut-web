import docsVersions from "@/data/docs-versions.json";
import { docsRoot, isDocsSnapshot } from "@/lib/deployment-config";

export const prerender = true;

// The snapshot deployment hosts no release line, so the manifest it serves
// names the one tree it has rather than the lines the released host serves.
const versions = isDocsSnapshot
  ? { versions: [{ label: "Snapshot", href: `${docsRoot}/`, current: true }] }
  : docsVersions;

export function GET() {
  return new Response(JSON.stringify(versions, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
