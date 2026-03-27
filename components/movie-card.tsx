'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, ThumbsUp, ChevronDown, Star } from 'lucide-react';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import { WatchProgress } from '@/components/watch-progress';

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
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) setIsHovered(true);
  }, [isMobile]);

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
          
          <Image
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={title}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 640px) 40vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Rank Badge - Netflix style */}
          {typeof index === 'number' && index < 10 && (
            <div className="absolute -left-1 sm:-left-2 bottom-0">
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
          )}

          {/* Rating Badge - Mobile visible */}
          <div className={cn(
            "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm transition-opacity",
            isMounted && isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] sm:text-xs font-medium">{rating}</span>
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

        {/* Expanded Card on Hover - Desktop only */}
        {isHovered && isMounted && !isMobile && (
          <div className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-sm rounded-b-lg p-3 shadow-2xl -mt-1 border-t border-border/20">
            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <button className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors group/btn">
                <Play className="w-4 h-4 fill-black text-black group-hover/btn:scale-110 transition-transform" />
              </button>
              <button className="p-2 border border-muted-foreground/40 rounded-full hover:border-white hover:bg-white/10 transition-all">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 border border-muted-foreground/40 rounded-full hover:border-white hover:bg-white/10 transition-all">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="ml-auto p-2 border border-muted-foreground/40 rounded-full hover:border-white hover:bg-white/10 transition-all">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs mb-1.5">
              <span className="text-green-500 font-semibold">
                {Math.round(movie.vote_average * 10)}% Match
              </span>
              <span className="text-muted-foreground">{year}</span>
              <span className="px-1 py-0.5 border border-muted-foreground/50 rounded text-[10px] uppercase">
                {mediaType === 'tv' ? 'Series' : 'HD'}
              </span>
            </div>

            <h3 className="text-sm font-medium truncate">{title}</h3>
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
