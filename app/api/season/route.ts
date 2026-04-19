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
  const tvId = searchParams.get('tv_id');
  const seasonNumber = searchParams.get('season');

  if (!tvId) {
    return NextResponse.json(
      { error: 'TV show ID is required' },
      { status: 400 }
    );
  }

  if (!seasonNumber) {
    return NextResponse.json(
      { error: 'Season number is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 21600 } } // Cache for 6 hours
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Season not found' },
          { status: 404 }
        );
      }
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Season API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch season details' },
      { status: 500 }
    );
  }
}
