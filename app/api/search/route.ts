import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache for search

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const type = searchParams.get('type') || 'multi';

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json({ results: [], error: 'API key not configured' });
  }

  // Check cache first
  const cacheKey = `${type}:${query.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const endpoint = type === 'multi' ? 'search/multi' : `search/${type}`;
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    
    // Store in cache
    searchCache.set(cacheKey, { data, timestamp: Date.now() });
    
    // Cleanup old cache entries periodically
    if (searchCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of searchCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          searchCache.delete(key);
        }
      }
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
