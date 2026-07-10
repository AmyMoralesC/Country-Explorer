import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "./providers";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-ui-bg text-ui-text-primary">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
