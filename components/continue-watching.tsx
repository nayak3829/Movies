'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/tmdb';
import { WatchProgress } from '@/components/watch-progress';

export interface WatchHistoryItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  media_type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  timestamp: number;
}

export function saveToWatchHistory(item: Omit<WatchHistoryItem, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const existing: WatchHistoryItem[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const filtered = existing.filter(i => !(i.id === item.id && i.media_type === item.media_type));
    const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 20);
    localStorage.setItem('watchHistory', JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function ContinueWatching() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored: WatchHistoryItem[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      setItems(stored.slice(0, 12));
    } catch {
      setItems([]);
    }
  }, []);

  const removeItem = (e: React.MouseEvent, id: number, mediaType: string) => {
    e.preventDefault();
    e.stopPropagation();
    const stored: WatchHistoryItem[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const updated = stored.filter(i => !(i.id === id && i.media_type === mediaType));
    localStorage.setItem('watchHistory', JSON.stringify(updated));
    setItems(updated.slice(0, 12));
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isMounted || items.length === 0) return null;

  return (
    <div className="relative py-3 md:py-5">
      <div className="flex items-center gap-2 mb-3 md:mb-4 px-4 md:px-12">
        <Clock className="w-4 h-4 text-primary" />
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight">Continue Watching</h2>
      </div>

      <div
        className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto px-4 md:px-12 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => {
          const label = item.media_type === 'tv' && item.season
            ? `S${item.season} E${item.episode ?? 1}`
            : null;

          return (
            <Link
              key={`${item.media_type}-${item.id}`}
              href={`/${item.media_type}/${item.id}`}
              className="group relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px]"
            >
              <div className="relative aspect-video rounded-md sm:rounded-lg overflow-hidden bg-muted">
                {item.backdrop_path || item.poster_path ? (
                  <img
                    src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {label && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-primary/90 rounded text-[10px] font-bold text-white">
                    {label}
                  </div>
                )}

                {/* Watch Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0">
                  <WatchProgress 
                    contentId={item.id} 
                    mediaType={item.media_type} 
                    season={item.season}
                    episode={item.episode}
                  />
                </div>
              </div>

              <div className="mt-1.5 px-0.5">
                <h3 className="text-xs sm:text-sm font-medium truncate">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{getTimeAgo(item.timestamp)}</p>
              </div>

              <button
                onClick={(e) => removeItem(e, item.id, item.media_type)}
                className={cn(
                  'absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/90'
                )}
                aria-label="Remove from history"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
