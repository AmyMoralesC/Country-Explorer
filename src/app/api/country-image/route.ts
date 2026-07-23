import { NextResponse } from "next/server";
import {
  NON_PHOTO_FILENAME_PATTERNS,
  NEGATIVE_KEYWORDS,
  POSITIVE_KEYWORDS,
} from "./constants";

/**
 * GET /api/country-image?name=Costa+Rica
 *
 * Fetches a real landscape/city photo for a country from Wikipedia.
 *
 * The scoring logic itself (reject on NEGATIVE_KEYWORDS, rank by
 * POSITIVE_KEYWORDS) is unchanged — see constants.ts.
 */

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const USER_AGENT = "CountryExplorerDemo/1.0 (educational portfolio project)";
const CANDIDATE_LIMIT = 25;

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h — country photos don't change
const imageCache = new Map<string, { imageUrl: string | null; expiresAt: number }>();

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").toLowerCase();
}

function isJpegAndNotObviouslyBad(fileTitle: string): boolean {
  const lower = fileTitle.toLowerCase();
  const isJpeg = lower.endsWith(".jpg") || lower.endsWith(".jpeg");
  if (!isJpeg) return false;
  return !NON_PHOTO_FILENAME_PATTERNS.some((pattern) => lower.includes(pattern));
}

interface ImageCandidate {
  title: string;
  url: string;
  description: string; // filename + Wikipedia's written description, lowercased
}

/**
 * Single combined request: generator=images turns "images embedded in
 * this article" into the query's page set, so prop=imageinfo resolves
 * URL + description for every one of them in the same round trip.
 */
async function fetchImageCandidates(countryName: string): Promise<ImageCandidate[]> {
  const url = new URL(WIKI_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", countryName);
  url.searchParams.set("generator", "images");
  url.searchParams.set("gimlimit", "50");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata");
  url.searchParams.set("iiextmetadatafilter", "ImageDescription");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!response.ok) return [];

  const data = await response.json();
  const pages: Record<
    string,
    { title: string; imageinfo?: Array<{ url: string; extmetadata?: Record<string, { value: string }> }> }
  > = data?.query?.pages ?? {};

  return Object.values(pages)
    .filter((page) => isJpegAndNotObviouslyBad(page.title))
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;

      const descriptionHtml = info.extmetadata?.ImageDescription?.value ?? "";
      const description = `${page.title} ${stripHtml(descriptionHtml)}`.toLowerCase();

      return { title: page.title, url: info.url, description };
    })
    .filter((c): c is ImageCandidate => c !== null)
    .slice(0, CANDIDATE_LIMIT);
}

function scoreCandidate(candidate: ImageCandidate): number {
  const hasNegative = NEGATIVE_KEYWORDS.some((kw) => candidate.description.includes(kw));
  if (hasNegative) return -Infinity;

  let score = 0;
  for (const kw of POSITIVE_KEYWORDS) {
    if (candidate.description.includes(kw)) score += 1;
  }
  return score;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing 'name' parameter" }, { status: 400 });
  }

  const cached = imageCache.get(name);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ imageUrl: cached.imageUrl });
  }

  try {
    const candidates = await fetchImageCandidates(name);

    let best: ImageCandidate | null = null;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      const score = scoreCandidate(candidate);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    const imageUrl = bestScore > -Infinity ? best?.url ?? null : null;

    imageCache.set(name, { imageUrl, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Wikipedia image fetch error:", error);
    return NextResponse.json({ imageUrl: null });
  }
}