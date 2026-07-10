// src/app/api/countries/route.ts

import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_REST_COUNTRIES_API_KEY;

export async function GET(request: Request) {
  try {
    if (!API_KEY) {
      throw new Error("REST Countries API key not configured");
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    let url: string;
    
    if (code) {
      // Para un país específico por código
      url = `https://api.restcountries.com/countries/v5?q=${code}`;
    } else {
      // Para todos los países
      url = `https://api.restcountries.com/countries/v5`;
    }

    console.log("Fetching:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`REST Countries API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}