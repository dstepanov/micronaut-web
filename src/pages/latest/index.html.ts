import type { APIRoute } from "astro";

import { withBasePath } from "@/lib/base-path";
import { appendRequestSearch } from "@/lib/route-compatibility";

export const GET: APIRoute = ({ redirect, url }) => {
  return redirect(appendRequestSearch(withBasePath("/guides/"), url), 301);
};
