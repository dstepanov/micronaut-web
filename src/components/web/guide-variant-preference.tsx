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
const BUILD_TOOLS = [
  { value: "gradle", label: "Gradle" },
  { value: "maven", label: "Maven" },
];

/**
 * Site-wide language/build preference for guide links. Persisted, so "Read"
 * on every card opens the preferred variant instead of the Java/Gradle
 * default; guides without an exact match fall back per `matchGuideVariant`.
 */
export function GuideVariantPreferencePicker() {
  const [preference, setPreference] = useState<GuideVariantPreference>(
    DEFAULT_GUIDE_VARIANT_PREFERENCE,
  );

  useEffect(() => {
    const stored = readGuideVariantPreference();
    if (stored) {
      setPreference(stored);
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

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="text-sm text-muted-foreground">Preferred variant</span>
      <ButtonGroup aria-label="Preferred guide language">
        {LANGUAGES.map((language) => (
          <Button
            key={language.value}
            size="sm"
            variant={
              preference.language === language.value ? "default" : "outline"
            }
            aria-pressed={preference.language === language.value}
            onClick={() => update({ language: language.value })}
          >
            {language.label}
          </Button>
        ))}
      </ButtonGroup>
      <ButtonGroup aria-label="Preferred guide build tool">
        {BUILD_TOOLS.map((buildTool) => (
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
