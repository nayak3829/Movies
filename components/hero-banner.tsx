'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Volume2, VolumeX, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  movies: Movie[];
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentMovie = movies[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [movies.length]);

  if (!currentMovie) return null;

  const title = currentMovie.title || currentMovie.name || 'Unknown';

  const mediaType = currentMovie.media_type || (currentMovie.first_air_date ? 'tv' : 'movie');

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-700",
            isTransitioning ? "opacity-0 scale-110" : "opacity-100 scale-100"
          )}
        >
          <Image
            src={getImageUrl(currentMovie.backdrop_path, 'original')}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-24 md:pb-32">
        <div 
          className={cn(
            "max-w-2xl transition-all duration-500",
            isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
          )}
        >
          {/* Rating Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold">{currentMovie.vote_average.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary/50 backdrop-blur-sm px-3 py-1 rounded-full">
              {currentMovie.release_date?.split('-')[0] || currentMovie.first_air_date?.split('-')[0]}
            </span>
          </div>

          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-balance animate-in slide-in-from-bottom-4 duration-700"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
          >
            {title}
          </h1>
          
          <p className="text-sm md:text-base text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
            {currentMovie.overview}
          </p>

          <div className="flex items-center gap-4">
            <Link href={`/${mediaType}/${currentMovie.id}`}>
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105">
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Link href={`/${mediaType}/${currentMovie.id}`}>
              <Button size="lg" variant="secondary" className="gap-2 backdrop-blur-sm hover:scale-105 transition-transform">
                <Info className="w-5 h-5" />
                More Info
              </Button>
            </Link>
          </div>
        </div>

        {/* Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute right-4 bottom-24 md:right-12 p-3 rounded-full border border-muted-foreground/50 hover:bg-secondary transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {movies.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex ? 'w-6 bg-primary' : 'bg-muted-foreground/50 hover:bg-muted-foreground'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
