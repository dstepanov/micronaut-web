import { productionUrl } from "../../src/lib/route-compatibility.ts";

const guidesPrefix = "/micronaut-guides-v2/";
const docsPrefix = "/micronaut-docs-v2/";

export function rewriteMicronautSiteUrl(value: string): string | undefined {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }

  if (url.hostname !== "micronaut-projects.github.io") {
    return undefined;
  }

  if (url.pathname.startsWith(guidesPrefix)) {
    const guidePath = url.pathname
      .slice(guidesPrefix.length)
      .replace(/^latest\//, "");
    const pathname = guidePath.endsWith(".zip")
      ? guidePath
      : guidePath.replace(/\.html$/i, "").replace(/\/?$/, "/");
    return `${productionUrl("guides", pathname)}${url.search}${url.hash}`;
  }

  if (url.pathname.startsWith(docsPrefix)) {
    return `${productionUrl("docs", url.pathname.slice(docsPrefix.length))}${url.search}${url.hash}`;
  }

  return undefined;
}
