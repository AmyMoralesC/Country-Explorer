import type { Config } from "tailwindcss";

/**
 * Small helper so every color entry follows the same
 * rgb(var(--color-x) / <alpha-value>) pattern — this is what makes
 * Tailwind's opacity modifiers (bg-ui-accent/10, border-ui-border/50...)
 * keep working even though the actual color now lives in a CSS variable
 * that swaps with the .dark class. See globals.css for the variable values.
 */
function withOpacity(variableName: string) {
  return `rgb(var(${variableName}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map palette — matches the blue/cream wireframe style
        map: {
          ocean: withOpacity("--color-map-ocean"),
          land: withOpacity("--color-map-land"),
          border: withOpacity("--color-map-border"),
          selected: withOpacity("--color-map-selected"),
          hover: withOpacity("--color-map-hover"),
          dim: withOpacity("--color-map-dim"),
          "dim-border": withOpacity("--color-map-dim-border"),
        },
        // UI palette — clean, modern, approachable
        ui: {
          bg: withOpacity("--color-ui-bg"),
          surface: withOpacity("--color-ui-surface"),
          panel: withOpacity("--color-ui-panel"),
          border: withOpacity("--color-ui-border"),
          text: {
            primary: withOpacity("--color-ui-text-primary"),
            secondary: withOpacity("--color-ui-text-secondary"),
            muted: withOpacity("--color-ui-text-muted"),
          },
          accent: withOpacity("--color-ui-accent"),
          "accent-hover": withOpacity("--color-ui-accent-hover"),
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        panel: "0 4px 24px rgba(26, 35, 50, 0.08)",
        card: "0 2px 8px rgba(26, 35, 50, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;