export type ThemeMode = "light" | "dark";

export const THEME_MODE_STORAGE_KEY = "micronaut-web-theme-mode";
export const LEGACY_THEME_STORAGE_KEY = "micronaut-web-theme";
export const THEME_MODE_QUERY_PARAMETER = "theme";
export const THEME_MODE_COOKIE_NAME = "micronaut-theme-mode";

/**
 * localStorage is per origin, so a choice made on docs.micronaut.io never
 * reached micronaut.io or guides.micronaut.io. A cookie on the registrable
 * parent domain is shared by all three; browsers refuse it on public-suffix
 * hosts such as github.io (and it is pointless on localhost), where the
 * host-only localStorage entry keeps working on its own.
 */
export function themeModeCookie(mode: ThemeMode, hostname: string): string {
  const labels = hostname.split(".");
  const domain =
    labels.length > 1 && !/^\d+$/.test(labels[labels.length - 1])
      ? `; domain=.${labels.slice(-2).join(".")}`
      : "";
  return `${THEME_MODE_COOKIE_NAME}=${mode}; path=/; max-age=31536000; SameSite=Lax${domain}`;
}
