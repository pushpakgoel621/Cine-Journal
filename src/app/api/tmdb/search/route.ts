import { searchMovies } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchMovies(query.trim());
    return NextResponse.json({ results });
  } catch (error) {
    console.error("TMDb search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" });
  }
}
