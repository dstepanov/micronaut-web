import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";

export function MicronautLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-11 w-[168px] items-center", className)} aria-hidden="true">
      <img
        className="block h-full w-auto object-contain dark:hidden"
        src={withBasePath("/micronaut-assets/logos/micronaut-horizontal-black.svg")}
        width={305}
        height={96}
        alt=""
      />
      <img
        className="hidden h-full w-auto object-contain dark:block"
        src={withBasePath("/micronaut-assets/logos/micronaut-horizontal-white.svg")}
        width={305}
        height={96}
        alt=""
      />
    </span>
  );
}
