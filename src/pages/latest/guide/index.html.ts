import type { APIRoute } from "astro";

import { withBasePath } from "@/lib/base-path";
import {
  preservingClientRedirect,
  routeCompatibilityEntry,
} from "@/lib/route-compatibility";

export const GET: APIRoute = () => {
  const compatibility = routeCompatibilityEntry("docs-core-latest-guide-index");
  return preservingClientRedirect(
    withBasePath(compatibility.previewDestinationPath),
    "Micronaut Core docs",
  );
};
