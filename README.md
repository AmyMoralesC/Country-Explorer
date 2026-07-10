# Country Explorer

An interactive world map built with **Next.js 14**, **TypeScript** (strict mode), **TanStack Query**, and **Zustand**. Click any country to see detailed information — or search, filter, and explore.

---

## Stack

| Tool | Why |
|---|---|
| Next.js 14 (App Router) | File-based routing, Server Components, static asset serving |
| TypeScript (`strict: true`) | Zero `any`. Every value has a guaranteed type. |
| Tailwind CSS | Design tokens in `tailwind.config.ts`, consistent spacing/color |
| TanStack Query | Server state, caching, loading/error states — no `useEffect` fetching |
| Zustand | Minimal global UI state (selected country, search query) |
| Vitest + Testing Library | Fast unit tests, component tests that mirror real user behavior |

---

## Running the project

```bash
npm install
npm run dev        # http://localhost:3000
npm run test       # unit + component tests
npm run test:coverage
```

---

## Features

- **Interactive SVG map** — GeoJSON paths from Natural Earth 110m dataset, rendered with a custom equirectangular projection
- **Zoom + Pan** — mouse wheel to zoom, click-and-drag to pan
- **Country selection** — selected country highlights in red; info panel opens on the right
- **Search** — filters by name, capital, region, or country code (cca2/cca3)
- **Random** — dice button picks a random country instantly
- **Border navigation** — click any border country card to jump to it
- **Blurred flag background** — country flag image used as a decorative frosted-glass panel background

---

## Architecture

```
src/
├── app/                          # Next.js App Router (layout, page, providers)
├── features/
│   └── countryExplorer/
│       ├── components/           # React components (UI only)
│       │   ├── CountryExplorer.tsx   ← layout orchestrator
│       │   ├── WorldMap.tsx          ← SVG map + zoom/pan
│       │   ├── CountryCard.tsx       ← info panel
│       │   ├── SearchBar.tsx         ← search + random button
│       │   ├── BordersList.tsx       ← clickable border cards
│       │   ├── InfoRow.tsx           ← reusable label/value row
│       │   └── EmptyState.tsx        ← empty panel state
│       ├── hooks/
│       │   ├── useCountries.ts       ← TanStack Query wrapper
│       │   └── useCountryFilter.ts   ← search filter logic
│       ├── services/
│       │   └── restCountries.service.ts  ← API client + adapter
│       ├── store/
│       │   └── countryStore.ts       ← Zustand store
│       ├── types/
│       │   └── country.types.ts      ← all TypeScript interfaces
│       └── utils/
│           ├── formatters.ts         ← pure display helpers
│           └── projection.ts         ← lat/lng → SVG coordinate math
```

**Principle:** each file has one responsibility. The components render. The hooks fetch or filter. The service adapts. The store holds UI state.

---

## Type Safety Decisions

This section exists because TypeScript adoption and *correct* TypeScript adoption are different things. The most common mistake is typing the API response directly as the app's data model.

### Two type layers, not one

```
REST Countries API  →  CountryApiResponse  →  adaptCountry()  →  Country
        (external)          (raw shape)           (adapter)      (internal)
```

**`CountryApiResponse`** mirrors the API exactly — optional fields, nested objects, record types. It only ever appears in `restCountries.service.ts`.

**`Country`** is what every component receives — no optionals, no raw API quirks. Fields like `borders` are always `string[]` (never `string[] | undefined`), `capital` is always `string` (never `string[] | undefined`), and `gini` is `number | null`.

**Why does this matter?**

If REST Countries renames `subregion` to `subregionName` tomorrow, we change one line in the adapter. Every component continues to work because they only know about `Country`, not the API shape. Without this separation, every component would need its own null checks — and they'd drift out of sync.

### `strict: true` + `noUncheckedIndexedAccess`

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true
}
```

`noUncheckedIndexedAccess` means `array[0]` returns `T | undefined`, not `T`. This forces explicit handling of array access — the compiler catches index-out-of-bounds bugs that `strict: true` alone misses.

### No `any` anywhere

The only casts in this codebase are `as CountryApiResponse[]` and `as GeoJsonData` when deserializing `fetch().json()` — which returns `unknown` in strict mode. These are explicit, documented, and confined to the two files that cross the external boundary.

---

## Testing philosophy

Tests check **user-visible behavior**, not implementation details.

- `useCountryFilter` — pure logic, tested with `renderHook`
- `formatters` — pure functions, tested directly (no React needed)
- `CountryCard` — renders correct data, border clicks fire correct callback
- `BordersList` — expand/collapse behavior, empty state
- `restCountries.service` — adapter correctness with mocked `fetch`, edge cases for missing optional fields

---

## What's next (v2)

- [ ] Responsive layout for mobile/tablet
- [ ] i18n (EN/ES) — UI labels + country names via REST Countries `translations` field
- [ ] Dark mode
- [ ] Country comparison panel
