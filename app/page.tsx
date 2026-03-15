import { Navbar } from '@/components/navbar';
import { HeroBanner } from '@/components/hero-banner';
import { MovieRow } from '@/components/movie-row';
import { Footer } from '@/components/footer';
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getPopularTVShows,
  getTopRatedTVShows,
} from '@/lib/tmdb';

export default async function HomePage() {
  const [
    trending,
    popular,
    topRated,
    upcoming,
    nowPlaying,
    popularTV,
    topRatedTV,
  ] = await Promise.all([
    getTrending('week'),
    getPopularMovies(),
    getTopRatedMovies(),
    getUpcomingMovies(),
    getNowPlayingMovies(),
    getPopularTVShows(),
    getTopRatedTVShows(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <HeroBanner movies={trending.results.slice(0, 5)} />
      
      <div className="-mt-32 relative z-10 space-y-2">
        <MovieRow 
          title="Trending Now" 
          movies={trending.results} 
          showRank 
        />
        <MovieRow 
          title="Popular Movies" 
          movies={popular.results} 
        />
        <MovieRow 
          title="Now Playing" 
          movies={nowPlaying.results} 
        />
        <MovieRow 
          title="Top Rated Movies" 
          movies={topRated.results} 
        />
        <MovieRow 
          title="Coming Soon" 
          movies={upcoming.results} 
        />
        <MovieRow 
          title="Popular TV Shows" 
          movies={popularTV.results} 
        />
        <MovieRow 
          title="Top Rated TV Shows" 
          movies={topRatedTV.results} 
        />
      </div>

      <Footer />
    </main>
  );
}
