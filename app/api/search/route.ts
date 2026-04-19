import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: 'TMDB API key not configured' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    // Check if it's an IMDb ID search (tt followed by digits)
    const imdbIdMatch = query.match(/^tt\d+$/i);
    
    if (imdbIdMatch) {
      // Search by IMDb ID using find endpoint
      const response = await fetch(
        `${TMDB_BASE_URL}/find/${query}?api_key=${TMDB_API_KEY}&external_source=imdb_id`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Combine results from movies and TV shows
      const results = [
        ...data.movie_results.map((m: Record<string, unknown>) => ({ ...m, media_type: 'movie' })),
        ...data.tv_results.map((t: Record<string, unknown>) => ({ ...t, media_type: 'tv' })),
      ];

      return NextResponse.json({
        page: 1,
        results,
        total_pages: 1,
        total_results: results.length,
      });
    }

    // Regular multi-search
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
      { cache: 'no-store' } // No cache for search
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
