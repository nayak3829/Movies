import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'movie';

  if (!TMDB_API_KEY || !id) {
    return NextResponse.json({ key: null });
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return NextResponse.json({ key: null });
    }

    const data = await response.json();
    const videos: { key: string; site: string; type: string }[] = data.results || [];

    const trailer =
      videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
      videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
      videos.find((v) => v.site === 'YouTube');

    return NextResponse.json({ key: trailer?.key || null });
  } catch {
    return NextResponse.json({ key: null });
  }
}
