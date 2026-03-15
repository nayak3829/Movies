import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieRow } from '@/components/movie-row';
import {
  getTrending,
  getUpcomingMovies,
  getNowPlayingMovies,
  getPopularTVShows,
  getTopRatedTVShows,
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

export default async function NewPopularPage() {
  const [
    trendingDay,
    trendingWeek,
    upcoming,
    nowPlaying,
    popularTV,
    topRatedTV,
  ] = await Promise.all([
    fetchSafe(() => getTrending('day'), emptyResponse),
    fetchSafe(() => getTrending('week'), emptyResponse),
    fetchSafe(() => getUpcomingMovies(), emptyResponse),
    fetchSafe(() => getNowPlayingMovies(), emptyResponse),
    fetchSafe(() => getPopularTVShows(), emptyResponse),
    fetchSafe(() => getTopRatedTVShows(), emptyResponse),
  ]);

  const hasContent = trendingWeek.results.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
          >
            New & Popular
          </h1>
          <p className="text-muted-foreground mt-2">Discover what's trending and upcoming</p>
        </div>

        {!hasContent ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">Unable to load content</h2>
              <p className="text-gray-400 mb-4">Please check your TMDB API key in project settings.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <MovieRow title="Trending Today" movies={trendingDay.results} showRank />
            <MovieRow title="Trending This Week" movies={trendingWeek.results} />
            <MovieRow title="Now Playing in Theaters" movies={nowPlaying.results} />
            <MovieRow title="Coming Soon" movies={upcoming.results} />
            <MovieRow title="Popular TV Shows" movies={popularTV.results} />
            <MovieRow title="Top Rated TV Shows" movies={topRatedTV.results} />
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
