import { readProgrammingLanguageCookiePreference } from "@/lib/programming-language-preference";

export type GuideVariantPreference = {
  language: string;
  buildTool: string;
};

export const GUIDE_VARIANT_PREFERENCE_STORAGE_KEY =
  "micronaut-guides-variant-preference";
export const GUIDE_VARIANT_PREFERENCE_EVENT =
  "micronaut-guides-variant-preference-change";

/** Matches `preferredGuideOption`, so stored and server defaults agree. */
export const DEFAULT_GUIDE_VARIANT_PREFERENCE: GuideVariantPreference = {
  language: "java",
  buildTool: "gradle",
};

export function isGuideVariantPreference(
  value: unknown,
): value is GuideVariantPreference {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as GuideVariantPreference).language === "string" &&
    typeof (value as GuideVariantPreference).buildTool === "string"
  );
}

export function readGuideVariantPreference():
  GuideVariantPreference | undefined {
  let stored: GuideVariantPreference | undefined;
  try {
    const serialized = localStorage.getItem(
      GUIDE_VARIANT_PREFERENCE_STORAGE_KEY,
    );
    if (serialized) {
      const parsed: unknown = JSON.parse(serialized);
      if (isGuideVariantPreference(parsed)) {
        stored = parsed;
      }
    }
  } catch {
    stored = undefined;
  }

  const globalLanguage = readProgrammingLanguageCookiePreference();
  if (globalLanguage) {
    return {
      language: globalLanguage,
      buildTool:
        stored?.buildTool ?? DEFAULT_GUIDE_VARIANT_PREFERENCE.buildTool,
    };
  }
  return stored;
}

export function saveGuideVariantPreference(preference: GuideVariantPreference) {
  try {
    localStorage.setItem(
      GUIDE_VARIANT_PREFERENCE_STORAGE_KEY,
      JSON.stringify(preference),
    );
  } catch {
    // The change event still updates the current page without storage.
  }
  window.dispatchEvent(
    new CustomEvent<GuideVariantPreference>(GUIDE_VARIANT_PREFERENCE_EVENT, {
      detail: preference,
    }),
  );
}

/**
 * Best variant for a preference: exact language and build tool match, then
 * language-only, mirroring the server-side `preferredGuideOption` fallbacks.
 */
export function matchGuideVariant<
  Variant extends { language: string; buildTool: string },
>(variants: Variant[], preference: GuideVariantPreference) {
  return (
    variants.find(
      (variant) =>
        variant.language === preference.language &&
        variant.buildTool === preference.buildTool,
    ) || variants.find((variant) => variant.language === preference.language)
  );
}
