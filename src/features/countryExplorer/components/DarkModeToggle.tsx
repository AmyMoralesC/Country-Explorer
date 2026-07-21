"use client";

/**
 * DarkModeToggle.tsx
 *
 * Toggles the app's real theme via useTheme() (see app/theme-provider.tsx).
 * Icon reflects the theme that clicking it would SWITCH TO, which is the
 * common convention (sun = "go light", moon = "go dark") — so in dark
 * mode it shows a sun (offering to go light), and vice versa.
 *
 * Renders an empty placeholder button until `mounted` is true. Before
 * that point we can't yet know the real theme without risking a
 * hydration mismatch (see theme-provider.tsx) — the placeholder keeps
 * the button's size stable (no layout shift) while staying silent about
 * an icon it isn't sure of yet. This window is on the order of a single
 * frame, so it reads as instant to a person using the app.
 */

import { useTheme } from "@/app/theme-provider";

export function DarkModeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="w-9 h-9 rounded-lg border border-ui-border bg-ui-surface"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-ui-border bg-ui-surface text-ui-text-secondary hover:bg-ui-bg transition-colors"
    >
      {isDark ? (
        // Sun icon — offers to switch to light mode
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
      ) : (
        // Moon icon — offers to switch to dark mode
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}