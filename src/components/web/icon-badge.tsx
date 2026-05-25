import { IconGlyph, type IconThemeTreatment } from "@/components/web/icon-glyph";
import { cn } from "@/lib/utils";

type IconBadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

const badgeSizes: Record<IconBadgeSize, string> = {
  xs: "size-7",
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
  xl: "size-11"
};

const iconSizes: Record<IconBadgeSize, string> = {
  xs: "size-3.5",
  sm: "size-[18px]",
  md: "size-5",
  lg: "size-6",
  xl: "size-7"
};

const featureIconSizes: Record<IconBadgeSize, string> = {
  xs: "size-5",
  sm: "size-6",
  md: "size-7",
  lg: "size-8",
  xl: "size-9"
};

export function IconBadge({
  name,
  size = "md",
  className,
  iconClassName,
  themeTreatment = "auto"
}: {
  name: string;
  size?: IconBadgeSize;
  className?: string;
  iconClassName?: string;
  themeTreatment?: IconThemeTreatment;
}) {
  const defaultIconClassName = name.startsWith("feature:") ? featureIconSizes[size] : iconSizes[size];

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full border border-brand-border bg-brand-soft text-brand",
        badgeSizes[size],
        className
      )}
      aria-hidden="true"
    >
      <IconGlyph
        name={name}
        className={cn(defaultIconClassName, iconClassName)}
        themeTreatment={themeTreatment}
      />
    </span>
  );
}
