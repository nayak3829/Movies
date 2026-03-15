import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieRow } from '@/components/movie-row';
import {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getMoviesByGenre,
  GENRES,
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

export default async function MoviesPage() {
  const [
    popular,
    topRated,
    upcoming,
    nowPlaying,
    action,
    comedy,
    horror,
    sciFi,
  ] = await Promise.all([
    fetchSafe(() => getPopularMovies(), emptyResponse),
    fetchSafe(() => getTopRatedMovies(), emptyResponse),
    fetchSafe(() => getUpcomingMovies(), emptyResponse),
    fetchSafe(() => getNowPlayingMovies(), emptyResponse),
    fetchSafe(() => getMoviesByGenre(28), emptyResponse),
    fetchSafe(() => getMoviesByGenre(35), emptyResponse),
    fetchSafe(() => getMoviesByGenre(27), emptyResponse),
    fetchSafe(() => getMoviesByGenre(878), emptyResponse),
  ]);

  const hasContent = popular.results.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 sm:pt-24 pb-4 md:pb-8">
        <div className="container mx-auto px-4 mb-4 md:mb-6">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
          >
            Movies
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Discover the latest and greatest films</p>
        </div>

        {!hasContent ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">Unable to load movies</h2>
              <p className="text-gray-400 mb-4">Please check your TMDB API key in project settings.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0 md:space-y-1">
            <MovieRow title="Popular Movies" movies={popular.results} showRank />
            <MovieRow title="Now Playing" movies={nowPlaying.results} />
            <MovieRow title="Top Rated" movies={topRated.results} />
            <MovieRow title="Coming Soon" movies={upcoming.results} />
            <MovieRow title="Action" movies={action.results} />
            <MovieRow title="Comedy" movies={comedy.results} />
            <MovieRow title="Horror" movies={horror.results} />
            <MovieRow title="Science Fiction" movies={sciFi.results} />
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
