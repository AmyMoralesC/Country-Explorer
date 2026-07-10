import type { Config } from "tailwindcss";

const config: Config = {
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
          ocean: "#B8D4E8",
          land: "#EDE8D0",
          border: "#8CA8C0",
          selected: "#E05252",
          hover: "#D4C89A",
        },
        // UI palette — clean, modern, approachable
        ui: {
          bg: "#F0F4F8",
          surface: "#FFFFFF",
          panel: "#FAFCFE",
          border: "#DDE3EA",
          text: {
            primary: "#1A2332",
            secondary: "#4A5568",
            muted: "#718096",
          },
          accent: "#3B82F6",
          "accent-hover": "#2563EB",
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
