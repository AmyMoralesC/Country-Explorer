import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "./providers";
import { ThemeProvider } from "./theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Country Explorer",
  description: "Interactive world map with detailed country information. Built with Next.js, TypeScript, and TanStack Query.",
};

/**
 * Inline, synchronous theme-detection script.
 *
 * Why this exists: without it, the page would always render in light mode
 * first (React's initial state has to pick something before it can read
 * localStorage), then flip to dark a moment after hydration — a visible
 * flash for anyone with dark mode saved. Running this script BEFORE the
 * body paints, directly in <head>, avoids that entirely: by the time the
 * browser draws anything, the correct class is already on <html>.
 */
const THEME_INIT_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem("country-explorer-theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var isDark = stored ? stored === "dark" : prefersDark;
      if (isDark) document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased bg-ui-bg text-ui-text-primary transition-colors">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}