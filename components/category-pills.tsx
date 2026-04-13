'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Clock, Star, Sparkles, Film, Tv, Trophy, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryPillsProps {
  onCategoryChange?: (category: string) => void;
  activeCategory?: string;
}

const categories = [
  { id: 'all', label: 'All', icon: null },
  { id: 'trending', label: 'Trending', icon: Flame, color: 'text-orange-400' },
  { id: 'new', label: 'New Releases', icon: Sparkles, color: 'text-green-400' },
  { id: 'top-rated', label: 'Top Rated', icon: Trophy, color: 'text-yellow-400' },
  { id: 'movies', label: 'Movies', icon: Film, color: 'text-red-400' },
  { id: 'tv', label: 'TV Shows', icon: Tv, color: 'text-blue-400' },
  { id: 'popular', label: 'Popular', icon: Heart, color: 'text-pink-400' },
  { id: 'coming-soon', label: 'Coming Soon', icon: Clock, color: 'text-purple-400' },
];

export function CategoryPills({ onCategoryChange, activeCategory = 'all' }: CategoryPillsProps) {
  const [active, setActive] = useState(activeCategory);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };
    
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleSelect = (categoryId: string) => {
    setActive(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="relative px-4 md:px-12 py-3">
      {/* Left scroll button */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Pills container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = active === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleSelect(category.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                "border backdrop-blur-sm flex-shrink-0",
                isActive
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
            >
              {Icon && (
                <Icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-black" : category.color
                )} />
              )}
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
