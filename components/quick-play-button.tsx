'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { saveToWatchHistory } from '@/components/continue-watching';
import { Movie } from '@/lib/tmdb';

interface QuickPlayButtonProps {
  movie: Movie;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay' | 'minimal';
  className?: string;
}

export function QuickPlayButton({ 
  movie, 
  size = 'md', 
  variant = 'default',
  className 
}: QuickPlayButtonProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const title = movie.title || movie.name || 'Unknown';
  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Save to watch history
    saveToWatchHistory({
      id: movie.id,
      title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      media_type: mediaType,
      season: mediaType === 'tv' ? 1 : undefined,
      episode: mediaType === 'tv' ? 1 : undefined,
    });

    // Navigate to detail page with autoplay
    router.push(`/${mediaType}/${movie.id}?autoplay=true`);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'overlay') {
    return (
      <button
        onClick={handlePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "bg-black/0 hover:bg-black/40 transition-all duration-300",
          "opacity-0 group-hover:opacity-100",
          className
        )}
      >
        <div className={cn(
          "flex items-center justify-center rounded-full",
          "bg-white/90 hover:bg-white shadow-lg",
          "transition-all duration-300",
          isHovered ? "scale-110" : "scale-100",
          sizeClasses[size]
        )}>
          <Play className={cn(iconSizes[size], "text-black fill-black ml-0.5")} />
        </div>
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handlePlay}
        className={cn(
          "p-2 rounded-full bg-white/10 hover:bg-white/20",
          "border border-white/10 hover:border-white/20",
          "transition-all duration-200 hover:scale-105",
          className
        )}
      >
        <Play className={cn(iconSizes[size], "text-white fill-white")} />
      </button>
    );
  }

  return (
    <button
      onClick={handlePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center justify-center rounded-full",
        "bg-white hover:bg-white/90 shadow-lg",
        "transition-all duration-300",
        isHovered ? "scale-110 shadow-xl" : "scale-100",
        sizeClasses[size],
        className
      )}
    >
      <Play className={cn(iconSizes[size], "text-black fill-black ml-0.5")} />
    </button>
  );
}
