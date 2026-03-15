'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results?.filter((item: Movie) => item.poster_path).slice(0, 10) || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, handleSearch]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-md">
      <div className="container mx-auto px-4 pt-4 sm:pt-8 md:pt-16">
        {/* Search Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies, TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg bg-secondary/80 border-border/50 focus-visible:ring-primary rounded-lg"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="p-2.5 sm:p-3 hover:bg-secondary rounded-full transition-colors flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[75vh] sm:max-h-[70vh] overflow-y-auto pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {results.map((item) => {
                const title = item.title || item.name || 'Unknown';
                const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                
                return (
                  <Link
                    key={item.id}
                    href={`/${mediaType}/${item.id}`}
                    onClick={onClose}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden mb-1.5 sm:mb-2 bg-muted">
                      <Image
                        src={getImageUrl(item.poster_path, 'w300')}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium truncate">{title}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{mediaType}</p>
                  </Link>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-12">
              <p className="text-sm sm:text-base text-muted-foreground">No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">Start typing to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
