import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";

export function MicronautLogo({
  assetBaseUrl,
  className,
}: {
  assetBaseUrl?: string;
  className?: string;
}) {
  const assetPath = (path: string) =>
    assetBaseUrl
      ? new URL(
          path.replace(/^\/+/, ""),
          normalizedBaseUrl(assetBaseUrl),
        ).toString()
      : withBasePath(path);

  return (
    <span
      className={cn(
        "relative inline-flex h-11 w-[168px] items-center",
        className,
      )}
      aria-hidden="true"
    >
      <img
        className="block h-full w-auto object-contain dark:hidden"
        src={assetPath(
          "/micronaut-assets/logos/micronaut-horizontal-black.svg",
        )}
        width={305}
        height={96}
        alt=""
      />
      <img
        className="hidden h-full w-auto object-contain dark:block"
        src={assetPath(
          "/micronaut-assets/logos/micronaut-horizontal-white.svg",
        )}
        width={305}
        height={96}
        alt=""
      />
    </span>
  );
}

function normalizedBaseUrl(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}
