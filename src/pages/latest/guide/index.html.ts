import type { APIRoute } from "astro";

import { withBasePath } from "@/lib/base-path";
import { appendRequestSearch, routeCompatibilityEntry } from "@/lib/route-compatibility";

export const GET: APIRoute = ({ redirect, url }) => {
  const compatibility = routeCompatibilityEntry("docs-core-latest-guide-index");
  const status = compatibility.status === 200 ? 301 : compatibility.status;
  return redirect(appendRequestSearch(withBasePath(compatibility.previewDestinationPath), url), status);
};
