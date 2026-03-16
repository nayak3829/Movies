'use client';

import { useRef, useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
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
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group py-3 md:py-5">
      {/* Title with better typography */}
      <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-12">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight">{title}</h2>
        {/* Mobile scroll indicator */}
        {isMounted && isMobile && (
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              showLeftArrow ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              showRightArrow ? "bg-primary" : "bg-muted"
            )} />
          </div>
        )}
      </div>
      
      {/* Left Arrow - Desktop only */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'hidden md:flex absolute left-0 top-1/2 z-20 -translate-y-1/2 w-14 h-[70%] items-center justify-center',
          'bg-gradient-to-r from-background via-background/80 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-all duration-300',
          'hover:from-background hover:via-background/90',
          !showLeftArrow && 'pointer-events-none'
        )}
        aria-label="Scroll left"
      >
        <div className={cn(
          "p-2 rounded-full bg-white/10 backdrop-blur-sm transition-all",
          "hover:bg-white/20 hover:scale-110",
          !showLeftArrow && "opacity-0"
        )}>
          <ChevronLeft className="w-6 h-6" />
        </div>
      </button>

      {/* Movie Row */}
      <div
        ref={rowRef}
        onScroll={handleScroll}
        className="flex gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-12 md:pb-16 snap-x snap-mandatory md:snap-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] xl:w-[200px] snap-start"
          >
            <MovieCard movie={movie} index={showRank ? index : undefined} />
          </div>
        ))}
      </div>

      {/* Right Arrow - Desktop only */}
      <button
        onClick={() => scroll('right')}
        className={cn(
          'hidden md:flex absolute right-0 top-1/2 z-20 -translate-y-1/2 w-14 h-[70%] items-center justify-center',
          'bg-gradient-to-l from-background via-background/80 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-all duration-300',
          'hover:from-background hover:via-background/90',
          !showRightArrow && 'pointer-events-none'
        )}
        aria-label="Scroll right"
      >
        <div className={cn(
          "p-2 rounded-full bg-white/10 backdrop-blur-sm transition-all",
          "hover:bg-white/20 hover:scale-110",
          !showRightArrow && "opacity-0"
        )}>
          <ChevronRight className="w-6 h-6" />
        </div>
      </button>
    </div>
  );
}
