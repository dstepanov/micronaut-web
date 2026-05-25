"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { LEGACY_THEME_STORAGE_KEY, THEME_MODE_STORAGE_KEY, type ThemeMode } from "@/lib/experience-theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  variant?: "default" | "runtime";
  className?: string;
  showLabels?: boolean;
};

const themeModes: Array<{ mode: ThemeMode; label: string; icon: typeof Monitor }> = [
  { mode: "system", label: "System", icon: Monitor },
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon }
];

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveDark(mode: ThemeMode) {
  return mode === "dark" || (mode === "system" && systemPrefersDark());
}

function applyThemeMode(mode: ThemeMode, persist = true) {
  const dark = resolveDark(mode);
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  if (persist) {
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    } catch {
      // The root data attribute keeps the current page usable without storage.
    }
  }
  window.dispatchEvent(new CustomEvent("micronaut-web-theme-mode-change", { detail: { mode, dark } }));
  return dark;
}

export function ThemeToggle({ variant = "default", className, showLabels = false }: ThemeToggleProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [dark, setDark] = useState(false);
  const runtime = variant === "runtime";

  useEffect(() => {
    const rootMode = document.documentElement.dataset.themeMode;
    const initialMode = isThemeMode(rootMode) ? rootMode : "system";
    setThemeMode(initialMode);
    setDark(document.documentElement.classList.contains("dark"));

    const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");

    function syncFromRoot() {
      const rootMode = document.documentElement.dataset.themeMode;
      const nextMode = isThemeMode(rootMode) ? rootMode : "system";
      setThemeMode(nextMode);
      setDark(document.documentElement.classList.contains("dark"));
    }

    function onThemeModeChange(event: Event) {
      const customEvent = event as CustomEvent<{ mode?: ThemeMode; dark?: boolean }>;
      const nextMode = isThemeMode(customEvent.detail?.mode) ? customEvent.detail.mode : "system";
      setThemeMode(nextMode);
      setDark(Boolean(customEvent.detail?.dark));
    }

    function onColorPreferenceChange() {
      if (document.documentElement.dataset.themeMode === "system") {
        setDark(applyThemeMode("system", false));
      }
    }

    syncFromRoot();
    window.addEventListener("micronaut-web-theme-mode-change", onThemeModeChange);
    colorPreference.addEventListener("change", onColorPreferenceChange);

    return () => {
      window.removeEventListener("micronaut-web-theme-mode-change", onThemeModeChange);
      colorPreference.removeEventListener("change", onColorPreferenceChange);
    };
  }, []);

  function setMode(nextMode: ThemeMode) {
    setThemeMode(nextMode);
    setDark(applyThemeMode(nextMode));
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1",
        runtime
          ? "border-mn-border bg-mn-surface/90 text-mn-muted shadow-sm shadow-slate-950/[0.04]"
          : "border-border bg-background text-muted-foreground shadow-xs",
        className
      )}
      role="radiogroup"
      aria-label={`Color theme, ${dark ? "dark" : "light"} active`}
    >
      {themeModes.map((option) => {
        const Icon = option.icon;
        const active = themeMode === option.mode;

        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            onClick={() => setMode(option.mode)}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              runtime
                ? active
                  ? "bg-mn-surface-raised text-mn-text ring-1 ring-mn-border"
                  : "hover:bg-mn-surface-raised hover:text-mn-text"
                : active
                  ? "bg-foreground text-background"
                  : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className={showLabels ? "inline" : "sr-only"}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
