'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle, Loader2, Film, Tv, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SurpriseMeProps {
  variant?: 'default' | 'hero' | 'floating';
}

export function SurpriseMe({ variant = 'default' }: SurpriseMeProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'movie' | 'tv' | null>(null);

  const getRandomContent = async (type: 'movie' | 'tv') => {
    setIsLoading(true);
    setLoadingType(type);

    try {
      // Get a random page from popular content
      const randomPage = Math.floor(Math.random() * 20) + 1;
      const endpoint = type === 'movie' 
        ? `/api/trending?time_window=week&page=${randomPage}`
        : `/api/trending?time_window=week&media_type=tv&page=${randomPage}`;

      const res = await fetch(endpoint);
      
      if (!res.ok) {
        // Fallback to a simple approach
        const fallbackRes = await fetch(`/api/trending?time_window=week`);
        const fallbackData = await fallbackRes.json();
        const filteredResults = fallbackData.results?.filter(
          (item: { media_type?: string }) => 
            type === 'movie' ? item.media_type !== 'tv' : item.media_type === 'tv'
        ) || [];
        
        if (filteredResults.length > 0) {
          const randomIndex = Math.floor(Math.random() * filteredResults.length);
          const selected = filteredResults[randomIndex];
          router.push(`/${selected.media_type || type}/${selected.id}`);
          return;
        }
      }

      const data = await res.json();
      const results = data.results || [];
      
      // Filter by type if needed
      const filtered = results.filter((item: { media_type?: string }) => 
        type === 'movie' ? item.media_type !== 'tv' : item.media_type === 'tv'
      );

      if (filtered.length > 0) {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        const selected = filtered[randomIndex];
        router.push(`/${selected.media_type || type}/${selected.id}`);
      } else if (results.length > 0) {
        // Use any result if filter yields nothing
        const randomIndex = Math.floor(Math.random() * results.length);
        const selected = results[randomIndex];
        router.push(`/${selected.media_type || type}/${selected.id}`);
      }
    } catch (error) {
      console.error('Error getting random content:', error);
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-24 md:bottom-8 right-4 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "rounded-full shadow-lg shadow-primary/30 gap-2",
                "bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90",
                "animate-pulse hover:animate-none transition-all hover:scale-105"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Shuffle className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Surprise Me!</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-border">
            <DropdownMenuItem 
              onClick={() => getRandomContent('movie')}
              className="gap-2 cursor-pointer"
              disabled={isLoading}
            >
              <Film className="w-4 h-4 text-primary" />
              Random Movie
              {loadingType === 'movie' && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => getRandomContent('tv')}
              className="gap-2 cursor-pointer"
              disabled={isLoading}
            >
              <Tv className="w-4 h-4 text-primary" />
              Random TV Show
              {loadingType === 'tv' && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="default"
            variant="secondary"
            className={cn(
              "gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20",
              "hover:from-amber-500/30 hover:to-orange-500/30",
              "border border-amber-500/30 font-semibold hover:scale-105 transition-all",
              "text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 md:py-2.5"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            )}
            <span className="text-amber-200">Surprise Me</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-background/95 backdrop-blur-xl border-border">
          <DropdownMenuItem 
            onClick={() => getRandomContent('movie')}
            className="gap-2 cursor-pointer"
            disabled={isLoading}
          >
            <Film className="w-4 h-4 text-primary" />
            Random Movie
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => getRandomContent('tv')}
            className="gap-2 cursor-pointer"
            disabled={isLoading}
          >
            <Tv className="w-4 h-4 text-primary" />
            Random TV Show
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-amber-500/30 hover:bg-amber-500/10 text-amber-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4" />
          )}
          Surprise Me
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-border">
        <DropdownMenuItem 
          onClick={() => getRandomContent('movie')}
          className="gap-2 cursor-pointer"
        >
          <Film className="w-4 h-4 text-primary" />
          Random Movie
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => getRandomContent('tv')}
          className="gap-2 cursor-pointer"
        >
          <Tv className="w-4 h-4 text-primary" />
          Random TV Show
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
