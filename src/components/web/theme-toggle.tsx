"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("micronaut-web-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
  }, []);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("micronaut-web-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" title="Toggle theme" onClick={toggleTheme}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
