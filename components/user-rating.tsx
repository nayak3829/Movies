'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Sparkles, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserRatingProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  variant?: 'default' | 'compact' | 'inline';
}

const RATINGS_KEY = 'userRatings';

export function getSavedRating(mediaId: number): number {
  if (typeof window === 'undefined') return 0;
  try {
    const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
    return ratings[mediaId] || 0;
  } catch {
    return 0;
  }
}

export function saveRating(mediaId: number, rating: number) {
  try {
    const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
    if (rating === 0) {
      delete ratings[mediaId];
    } else {
      ratings[mediaId] = rating;
    }
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch {
    // ignore
  }
}

// Get all rated items
export function getAllRatings(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

// Get rating label
function getRatingLabel(rating: number): string {
  if (rating === 0) return '';
  if (rating === 1) return 'Poor';
  if (rating === 2) return 'Fair';
  if (rating === 3) return 'Good';
  if (rating === 4) return 'Great';
  return 'Excellent';
}

// Get rating emoji
function getRatingIcon(rating: number) {
  if (rating <= 2) return ThumbsDown;
  if (rating === 3) return Meh;
  return ThumbsUp;
}

export function UserRating({ mediaId, mediaType, title, variant = 'default' }: UserRatingProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    setRating(getSavedRating(mediaId));
  }, [mediaId]);

  const handleRate = useCallback((star: number) => {
    const newRating = star === rating ? 0 : star;
    setRating(newRating);
    saveRating(mediaId, newRating);
    setSaved(true);
    
    if (newRating >= 4) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
    }
    
    setTimeout(() => setSaved(false), 1500);
  }, [rating, mediaId]);

  const display = hovered || rating;
  const RatingIcon = getRatingIcon(display);

  // Compact variant for cards
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRate(star); }}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'w-4 h-4 transition-colors',
                star <= display
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-white/20'
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-4 h-4 transition-colors',
                  star <= display
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-white/30'
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <span className="text-xs text-yellow-400 font-medium">{rating}/5</span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="relative flex items-center gap-4 flex-wrap">
        <span className="text-sm text-white/60 font-medium">Your Rating:</span>
        
        <div className="relative flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(star)}
              className="group relative transition-transform hover:scale-125 active:scale-110"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-all duration-200',
                  star <= display
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                    : 'text-white/20 group-hover:text-yellow-400/50'
                )}
              />
            </button>
          ))}
          
          {/* Sparkle effect for high ratings */}
          {showSparkle && (
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-ping" />
          )}
        </div>

        {/* Rating feedback */}
        <div className="flex items-center gap-2">
          {display > 0 && (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium transition-all",
              display <= 2 ? "bg-red-500/20 text-red-400" :
              display === 3 ? "bg-yellow-500/20 text-yellow-400" :
              "bg-green-500/20 text-green-400"
            )}>
              <RatingIcon className="w-4 h-4" />
              <span>{getRatingLabel(display)}</span>
            </div>
          )}
          
          {saved && (
            <span className="text-sm text-green-400 font-medium animate-in fade-in slide-in-from-left-2">
              Saved!
            </span>
          )}
        </div>

        {rating === 0 && !hovered && (
          <span className="text-xs text-white/30">Click a star to rate</span>
        )}
      </div>
    </div>
  );
}

// Badge for showing user rating on cards
export function UserRatingBadge({ mediaId }: { mediaId: number }) {
  const [rating, setRating] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRating(getSavedRating(mediaId));
  }, [mediaId]);

  if (!mounted || rating === 0) return null;

  return (
    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30">
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <span className="text-[10px] font-bold text-yellow-400">{rating}</span>
    </div>
  );
}
