(function(){const legacyThemeStorageKey = "micronaut-web-theme";
const themeModeStorageKey = "micronaut-web-theme-mode";

      (() => {
        const root = document.documentElement;
        const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
        const isThemeMode = (value) => value === "system" || value === "light" || value === "dark";
        const resolveDark = (mode) => mode === "dark" || (mode === "system" && colorPreference.matches);
        const applyThemeMode = (mode) => {
          const dark = resolveDark(mode);
          root.dataset.themeMode = mode;
          root.classList.toggle("dark", dark);
          root.style.colorScheme = dark ? "dark" : "light";
        };
        let themeMode = "system";
        try {
          const storedMode = localStorage.getItem(themeModeStorageKey);
          const legacyMode = localStorage.getItem(legacyThemeStorageKey);
          if (isThemeMode(storedMode)) {
            themeMode = storedMode;
          } else if (legacyMode === "light" || legacyMode === "dark") {
            themeMode = legacyMode;
            localStorage.setItem(themeModeStorageKey, legacyMode);
          }
        } catch {
          themeMode = "system";
        }
        applyThemeMode(themeMode);
        colorPreference.addEventListener("change", () => {
          if (root.dataset.themeMode === "system") {
            applyThemeMode("system");
          }
        });
      })();
    })();