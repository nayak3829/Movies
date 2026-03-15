'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { Movie, getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const title = movie.title || movie.name || 'Unknown';
  const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0];
  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovered(true);
  };

  return (
    <Link href={`/${mediaType}/${movie.id}`}>
      <div
        ref={cardRef}
        className={cn(
          'relative group cursor-pointer transition-all duration-300',
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
            'relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300',
            isHovered && 'shadow-2xl shadow-primary/30'
          )}
          style={{
            transform: isHovered 
              ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.08)`
              : 'rotateX(0) rotateY(0) scale(1)',
            transformStyle: 'preserve-3d',
          }}
        >
          <Image
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
          
          {/* Rank Badge */}
          {typeof index === 'number' && index < 10 && (
            <div className="absolute bottom-0 left-0 p-2">
              <span 
                className="text-6xl font-bold text-foreground/30"
                style={{ fontFamily: 'var(--font-bebas)', WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}
              >
                {index + 1}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 transition-opacity duration-300',
              isHovered && 'opacity-100'
            )}
          />
          
          {/* 3D Shine Effect */}
          {isHovered && (
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background: `linear-gradient(${105 + rotation.y * 2}deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)`,
              }}
            />
          )}
        </div>
        
        {/* Glow Effect */}
        <div 
          className={cn(
            'absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none blur-xl -z-10',
            isHovered && 'opacity-60'
          )}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, transparent 60%)',
            transform: 'translateY(20px) scale(0.9)',
          }}
        />

        {/* Expanded Card on Hover */}
        {isHovered && (
          <div className="absolute top-full left-0 right-0 bg-card rounded-b-md p-3 shadow-2xl -mt-1">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-3">
              <button className="p-2 bg-foreground rounded-full hover:bg-foreground/90 transition-colors">
                <Play className="w-4 h-4 fill-background text-background" />
              </button>
              <button className="p-2 border border-muted-foreground/50 rounded-full hover:border-foreground transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 border border-muted-foreground/50 rounded-full hover:border-foreground transition-colors">
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button className="ml-auto p-2 border border-muted-foreground/50 rounded-full hover:border-foreground transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="text-primary font-semibold">
                {Math.round(movie.vote_average * 10)}% Match
              </span>
              <span className="text-muted-foreground">{year}</span>
            </div>

            <h3 className="text-sm font-medium truncate">{title}</h3>
          </div>
        )}
      </div>
    </Link>
  );
}
