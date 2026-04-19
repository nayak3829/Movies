import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type TVCategory = 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';

export async function GET(request: NextRequest) {
  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { error: 'TMDB API key not configured' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const category = (searchParams.get('category') || 'popular') as TVCategory;
  const page = searchParams.get('page') || '1';

  const validCategories: TVCategory[] = ['popular', 'top_rated', 'airing_today', 'on_the_air'];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: 'Invalid category' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${category}?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 14400 } } // Cache for 4 hours
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('TV API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV shows' },
      { status: 500 }
    );
  }
}
