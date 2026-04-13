'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import Link from 'next/link';
import { Play, Plus, ThumbsUp, ChevronDown, Star, Film, Tv, Flame, Sparkles } from 'lucide-react';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import { WatchProgress } from '@/components/watch-progress';
import { UserRatingBadge } from '@/components/user-rating';

// Quality badge based on vote count and popularity
function getQualityBadge(movie: Movie): { label: string; color: string } | null {
  if (movie.vote_average >= 8 && movie.vote_count > 1000) {
    return { label: '4K', color: 'bg-gradient-to-r from-amber-500 to-yellow-500' };
  }
  if (movie.vote_average >= 7 || movie.vote_count > 500) {
    return { label: 'HD', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
  }
  return null;
}

// Check if content is new (released within last 30 days)
function isNewContent(movie: Movie): boolean {
  const releaseDate = movie.release_date || movie.first_air_date;
  if (!releaseDate) return false;
  const release = new Date(releaseDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 30;
}

// Check if trending (high popularity)
function isTrending(movie: Movie): boolean {
  return movie.popularity > 100;
}

// Genre ID to name mapping
const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action', 10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi',
  10766: 'Soap', 10767: 'Talk', 10768: 'Politics',
};

function getGenreName(genreId: number): string {
  return GENRE_MAP[genreId] || '';
}

interface MovieCardProps {
  movie: Movie;
  index?: number;
  priority?: boolean;
}

function MovieCardComponent({ movie, index, priority = false }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [trailerKey, setTrailerKey] = useState<string | null | undefined>(undefined);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const title = movie.title || movie.name || 'Unknown';
  const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0];
  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
  const rating = movie.vote_average?.toFixed(1);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    // Intersection Observer for lazy loading
    if (!priority && cardRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px', threshold: 0.01 }
      );
      observer.observe(cardRef.current);
      return () => observer.disconnect();
    }
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [priority]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 12;
    const rotateY = (centerX - x) / 12;
    
    setRotation({ x: rotateX, y: rotateY });
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setTrailerKey(undefined);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsHovered(true);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(async () => {
        try {
          // Direct TMDB API call - no Vercel serverless overhead
          const res = await fetch(
            `https://api.themoviedb.org/3/${mediaType}/${movie.id}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );
          const data = await res.json();
          const videos = data.results || [];
          const trailer = 
            videos.find((v: {site: string; type: string; key: string}) => v.site === 'YouTube' && v.type === 'Trailer') ||
            videos.find((v: {site: string; type: string; key: string}) => v.site === 'YouTube' && v.type === 'Teaser') ||
            videos.find((v: {site: string; key: string}) => v.site === 'YouTube');
          setTrailerKey(trailer?.key || null);
        } catch {
          setTrailerKey(null);
        }
      }, 1500);
    }
  }, [isMobile, movie.id, mediaType]);

  return (
    <Link href={`/${mediaType}/${movie.id}`} style={{ touchAction: 'manipulation' }}>
      <div
        ref={cardRef}
        className={cn(
          'relative cursor-pointer transition-all duration-300',
          isHovered && 'z-10'
        )}
        style={{ perspective: '1000px' }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Card */}
        <div
          className={cn(
            'relative aspect-[2/3] rounded-md sm:rounded-lg overflow-hidden transition-all duration-300',
            isHovered && 'shadow-2xl shadow-primary/30'
          )}
          style={{
            transform: isHovered 
              ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.05)`
              : 'rotateX(0) rotateY(0) scale(1)',
            transformStyle: 'preserve-3d',
            willChange: isHovered ? 'transform' : 'auto',
          }}
        >
          {/* Shimmer skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 overflow-hidden bg-muted">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          )}
          
          {/* Native img - loads directly from TMDB CDN, no Vercel optimization overhead */}
          {isInView && (
            <img
              src={getImageUrl(movie.poster_path, 'w342')}
              alt={title}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                setImageLoaded(true);
              }}
            />
          )}
          
          {/* TOP 10 Rank Badge - Netflix style */}
          {typeof index === 'number' && index < 10 && (
            <div className="absolute -left-1 sm:-left-2 bottom-0 flex items-end">
              <div className="relative">
                <span 
                  className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                  style={{ 
                    fontFamily: 'var(--font-bebas)', 
                    WebkitTextStroke: '2px rgba(128,128,128,0.8)',
                  }}
                >
                  {index + 1}
                </span>
              </div>
              {index === 0 && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-red-500 rounded text-[8px] font-bold whitespace-nowrap shadow-lg">
                  TOP 10
                </div>
              )}
            </div>
          )}

          {/* Top Left Badges - Quality, New, Trending */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1">
            {/* Quality Badge (HD/4K) */}
            {getQualityBadge(movie) && (
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-white shadow-lg",
                getQualityBadge(movie)?.color
              )}>
                {getQualityBadge(movie)?.label}
              </span>
            )}
            {/* New Badge */}
            {isNewContent(movie) && (
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                NEW
              </span>
            )}
            {/* Trending Badge */}
            {isTrending(movie) && !isNewContent(movie) && typeof index !== 'number' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" />
                HOT
              </span>
            )}
          </div>

          {/* Top Right Badges - Rating */}
          <div className={cn(
            "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex flex-col items-end gap-1 transition-opacity",
            isMounted && isMobile ? "opacity-100" : "opacity-100"
          )}>
            {/* TMDB Rating with glassmorphism */}
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] sm:text-xs font-semibold">{rating}</span>
            </div>
            {/* User Rating Badge */}
            <UserRatingBadge mediaId={movie.id} />
          </div>

          {/* Hover Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300',
              isHovered && 'opacity-100'
            )}
          />
          
          {/* 3D Shine Effect */}
          {isHovered && (
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: `linear-gradient(${105 + rotation.y * 2}deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)`,
              }}
            />
          )}

          {/* Mobile Title Overlay */}
          {isMounted && isMobile && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[11px] font-medium truncate text-white">{title}</p>
              <p className="text-[9px] text-gray-400">{year}</p>
            </div>
          )}

          {/* Watch Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <WatchProgress 
              contentId={movie.id} 
              mediaType={mediaType as 'movie' | 'tv'} 
            />
          </div>
        </div>
        
        {/* Glow Effect - Desktop only */}
        {isMounted && !isMobile && (
          <div 
            className={cn(
              'absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none blur-xl -z-10',
              isHovered && 'opacity-50'
            )}
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, transparent 60%)',
              transform: 'translateY(20px) scale(0.9)',
            }}
          />
        )}

        {/* Expanded Card on Hover - Desktop only with glassmorphism */}
        {isHovered && isMounted && !isMobile && (
          <div className="absolute top-full left-0 right-0 bg-black/80 backdrop-blur-xl rounded-b-xl p-3 shadow-2xl -mt-1 border border-white/10">
            {/* Action Buttons with glow effect */}
            <div className="flex items-center gap-2 mb-3">
              <button className="p-2.5 bg-white rounded-full hover:bg-white/90 transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] group/btn">
                <Play className="w-4 h-4 fill-black text-black" />
              </button>
              <button className="p-2 border border-white/30 rounded-full hover:border-white hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 border border-white/30 rounded-full hover:border-white hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="ml-auto p-2 border border-white/30 rounded-full hover:border-white hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Info with better styling */}
            <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
              <span className="text-green-400 font-bold">
                {Math.round(movie.vote_average * 10)}% Match
              </span>
              <span className="text-white/60">{year}</span>
              {getQualityBadge(movie) && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">
                  {getQualityBadge(movie)?.label}
                </span>
              )}
              <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${mediaType === 'tv' ? 'bg-blue-500/30 text-blue-300' : 'bg-red-500/30 text-red-300'}`}>
                {mediaType === 'tv' ? <><Tv className="w-2.5 h-2.5" /> Series</> : <><Film className="w-2.5 h-2.5" /> Movie</>}
              </span>
            </div>

            <h3 className="text-sm font-semibold truncate text-white">{title}</h3>
            
            {/* Genre tags */}
            {movie.genre_ids && movie.genre_ids.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {movie.genre_ids.slice(0, 3).map((genreId) => (
                  <span key={genreId} className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/70">
                    {getGenreName(genreId)}
                  </span>
                ))}
              </div>
            )}

            {/* Trailer preview with rounded corners */}
            {trailerKey && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailerKey}`}
                  className="w-full h-full"
                  allow="autoplay"
                  loading="lazy"
                  title="Trailer"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// Memoize component to prevent unnecessary re-renders
export const MovieCard = memo(MovieCardComponent, (prevProps, nextProps) => {
  return prevProps.movie.id === nextProps.movie.id && prevProps.index === nextProps.index;
});
