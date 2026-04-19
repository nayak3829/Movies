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
  const type = searchParams.get('type') || 'movie';
  const genreId = searchParams.get('genre_id');
  const page = searchParams.get('page') || '1';
  const sortBy = searchParams.get('sort_by') || 'popularity.desc';
  const year = searchParams.get('year');
  const rating = searchParams.get('rating');
  const language = searchParams.get('language');

  if (type !== 'movie' && type !== 'tv') {
    return NextResponse.json(
      { error: 'Type must be movie or tv' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page,
      sort_by: sortBy,
    });

    if (genreId) {
      params.set('with_genres', genreId);
    }

    if (year) {
      if (type === 'movie') {
        params.set('primary_release_year', year);
      } else {
        params.set('first_air_date_year', year);
      }
    }

    if (rating) {
      params.set('vote_average.gte', rating);
    }

    if (language) {
      params.set('with_original_language', language);
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${type}?${params.toString()}`,
      { next: { revalidate: 7200 } } // Cache for 2 hours
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Genre API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content by genre' },
      { status: 500 }
    );
  }
}
