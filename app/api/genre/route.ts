import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genreId = searchParams.get('genreId');
  const type = searchParams.get('type') || 'movie';
  const page = searchParams.get('page') || '1';
  const language = searchParams.get('language');
  const sortBy = searchParams.get('sortBy') || 'popularity.desc';
  const year = searchParams.get('year');
  const minRating = searchParams.get('minRating');

  if (!TMDB_API_KEY) {
    return NextResponse.json({ results: [], error: 'API key not configured' });
  }

  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      page,
      sort_by: sortBy,
    });

    if (genreId) params.set('with_genres', genreId);
    if (language) params.set('with_original_language', language);
    if (year) {
      if (type === 'movie') {
        params.set('primary_release_year', year);
      } else {
        params.set('first_air_date_year', year);
      }
    }
    if (minRating) params.set('vote_average.gte', minRating);

    const url = (genreId || language || year || minRating || sortBy !== 'popularity.desc')
      ? `${TMDB_BASE_URL}/discover/${type}?${params}`
      : `${TMDB_BASE_URL}/${type}/popular?api_key=${TMDB_API_KEY}&page=${page}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ results: [] });
  }
}
