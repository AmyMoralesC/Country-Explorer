/**
 * page.tsx
 *
 * Next.js App Router page — the root route ("/").
 * This is a Server Component by default, so we keep it minimal:
 * just render the CountryExplorer client component.
 *
 * Why not put everything here?
 * Server Components can't use hooks (useState, useEffect, Zustand, etc.).
 * The actual app logic lives in CountryExplorer, which is a Client Component.
 */

import { CountryExplorer } from "@/features/countryExplorer/components/CountryExplorer";

export default function HomePage() {
  return <CountryExplorer />;
}
