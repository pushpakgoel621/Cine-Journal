const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  genre_ids: number[];
  vote_average: number;
}

export interface TMDbSearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string | null;
  overview: string;
  genres: string[];
}

export interface TMDbMovieDetails {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  runtime: number;
}

// Genre ID → Name map (TMDb standard genres)
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// Simple LRU-like cache
const searchCache = new Map<string, { data: TMDbSearchResult[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getApiKey(): string {
  return process.env.TMDB_API_KEY || "";
}

function isApiKeyConfigured(): boolean {
  const key = getApiKey();
  return key !== "" && !key.startsWith("PLACEHOLDER");
}

export async function searchMovies(query: string): Promise<TMDbSearchResult[]> {
  if (!isApiKeyConfigured()) {
    return [];
  }

  const cacheKey = query.toLowerCase().trim();

  // Check cache
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `${TMDB_BASE_URL}/search/movie?api_key=${getApiKey()}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`TMDb search failed: ${res.status}`);
    return [];
  }

  const json = await res.json();
  const results: TMDbSearchResult[] = (json.results || [])
    .slice(0, 10)
    .map((m: TMDbMovie) => ({
      id: m.id,
      title: m.title,
      year: m.release_date ? m.release_date.split("-")[0] : "N/A",
      posterUrl: m.poster_path
        ? `${TMDB_IMAGE_BASE}/w200${m.poster_path}`
        : null,
      overview: m.overview,
      genres: m.genre_ids
        .map((id) => GENRE_MAP[id])
        .filter(Boolean),
    }));

  // Update cache (limit cache size)
  if (searchCache.size > 100) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }
  searchCache.set(cacheKey, { data: results, timestamp: Date.now() });

  return results;
}

export async function getMovieDetails(
  tmdbId: number
): Promise<TMDbMovieDetails | null> {
  if (!isApiKeyConfigured()) return null;

  const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${getApiKey()}&language=en-US`;

  const res = await fetch(url);
  if (!res.ok) return null;

  return res.json();
}

export function getFullPosterUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}/w500${posterPath}`;
}
