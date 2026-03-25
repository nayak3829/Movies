'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie } from '@/lib/tmdb';
import { MovieRow } from './movie-row';
import { MovieCard } from './movie-card';

interface Genre {
  id: number;
  name: string;
}

interface InitialRow {
  title: string;
  movies: Movie[];
}

interface GenreFilterProps {
  genres: Genre[];
  initialRows: InitialRow[];
  type: 'movie' | 'tv';
}

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Highest Revenue' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '9', label: '9+ ⭐' },
  { value: '8', label: '8+ ⭐' },
  { value: '7', label: '7+ ⭐' },
  { value: '6', label: '6+ ⭐' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: '', label: 'Any Year' },
  ...Array.from({ length: 30 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  }),
];

export function GenreFilter({ genres, initialRows, type }: GenreFilterProps) {
  const searchParams = useSearchParams();
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      const genreId = parseInt(genreParam, 10);
      if (!isNaN(genreId) && genres.some(g => g.id === genreId)) {
        initializedRef.current = true;
        handleGenreSelect(genreId);
        setTimeout(() => {
          const activePill = pillsRef.current?.querySelector(`[data-genre="${genreId}"]`);
          activePill?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 300);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, genres]);

  const scrollPills = (dir: 'left' | 'right') => {
    if (!pillsRef.current) return;
    pillsRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const buildQueryParams = (genreId: number | null, page: number, overrides?: { sortBy?: string; year?: string; minRating?: string }) => {
    const params = new URLSearchParams({ type, page: String(page) });
    const useSortBy = overrides?.sortBy ?? sortBy;
    const useYear = overrides?.year !== undefined ? overrides.year : year;
    const useMinRating = overrides?.minRating !== undefined ? overrides.minRating : minRating;
    if (genreId !== null) params.set('genreId', String(genreId));
    if (useSortBy) params.set('sortBy', useSortBy);
    if (useYear) params.set('year', useYear);
    if (useMinRating) params.set('minRating', useMinRating);
    return params;
  };

  const fetchMovies = async (genreId: number | null, page: number, overrides?: { sortBy?: string; year?: string; minRating?: string }) => {
    const params = buildQueryParams(genreId, page, overrides);
    const res = await fetch(`/api/genre?${params}`);
    return res.json();
  };

  const handleGenreSelect = async (genreId: number | null) => {
    setActiveGenre(genreId);
    setCurrentPage(1);
    setTotalPages(1);
    if (genreId === null && !sortBy && !year && !minRating) {
      setFilteredMovies([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchMovies(genreId, 1);
      setFilteredMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      setFilteredMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (overrides: { sortBy?: string; year?: string; minRating?: string }) => {
    const newSortBy = overrides.sortBy ?? sortBy;
    const newYear = overrides.year !== undefined ? overrides.year : year;
    const newMinRating = overrides.minRating !== undefined ? overrides.minRating : minRating;

    if (overrides.sortBy !== undefined) setSortBy(overrides.sortBy);
    if (overrides.year !== undefined) setYear(overrides.year);
    if (overrides.minRating !== undefined) setMinRating(overrides.minRating);

    const hasFilters = activeGenre !== null || newSortBy !== 'popularity.desc' || newYear || newMinRating;
    if (!hasFilters) {
      setFilteredMovies([]);
      return;
    }

    setIsLoading(true);
    setCurrentPage(1);
    try {
      const data = await fetchMovies(activeGenre, 1, overrides);
      setFilteredMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      setFilteredMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const data = await fetchMovies(activeGenre, nextPage);
      setFilteredMovies(prev => [...prev, ...(data.results || [])]);
      setCurrentPage(nextPage);
      setTotalPages(data.total_pages || totalPages);
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  };

  const clearAllFilters = () => {
    setActiveGenre(null);
    setSortBy('popularity.desc');
    setYear('');
    setMinRating('');
    setFilteredMovies([]);
  };

  const activeGenreName = genres.find(g => g.id === activeGenre)?.name;
  const hasMore = currentPage < Math.min(totalPages, 10);
  const hasActiveFilters = activeGenre !== null || sortBy !== 'popularity.desc' || year || minRating;
  const showGrid = filteredMovies.length > 0 || isLoading || hasActiveFilters;

  return (
    <div>
      {/* Genre Pills */}
      <div className="relative px-4 md:px-12 mb-3 md:mb-4">
        <button
          onClick={() => scrollPills('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full border border-border/50 hover:bg-muted transition-colors md:left-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto py-1 mx-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => handleGenreSelect(null)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
              activeGenre === null
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground'
            )}
          >
            All
          </button>
          {genres.map(genre => (
            <button
              key={genre.id}
              data-genre={genre.id}
              onClick={() => handleGenreSelect(genre.id)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                activeGenre === genre.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30'
                  : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground'
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollPills('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full border border-border/50 hover:bg-muted transition-colors md:right-8"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center gap-3 px-4 md:px-12 mb-4">
        <button
          onClick={() => setShowFilters(f => !f)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-all',
            showFilters
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {(sortBy !== 'popularity.desc' || year || minRating) && (
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground border border-border/50 hover:bg-muted/50 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}

        {hasActiveFilters && (
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredMovies.length} results
          </span>
        )}
      </div>

      {/* Advanced Filter Controls */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 px-4 md:px-12 mb-5 p-4 bg-muted/20 rounded-xl border border-border/30 mx-4 md:mx-12">
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Year</label>
            <select
              value={year}
              onChange={(e) => handleFilterChange({ year: e.target.value })}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {YEAR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => handleFilterChange({ minRating: e.target.value })}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {RATING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {showGrid ? (
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3 px-4 md:px-8">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-md sm:rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredMovies.length > 0 ? (
            <>
              {activeGenreName && (
                <div className="px-4 md:px-8 mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    {activeGenreName}
                    <span className="text-muted-foreground text-sm font-normal ml-2">{filteredMovies.length} titles</span>
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3 px-4 md:px-8">
                {filteredMovies.map((movie, i) => (
                  <MovieCard key={`${movie.id}-${i}`} movie={{ ...movie, media_type: movie.media_type || type }} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-8 pb-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              No results found for the selected filters.
            </div>
          )}
        </div>
      ) : (
        initialRows.map(row => (
          <MovieRow
            key={row.title}
            title={row.title}
            movies={row.movies}
          />
        ))
      )}
    </div>
  );
}
