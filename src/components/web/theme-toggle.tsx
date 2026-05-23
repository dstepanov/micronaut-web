"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const enabled = document.documentElement.classList.contains("dark");
    document.documentElement.style.colorScheme = enabled ? "dark" : "light";
    setDark(enabled);
  }, []);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("micronaut-web-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" title="Toggle theme" onClick={toggleTheme}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
