'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, SlidersHorizontal, ChevronDown, Star, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  'Avengers', 'Breaking Bad', 'Stranger Things', 'The Batman',
  'Oppenheimer', 'Game of Thrones', 'Inception', 'The Bear',
  'Wednesday', 'Dune', 'The Last of Us', 'Barbie',
];

const RECENT_KEY = 'recentSearches';

const CURRENT_YEAR = new Date().getFullYear();
const DECADE_OPTIONS = [
  { label: 'Any Year', value: '' },
  { label: '2020s', value: '2020' },
  { label: '2010s', value: '2010' },
  { label: '2000s', value: '2000' },
  { label: '1990s', value: '1990' },
  { label: '1980s', value: '1980' },
  { label: 'Before 1980', value: '1900' },
];

const TYPE_OPTIONS = [
  { label: 'All', value: 'multi' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
];

const RATING_OPTIONS = [
  { label: 'Any Rating', value: 0 },
  { label: '7+ ⭐', value: 7 },
  { label: '8+ ⭐', value: 8 },
  { label: '9+ ⭐', value: 9 },
];

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const existing = getRecentSearches();
    const updated = [query, ...existing.filter(q => q !== query)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<string>('100dvh');

  // Filters
  const [typeFilter, setTypeFilter] = useState('multi');
  const [decadeFilter, setDecadeFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    if (isOpen) setRecentSearches(getRecentSearches());
  }, [isOpen]);

  // Adjust height when mobile keyboard opens/closes
  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setViewportHeight(`${vv.height}px`);
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [isOpen]);

  const hasActiveFilters = typeFilter !== 'multi' || decadeFilter !== '' || ratingFilter > 0;

  const handleSearch = useCallback(async (searchQuery: string, type: string, decade: string, rating: number) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ query: searchQuery });
      if (type !== 'multi') params.set('type', type);
      if (decade) params.set('year', decade);
      if (rating > 0) params.set('rating', String(rating));

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      let filtered = data.results || [];

      // Client-side decade filter
      if (decade) {
        const from = parseInt(decade, 10);
        const to = decade === '1900' ? 1979 : from + 9;
        filtered = filtered.filter((item: Movie) => {
          const dateStr = item.release_date || item.first_air_date || '';
          const year = parseInt(dateStr.slice(0, 4), 10);
          if (isNaN(year)) return false;
          if (decade === '1900') return year < 1980;
          return year >= from && year <= to;
        });
      }

      // Client-side rating filter
      if (rating > 0) {
        filtered = filtered.filter((item: Movie) => (item.vote_average || 0) >= rating);
      }

      setResults(filtered.filter((item: Movie) => item.poster_path).slice(0, 18));
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only search if query has at least 2 characters (faster perceived performance)
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const debounce = setTimeout(() => {
      handleSearch(query, typeFilter, decadeFilter, ratingFilter);
    }, 200); // Reduced from 300ms to 200ms
    return () => clearTimeout(debounce);
  }, [query, typeFilter, decadeFilter, ratingFilter, handleSearch]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
      setShowFilters(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleChipClick = (term: string) => setQuery(term);

  const handleResultClick = () => {
    if (query.trim()) saveRecentSearch(query.trim());
    onClose();
  };

  const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  const resetFilters = () => {
    setTypeFilter('multi');
    setDecadeFilter('');
    setRatingFilter(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/98 backdrop-blur-md overflow-hidden"
      style={{ height: viewportHeight }}
    >
      <div className="container mx-auto px-4 pt-4 sm:pt-8 md:pt-16 h-full flex flex-col">

        {/* Search Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies, TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) saveRecentSearch(query.trim()); }}
              className="w-full pl-10 sm:pl-12 pr-4 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg bg-secondary/80 border-border/50 focus-visible:ring-primary rounded-lg"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2.5 sm:p-3 rounded-full transition-colors flex-shrink-0 relative border',
              showFilters || hasActiveFilters
                ? 'bg-primary border-primary text-white'
                : 'hover:bg-secondary border-border/50 text-muted-foreground'
            )}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 sm:p-3 hover:bg-secondary rounded-full transition-colors flex-shrink-0 border border-border/50"
            aria-label="Close search"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-secondary/50 border border-border/40 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">Filter Results</span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Type */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Type</p>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      typeFilter === opt.value
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Decade */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Era
              </p>
              <div className="flex gap-2 flex-wrap">
                {DECADE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDecadeFilter(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      decadeFilter === opt.value
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <p className="text-xs text-white/40 mb-2 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3" /> Min Rating
              </p>
              <div className="flex gap-2 flex-wrap">
                {RATING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setRatingFilter(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all',
                      ratingFilter === opt.value
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto pb-8 min-h-0" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-xs text-white/30 mb-3">{results.length} results</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {results.map((item) => {
                  const title = item.title || item.name || 'Unknown';
                  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
                  return (
                    <Link
                      key={item.id}
                      href={`/${mediaType}/${item.id}`}
                      onClick={handleResultClick}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] rounded-md overflow-hidden mb-1.5 sm:mb-2 bg-muted">
                        <Image
                          src={getImageUrl(item.poster_path, 'w300')}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                          loading="lazy"
                        />
                        {rating && (
                          <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400 flex items-center gap-0.5">
                            ⭐ {rating}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium truncate">{title}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                        {mediaType === 'tv' ? 'TV' : mediaType} {year ? `· ${year}` : ''}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : query.trim() ? (
            <div className="text-center py-12">
              <p className="text-sm sm:text-base text-muted-foreground">No results found for &quot;{query}&quot;</p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="mt-3 text-sm text-primary hover:underline">
                  Try removing filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleChipClick(term)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                          'bg-secondary hover:bg-secondary/80 border border-border/50 transition-colors'
                        )}
                      >
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleChipClick(term)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm',
                        'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors'
                      )}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
