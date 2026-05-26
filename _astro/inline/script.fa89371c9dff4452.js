(function(){const legacyThemeStorageKey = "micronaut-web-theme";
const themeModeStorageKey = "micronaut-web-theme-mode";

      (() => {
        const root = document.documentElement;
        const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
        const preferredThemeMode = colorPreference.matches ? "dark" : "light";
        const isThemeMode = (value) => value === "light" || value === "dark";
        const resolveDark = (mode) => mode === "dark";
        const applyThemeMode = (mode) => {
          const dark = resolveDark(mode);
          root.dataset.themeMode = mode;
          root.classList.toggle("dark", dark);
          root.style.colorScheme = dark ? "dark" : "light";
        };
        let themeMode = preferredThemeMode;
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
          themeMode = preferredThemeMode;
        }
        applyThemeMode(themeMode);
      })();
    })();