'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Volume2, VolumeX, Star, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { TrailerModal } from '@/components/trailer-modal';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  movies: Movie[];
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isFetchingTrailer, setIsFetchingTrailer] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const SLIDE_DURATION = 8000;

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setTrailerKey(null);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      setProgressKey(k => k + 1);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((currentIndex + 1) % movies.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [movies.length, currentIndex, goToSlide]);

  const currentMovie = movies[currentIndex];
  if (!currentMovie) return null;

  const title = currentMovie.title || currentMovie.name || 'Unknown';
  const mediaType = currentMovie.media_type || (currentMovie.first_air_date ? 'tv' : 'movie');

  const handleWatchTrailer = async () => {
    if (trailerKey) {
      setShowTrailer(true);
      return;
    }
    setIsFetchingTrailer(true);
    try {
      const res = await fetch(`/api/trailer?id=${currentMovie.id}&type=${mediaType}`);
      const data = await res.json();
      if (data.key) {
        setTrailerKey(data.key);
        setShowTrailer(true);
      }
    } catch {
      // ignore
    } finally {
      setIsFetchingTrailer(false);
    }
  };

  return (
    <>
      <div className="relative h-[55vh] sm:h-[65vh] md:h-[80vh] lg:h-[85vh] w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className={cn(
              'absolute inset-0 transition-all duration-700',
              isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            )}
          >
            <Image
              src={getImageUrl(currentMovie.backdrop_path, 'original')}
              alt={title}
              fill
              className="object-cover object-top sm:object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent md:via-background/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent h-32" />
        </div>

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 flex items-end pb-20 sm:pb-28 md:pb-36 lg:pb-40">
          <div
            className={cn(
              'max-w-xl md:max-w-2xl transition-all duration-500',
              isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
            )}
          >
            <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold">{currentMovie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-xs text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                {currentMovie.release_date?.split('-')[0] || currentMovie.first_air_date?.split('-')[0]}
              </span>
              <span className="text-xs text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 uppercase">
                {mediaType === 'tv' ? 'TV Series' : 'Movie'}
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 md:mb-3 text-balance leading-tight text-white drop-shadow-lg"
              style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.03em' }}
            >
              {title}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-white/70 mb-4 md:mb-5 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-lg drop-shadow">
              {currentMovie.overview}
            </p>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Link href={`/${mediaType}/${currentMovie.id}`}>
                <Button size="default" className="gap-1.5 sm:gap-2 bg-white text-black hover:bg-white/90 font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105 text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 md:py-2.5">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  Play
                </Button>
              </Link>
              <button
                onClick={handleWatchTrailer}
                disabled={isFetchingTrailer}
                className="flex items-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 font-semibold hover:scale-105 transition-all text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 md:py-2.5 rounded-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                {isFetchingTrailer ? 'Loading...' : 'Watch Trailer'}
              </button>
              <Link href={`/${mediaType}/${currentMovie.id}`}>
                <Button size="default" variant="secondary" className="gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 font-semibold hover:scale-105 transition-all text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 md:py-2.5">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">More Info</span>
                  <span className="sm:hidden">Info</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="hidden sm:flex absolute right-4 bottom-28 md:right-8 lg:right-12 md:bottom-36 p-2.5 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm hover:bg-white/20 transition-all"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>

        {/* Slide Indicators with Progress */}
        <div className="hidden sm:flex absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 items-center gap-2 sm:gap-3">
          {movies.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'relative h-1 sm:h-1.5 rounded-full transition-all duration-300 overflow-hidden',
                index === currentIndex
                  ? 'w-14 sm:w-16 bg-white/30'
                  : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex && (
                <span
                  key={progressKey}
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                  style={{
                    animation: `slideProgress ${SLIDE_DURATION}ms linear forwards`,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {showTrailer && trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </>
  );
}
