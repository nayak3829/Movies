import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techvyro.replit.app';

async function fetchTrendingIds(): Promise<{ movies: number[]; shows: number[] }> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return { movies: [], shows: [] };

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`, {
        next: { revalidate: 86400 },
      }),
      fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`, {
        next: { revalidate: 86400 },
      }),
    ]);

    const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);

    const movies: number[] = (movieData.results || []).slice(0, 40).map((m: { id: number }) => m.id);
    const shows: number[] = (tvData.results || []).slice(0, 40).map((s: { id: number }) => s.id);

    return { movies, shows };
  } catch {
    return { movies: [], shows: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tv-shows`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/new-popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const { movies, shows } = await fetchTrendingIds();

  const movieRoutes: MetadataRoute.Sitemap = movies.map(id => ({
    url: `${baseUrl}/movie/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const tvRoutes: MetadataRoute.Sitemap = shows.map(id => ({
    url: `${baseUrl}/tv/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...movieRoutes, ...tvRoutes];
}
