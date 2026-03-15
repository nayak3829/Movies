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
} from '@/lib/tmdb';

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
    getPopularMovies(),
    getTopRatedMovies(),
    getUpcomingMovies(),
    getNowPlayingMovies(),
    getMoviesByGenre(28), // Action
    getMoviesByGenre(35), // Comedy
    getMoviesByGenre(27), // Horror
    getMoviesByGenre(878), // Sci-Fi
  ]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 mb-8">
          <h1 
            className="text-4xl md:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
          >
            Movies
          </h1>
          <p className="text-muted-foreground mt-2">Discover the latest and greatest films</p>
        </div>

        <div className="space-y-2">
          <MovieRow title="Popular Movies" movies={popular.results} />
          <MovieRow title="Now Playing" movies={nowPlaying.results} />
          <MovieRow title="Top Rated" movies={topRated.results} />
          <MovieRow title="Coming Soon" movies={upcoming.results} />
          <MovieRow title="Action" movies={action.results} />
          <MovieRow title="Comedy" movies={comedy.results} />
          <MovieRow title="Horror" movies={horror.results} />
          <MovieRow title="Science Fiction" movies={sciFi.results} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
