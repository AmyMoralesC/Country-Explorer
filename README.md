
# Country Explorer

An interactive world map for exploring detailed information about every country — built as a TypeScript portfolio project focused on strict type safety, clean architecture, and real-world data-fetching patterns.

**[Repository](https://github.com/AmyMoralesC/Country-Explorer)**

## Features

- **Interactive SVG world map** — 254 countries with real geographic boundaries (Natural Earth 10m dataset), including small island nations and territories often missing from lower-resolution maps
- **Pan & zoom**, bounded like a native map app (no infinite panning), with full touch support: one-finger drag, two-finger pinch-to-zoom
- **Live search** — countries that don't match the query are visually dimmed on the map in real time as you type
- **Detailed info panel** — capital, timezones, calling code, languages, demonym, population, currency, GINI index, coordinates, area, and neighboring countries
- **Wikipedia-sourced country photos**, scored against a keyword filter to prefer landscape/city imagery over unrelated article images, with a flag fallback when no suitable photo is found
- **Dark mode**, built on CSS custom properties so the whole color system swaps with a single class toggle
- **Fully responsive** — side-by-side layout on desktop, stacked scrollable layout on mobile
- **Random country** picker and one-click deselect

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript (`strict: true`, `noUncheckedIndexedAccess`) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) with CSS-variable-based theming |
| Server state | [TanStack Query](https://tanstack.com/query) |
| Client/UI state | [Zustand](https://github.com/pmndrs/zustand) |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| Data | [REST Countries API](https://restcountries.com/) (v5), Wikipedia REST/Action API |
| Map data | [Natural Earth](https://www.naturalearthdata.com/) 10m admin-0 boundaries, simplified with [mapshaper](https://github.com/mbloch/mapshaper) |

## Getting started

### Prerequisites

- Node.js 18.17 or later
- [pnpm](https://pnpm.io/) (recommended — the repo includes a `pnpm-workspace.yaml`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd country-explorer-ts

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

Add your REST Countries API key to `.env.local`:

```
NEXT_PUBLIC_REST_COUNTRIES_API_KEY=your_api_key_here
```

### Running the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running tests

```bash
pnpm test              # watch mode
pnpm test:coverage     # single run with coverage report
```

### Building for production

```bash
pnpm build
pnpm start
```

## Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the test suite in watch mode |
| `pnpm test:ui` | Run tests with the Vitest UI |
| `pnpm test:coverage` | Run tests once and generate a coverage report |

## Type Safety Decisions

The app maintains two distinct type layers for country data:

- `CountryApiResponseV5` — mirrors the REST Countries v5 API response exactly, including its nested shape (`names.common`, `codes.alpha_3`, `capitals[].coordinates`, etc.). This type is used only inside the API adapter.
- `Country` — the clean internal model every component actually consumes, with all optional/inconsistent API fields resolved to safe defaults.

A single adapter function (`restCountries.service.ts`) is the only place that knows about the API's raw shape. If the upstream API changes a field name or structure, only that adapter needs to change — no component touches raw API data directly.

## License

MIT
