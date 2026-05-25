export type ExperienceTheme = "default" | "runtime";
export type ThemeMode = "system" | "light" | "dark";

export const EXPERIENCE_THEME_STORAGE_KEY = "micronaut-web-experience-theme";
export const THEME_MODE_STORAGE_KEY = "micronaut-web-theme-mode";
export const LEGACY_THEME_STORAGE_KEY = "micronaut-web-theme";
export const RUNTIME_EXPERIENCE_ENABLED = import.meta.env.PUBLIC_MICRONAUT_RUNTIME_THEME !== "off";
