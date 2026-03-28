import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Tv } from 'lucide-react';

export const revalidate = 14400;

import { Navbar } from '@/components/navbar';
import { GenreFilter } from '@/components/genre-filter';
import { LanguageFilter } from '@/components/language-filter';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import {
  getPopularTVShows,
  getTopRatedTVShows,
  getTrending,
  getAiringTodayTV,
  getOnTheAirTV,
  getTVShowsByGenre,
  MovieResponse,
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'TV Shows - TechVyro',
  description: 'Discover binge-worthy TV series. Browse popular, trending, and top-rated shows.',
};

const emptyResponse: MovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

async function fetchSafe<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

export default async function TVShowsPage() {
  const [
    popular,
    topRated,
    trending,
    airingToday,
    onTheAir,
    drama,
    comedy,
    sciFiFantasy,
    crime,
  ] = await Promise.all([
    fetchSafe(() => getPopularTVShows(), emptyResponse),
    fetchSafe(() => getTopRatedTVShows(), emptyResponse),
    fetchSafe(() => getTrending('week'), emptyResponse),
    fetchSafe(() => getAiringTodayTV(), emptyResponse),
    fetchSafe(() => getOnTheAirTV(), emptyResponse),
    fetchSafe(() => getTVShowsByGenre(18), emptyResponse),
    fetchSafe(() => getTVShowsByGenre(35), emptyResponse),
    fetchSafe(() => getTVShowsByGenre(10765), emptyResponse),
    fetchSafe(() => getTVShowsByGenre(80), emptyResponse),
  ]);

  const trendingTV = {
    ...trending,
    results: trending.results.filter(item => item.media_type === 'tv' || item.first_air_date),
  };

  const hasContent = popular.results.length > 0;

  const initialRows = [
    { title: 'Trending TV Shows', movies: trendingTV.results },
    { title: 'Airing Today', movies: airingToday.results },
    { title: 'Popular TV Shows', movies: popular.results },
    { title: 'Currently On Air', movies: onTheAir.results },
    { title: 'Top Rated TV Shows', movies: topRated.results },
    { title: 'Drama', movies: drama.results },
    { title: 'Comedy', movies: comedy.results },
    { title: 'Sci-Fi & Fantasy', movies: sciFiFantasy.results },
    { title: 'Crime', movies: crime.results },
  ];

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      
      <div className="pt-20 sm:pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4 mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
              <Tv className="w-7 h-7 text-primary flex-shrink-0" />
              <div>
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold leading-none"
                  style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
                >
                  TV Shows
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">Binge-worthy series waiting for you</p>
              </div>
            </div>
            <div className="hidden md:block">
              <KeyboardShortcuts variant="icon" />
            </div>
          </div>
        </div>

        {!hasContent ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">Unable to load TV shows</h2>
              <p className="text-gray-400 mb-4">Please check your TMDB API key in project settings.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0 md:space-y-1">
            <Suspense fallback={null}>
              <GenreFilter genres={TV_GENRES} initialRows={initialRows} type="tv" />
            </Suspense>
            <LanguageFilter type="tv" />
          </div>
        )}
      </div>

      
    </main>
  );
}
