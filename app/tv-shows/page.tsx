import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MovieRow } from '@/components/movie-row';
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getTrending,
} from '@/lib/tmdb';

export default async function TVShowsPage() {
  const [
    popular,
    topRated,
    trending,
  ] = await Promise.all([
    getPopularTVShows(),
    getTopRatedTVShows(),
    getTrending('week'),
  ]);

  // Filter only TV shows from trending
  const trendingTV = {
    ...trending,
    results: trending.results.filter(item => item.media_type === 'tv' || item.first_air_date),
  };

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

        <div className="space-y-2">
          <MovieRow title="Trending TV Shows" movies={trendingTV.results} showRank />
          <MovieRow title="Popular TV Shows" movies={popular.results} />
          <MovieRow title="Top Rated TV Shows" movies={topRated.results} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
