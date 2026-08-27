import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DEFAULT_GUIDE_VARIANT_PREFERENCE,
  GUIDE_VARIANT_PREFERENCE_EVENT,
  readGuideVariantPreference,
  saveGuideVariantPreference,
  type GuideVariantPreference,
} from "@/lib/guide-variant-preference";

const LANGUAGES = [
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "groovy", label: "Groovy" },
];
const PYTHON_LANGUAGE = { value: "python", label: "Python" };
const BUILD_TOOLS = [
  { value: "gradle", label: "Gradle" },
  { value: "maven", label: "Maven" },
];
const PYTHON_BUILD_TOOLS = [{ value: "pyronaut", label: "Pyronaut" }];

/**
 * Guides generate Python only for Pyronaut and Pyronaut only for Python, so
 * the build group offers what the picked language actually builds with rather
 * than a pairing no guide has a variant for.
 */
function buildToolsFor(language: string) {
  return language === "python" ? PYTHON_BUILD_TOOLS : BUILD_TOOLS;
}

/**
 * Site-wide language/build preference for guide links. Persisted, so "Read"
 * on every card opens the preferred variant instead of the Java/Gradle
 * default; guides without an exact match fall back per `matchGuideVariant`.
 *
 * `python` offers the language only where guides render a Pyronaut variant,
 * the same condition the catalog's Python filter uses: on a guides repository
 * without them the preference is one nothing can satisfy, and because it is
 * persisted the reader keeps a selection no card ever reflects.
 */
export function GuideVariantPreferencePicker({
  python = false,
}: {
  python?: boolean;
}) {
  const languages = python ? [...LANGUAGES, PYTHON_LANGUAGE] : LANGUAGES;
  const [preference, setPreference] = useState<GuideVariantPreference>(
    DEFAULT_GUIDE_VARIANT_PREFERENCE,
  );

  useEffect(() => {
    const stored = readGuideVariantPreference();
    if (stored) {
      // A preference stored while Python was on offer would otherwise leave
      // every language unpressed once it is not.
      setPreference(
        stored.language === PYTHON_LANGUAGE.value && !python
          ? DEFAULT_GUIDE_VARIANT_PREFERENCE
          : stored,
      );
    }

    function onPreferenceChange(event: Event) {
      const detail = (event as CustomEvent<GuideVariantPreference>).detail;
      if (detail) {
        setPreference(detail);
      }
    }

    window.addEventListener(GUIDE_VARIANT_PREFERENCE_EVENT, onPreferenceChange);
    return () => {
      window.removeEventListener(
        GUIDE_VARIANT_PREFERENCE_EVENT,
        onPreferenceChange,
      );
    };
  }, []);

  function update(next: Partial<GuideVariantPreference>) {
    saveGuideVariantPreference({ ...preference, ...next });
  }

  function selectLanguage(language: string) {
    const buildTools = buildToolsFor(language);
    update({
      language,
      buildTool: buildTools.some(
        (buildTool) => buildTool.value === preference.buildTool,
      )
        ? preference.buildTool
        : buildTools[0].value,
    });
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap">
      <ButtonGroup aria-label="Preferred guide language">
        {languages.map((language) => (
          <Button
            key={language.value}
            size="sm"
            variant={
              preference.language === language.value ? "default" : "outline"
            }
            aria-pressed={preference.language === language.value}
            onClick={() => selectLanguage(language.value)}
          >
            {language.label}
          </Button>
        ))}
      </ButtonGroup>
      <ButtonGroup aria-label="Preferred guide build tool">
        {buildToolsFor(preference.language).map((buildTool) => (
          <Button
            key={buildTool.value}
            size="sm"
            variant={
              preference.buildTool === buildTool.value ? "default" : "outline"
            }
            aria-pressed={preference.buildTool === buildTool.value}
            onClick={() => update({ buildTool: buildTool.value })}
          >
            {buildTool.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
