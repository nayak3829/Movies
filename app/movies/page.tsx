import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Film } from 'lucide-react';

export const revalidate = 14400;

import { Navbar } from '@/components/navbar';
import { GenreFilter } from '@/components/genre-filter';
import { LanguageFilter } from '@/components/language-filter';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getMoviesByGenre,
  MovieResponse,
} from '@/lib/tmdb';

export const metadata: Metadata = {
  title: 'Movies - TechVyro',
  description: 'Discover the latest and greatest films. Browse popular, top-rated, and upcoming movies.',
};

const emptyResponse: MovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

async function fetchSafe<T>(fetcher: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

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

  const initialRows = [
    { title: 'Popular Movies', movies: popular.results },
    { title: 'Now Playing', movies: nowPlaying.results },
    { title: 'Top Rated', movies: topRated.results },
    { title: 'Coming Soon', movies: upcoming.results },
    { title: 'Action', movies: action.results },
    { title: 'Comedy', movies: comedy.results },
    { title: 'Horror', movies: horror.results },
    { title: 'Science Fiction', movies: sciFi.results },
  ];

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      
      <div className="pt-20 sm:pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4 mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
              <Film className="w-7 h-7 text-primary flex-shrink-0" />
              <div>
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold leading-none"
                  style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
                >
                  Movies
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">Discover the latest and greatest films</p>
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
              <h2 className="text-xl font-bold text-white mb-4">Unable to load movies</h2>
              <p className="text-gray-400 mb-4">Please check your TMDB API key in project settings.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0 md:space-y-1">
            <Suspense fallback={null}>
              <GenreFilter genres={MOVIE_GENRES} initialRows={initialRows} type="movie" />
            </Suspense>
            <LanguageFilter type="movie" />
          </div>
        )}
      </div>

      
    </main>
  );
}
