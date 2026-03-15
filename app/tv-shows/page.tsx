import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieRow } from '@/components/movie-row';
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getTrending,
  MovieResponse,
} from '@/lib/tmdb';

const emptyResponse: MovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

async function fetchSafe<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

export default async function TVShowsPage() {
  const [
    popular,
    topRated,
    trending,
  ] = await Promise.all([
    fetchSafe(() => getPopularTVShows(), emptyResponse),
    fetchSafe(() => getTopRatedTVShows(), emptyResponse),
    fetchSafe(() => getTrending('week'), emptyResponse),
  ]);

  // Filter only TV shows from trending
  const trendingTV = {
    ...trending,
    results: trending.results.filter(item => item.media_type === 'tv' || item.first_air_date),
  };

  const hasContent = popular.results.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
          >
            TV Shows
          </h1>
          <p className="text-muted-foreground mt-2">Binge-worthy series waiting for you</p>
        </div>

        {!hasContent ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">Unable to load TV shows</h2>
              <p className="text-gray-400 mb-4">Please check your TMDB API key in project settings.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <MovieRow title="Trending TV Shows" movies={trendingTV.results} showRank />
            <MovieRow title="Popular TV Shows" movies={popular.results} />
            <MovieRow title="Top Rated TV Shows" movies={topRated.results} />
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
