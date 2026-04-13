import { Navbar } from '@/components/navbar';
import { HeroBanner } from '@/components/hero-banner';
import { MovieRow } from '@/components/movie-row';
import { ContinueWatching } from '@/components/continue-watching';
import { ContentFilter } from '@/components/content-filter';
import { ComingSoon } from '@/components/coming-soon';
import { RecommendedRow } from '@/components/recommended-row';
import { CategoryPills } from '@/components/category-pills';
import { getHomePageDataSafe } from '@/lib/tmdb';

// Static generation with ISR - regenerate every 4 hours
export const revalidate = 14400;

export default async function HomePage() {
  // Single cached API call for ALL home page data
  const data = await getHomePageDataSafe();

  const hasApiKey = process.env.TMDB_API_KEY;
  const hasContent = data.trending.results.length > 0;

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      
      {!hasApiKey || !hasContent ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-4">TMDB API Key Required</h2>
            <p className="text-gray-400 mb-6">
              To display movies and TV shows, you need to add your TMDB API key.
            </p>
            <ol className="text-left text-gray-300 space-y-2 mb-6">
              <li>1. Go to <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">themoviedb.org/settings/api</a></li>
              <li>2. Create a free account and get your API key</li>
              <li>3. Click Settings (gear icon) in top right of v0</li>
              <li>4. Go to Vars section</li>
              <li>5. Add <code className="bg-gray-800 px-2 py-1 rounded">TMDB_API_KEY</code> with your key</li>
            </ol>
            <p className="text-gray-500 text-sm">After adding the key, refresh this page.</p>
          </div>
        </div>
      ) : (
        <>
          <HeroBanner movies={data.trending.results.slice(0, 5)} />
          
          <div className="-mt-16 sm:-mt-24 md:-mt-32 relative z-10 space-y-0 md:space-y-1 pb-24 md:pb-8">
            {/* Quick category filter pills */}
            <CategoryPills />
            
            <ContinueWatching />
            <ContentFilter />

            {/* All rows render instantly - data is pre-fetched in single cached call */}
            <MovieRow title="Trending Now" movies={data.trending.results} showRank />
            <MovieRow title="Popular Movies" movies={data.popular.results} />
            <MovieRow title="Now Playing" movies={data.nowPlaying.results} />
            <MovieRow title="Action Movies" movies={data.genres.action.results} />
            <MovieRow title="Comedy" movies={data.genres.comedy.results} />
            <MovieRow title="Horror" movies={data.genres.horror.results} />
            <MovieRow title="Popular TV Shows" movies={data.popularTV.results} />
            <ComingSoon movies={data.upcoming.results} title="Coming Soon" />
            
            {/* Below fold content */}
            <MovieRow title="Sci-Fi" movies={data.genres.sciFi.results} />
            <MovieRow title="Thriller" movies={data.genres.thriller.results} />
            <MovieRow title="Top Rated Movies" movies={data.topRated.results} />
            <MovieRow title="Romance" movies={data.genres.romance.results} />
            <MovieRow title="Crime TV" movies={data.tvGenres.crime.results} />
            <MovieRow title="Animation" movies={data.genres.animation.results} />
            <MovieRow title="Drama TV" movies={data.tvGenres.drama.results} />
            <MovieRow title="Top Rated TV Shows" movies={data.topRatedTV.results} />
            <MovieRow title="Documentaries" movies={data.genres.documentary.results} />
            <RecommendedRow />
          </div>
        </>
      )}
    </main>
  );
}
