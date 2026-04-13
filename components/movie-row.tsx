'use client';

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Movie } from '@/lib/tmdb';
import { MovieCard } from './movie-card';
import { cn } from '@/lib/utils';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  showRank?: boolean;
}

function MovieRowComponent({ title, movies, showRank = false }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      const newScrollLeft = direction === 'left' 
        ? rowRef.current.scrollLeft - scrollAmount 
        : rowRef.current.scrollLeft + scrollAmount;
      
      rowRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group py-3 md:py-5">
      {/* Title with better typography and decorations */}
      <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-12">
        <div className="flex items-center gap-2">
          {/* Trending indicator for specific rows */}
          {(title.toLowerCase().includes('trending') || title.toLowerCase().includes('popular')) && (
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          )}
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
            {title}
          </h2>
          {showRank && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-red-600 to-red-500 text-white">
              TOP 10
            </span>
          )}
        </div>
        {/* Explore all link */}
        <button className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1 group">
          <span className="hidden sm:inline">Explore All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      {/* Left Arrow - Desktop only with glassmorphism */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'hidden md:flex absolute left-0 top-1/2 z-20 -translate-y-1/2 w-16 h-[70%] items-center justify-start pl-2',
          'bg-gradient-to-r from-background via-background/90 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-all duration-300',
          !showLeftArrow && 'pointer-events-none'
        )}
        aria-label="Scroll left"
      >
        <div className={cn(
          "p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 transition-all",
          "hover:bg-black/80 hover:scale-110 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
          !showLeftArrow && "opacity-0"
        )}>
          <ChevronLeft className="w-5 h-5" />
        </div>
      </button>

      {/* Movie Row */}
      <div
        ref={rowRef}
        onScroll={handleScroll}
        className="flex gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-12 md:pb-16 snap-x snap-mandatory md:snap-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] xl:w-[200px] snap-start"
          >
            <MovieCard movie={movie} index={showRank ? index : undefined} priority={index < 4} />
          </div>
        ))}
      </div>

      {/* Right Arrow - Desktop only with glassmorphism */}
      <button
        onClick={() => scroll('right')}
        className={cn(
          'hidden md:flex absolute right-0 top-1/2 z-20 -translate-y-1/2 w-16 h-[70%] items-center justify-end pr-2',
          'bg-gradient-to-l from-background via-background/90 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-all duration-300',
          !showRightArrow && 'pointer-events-none'
        )}
        aria-label="Scroll right"
      >
        <div className={cn(
          "p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 transition-all",
          "hover:bg-black/80 hover:scale-110 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
          !showRightArrow && "opacity-0"
        )}>
          <ChevronRight className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const MovieRow = memo(MovieRowComponent, (prevProps, nextProps) => {
  return prevProps.title === nextProps.title && 
         prevProps.movies.length === nextProps.movies.length &&
         prevProps.showRank === nextProps.showRank;
});
