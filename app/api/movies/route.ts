import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing';

export async function GET(request: NextRequest) {
  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: 'TMDB API key not configured' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const category = (searchParams.get('category') || 'popular') as MovieCategory;
  const page = searchParams.get('page') || '1';

  const validCategories: MovieCategory[] = ['popular', 'top_rated', 'upcoming', 'now_playing'];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: 'Invalid category' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${category}?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 14400 } } // Cache for 4 hours
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Movies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
