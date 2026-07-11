import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_REST_COUNTRIES_API_KEY;
const PAGE_LIMIT = 100;

export async function GET(request: Request) {
  try {
    if (!API_KEY) {
      throw new Error("REST Countries API key not configured");
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      const url = `https://api.restcountries.com/countries/v5?q=${code}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error(`REST Countries API returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    let allObjects: unknown[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.restcountries.com/countries/v5?limit=${PAGE_LIMIT}&offset=${offset}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error(`REST Countries API returned ${response.status}`);
      }

      const page = await response.json();
      allObjects = allObjects.concat(page.data.objects);
      hasMore = page.data.meta.more;
      offset += PAGE_LIMIT;
    }

    return NextResponse.json({
      data: {
        objects: allObjects,
        meta: { total: allObjects.length, count: allObjects.length },
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}