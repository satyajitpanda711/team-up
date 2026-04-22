"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="
        relative flex items-center justify-center
        w-9 h-9 rounded-lg border
        transition-all duration-200
        hover:scale-105 active:scale-95
      "
    >
      <span className="relative w-4 h-4">
        <Sun
          className={`
            absolute inset-0 w-4 h-4
            transition-all duration-300
            ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-4 h-4
            transition-all duration-300
            ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}
          `}
        />
      </span>
    </button>
  );
}