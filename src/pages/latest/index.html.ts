import type { APIRoute } from "astro";

import { withBasePath } from "@/lib/base-path";
import { preservingClientRedirect } from "@/lib/route-compatibility";

export const GET: APIRoute = () => {
  return preservingClientRedirect(withBasePath("/guides/"));
};
