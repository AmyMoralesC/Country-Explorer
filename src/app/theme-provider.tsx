"use client";

/**
 * ThemeProvider.tsx
 *
 * Holds the app's light/dark theme state and applies it by toggling the
 * `.dark` class on <html> — every color in tailwind.config.ts is wired to
 * a CSS variable that changes based on that class (see globals.css), so
 * this provider's only real job is deciding which class should be there
 * and persisting the choice.
 *
 * Persistence: localStorage, under "country-explorer-theme". This is a
 * real deployed app (not a Claude artifact), so localStorage is the
 * correct, standard tool here — it survives reloads and new tabs.
 *
 * HYDRATION SAFETY — why `theme` always starts as "light":
 * The server has no access to localStorage, so it always renders as if
 * the theme were "light". If our React state started by reading the DOM
 * (which the inline anti-flash script in layout.tsx may have already
 * flipped to dark before hydration), the client's first render would
 * differ from the server's — that's exactly what caused the earlier
 * hydration error ("Expected server HTML to contain a matching <circle>").
 *
 * The fix (the same technique next-themes uses): keep the first client
 * render IDENTICAL to the server's ("light"), then correct it inside
 * useEffect — which only ever runs in the browser, after hydration has
 * already succeeded, so React never compares mismatched output. The
 * `mounted` flag lets consumers (like DarkModeToggle) avoid rendering
 * anything theme-dependent until that correction has happened, so there's
 * no visible icon flash either.
 */

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "country-explorer-theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  /** False until the client-side theme correction (see above) has run. */
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light"); // must match SSR output
  const [mounted, setMounted] = useState(false);

  // Runs once, client-only: read whatever the inline script already
  // applied to <html> and sync our React state to match reality.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  // Runs on every subsequent theme change (but not on the initial mount —
  // the class is already correct from the inline script at that point).
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}