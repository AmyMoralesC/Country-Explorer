"use client";

/**
 * DarkModeToggle.tsx
 *
 * Placeholder toggle for dark mode. Swaps its own icon on click so it
 * feels alive in the UI, but does NOT change the app's theme yet — that
 * logic (a ThemeProvider + CSS variable swap) is intentionally deferred
 * to a future branch. The icon set already ships black/white variants
 * for every info-panel icon in preparation for that work.
 */

import { useState } from "react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      aria-label="Toggle dark mode"
      title="Dark mode (coming soon)"
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-ui-border bg-ui-surface text-ui-text-secondary hover:bg-ui-bg transition-colors"
    >
      {isDark ? (
        // Sun icon
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}