'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/lib/tmdb';
import { MovieCard } from './movie-card';
import { cn } from '@/lib/utils';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  showRank?: boolean;
}

export function MovieRow({ title, movies, showRank = false }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      const newScrollLeft = direction === 'left' 
        ? rowRef.current.scrollLeft - scrollAmount 
        : rowRef.current.scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group py-4">
      <h2 className="text-lg md:text-xl font-semibold mb-4 px-4 md:px-12">{title}</h2>
      
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'absolute left-0 top-1/2 z-20 -translate-y-1/2 w-12 h-full flex items-center justify-center',
          'bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity',
          !showLeftArrow && 'hidden'
        )}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Movie Row */}
      <div
        ref={rowRef}
        onScroll={handleScroll}
        className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-16"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <div key={movie.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
            <MovieCard movie={movie} index={showRank ? index : undefined} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className={cn(
          'absolute right-0 top-1/2 z-20 -translate-y-1/2 w-12 h-full flex items-center justify-center',
          'bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity',
          !showRightArrow && 'hidden'
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}
