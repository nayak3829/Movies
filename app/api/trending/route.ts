import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=en-US`,
      { next: { revalidate: 21600 } }
    );
    const data = await res.json();
    return NextResponse.json({ results: data.results?.slice(0, 12) || [] });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
