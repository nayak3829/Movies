import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get('id');

  if (!imdbId || !imdbId.startsWith('tt')) {
    return NextResponse.json({ error: 'Invalid IMDb ID' }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ movie_results: [], tv_results: [] });
    }

    const data = await res.json();

    const results = [
      ...(data.movie_results || []).map((m: Record<string, unknown>) => ({ ...m, media_type: 'movie' })),
      ...(data.tv_results || []).map((t: Record<string, unknown>) => ({ ...t, media_type: 'tv' })),
    ];

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
