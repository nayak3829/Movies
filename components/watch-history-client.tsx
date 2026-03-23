'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, X, Clock, History, Trash2, Film, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/tmdb';
import { WatchHistoryItem } from '@/components/continue-watching';

export function WatchHistoryClient() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    setIsMounted(true);
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored: WatchHistoryItem[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      setItems(stored);
    } catch {
      setItems([]);
    }
  };

  const removeItem = (id: number, mediaType: string) => {
    const stored: WatchHistoryItem[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const updated = stored.filter(i => !(i.id === id && i.media_type === mediaType));
    localStorage.setItem('watchHistory', JSON.stringify(updated));
    setItems(updated);
  };

  const clearAll = () => {
    localStorage.setItem('watchHistory', '[]');
    setItems([]);
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

  if (!isMounted) return null;

  const filtered = items.filter(item => filter === 'all' || item.media_type === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.03em' }}>
              Watch History
            </h1>
            <p className="text-muted-foreground text-sm">{items.length} titles watched</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter tabs */}
      {items.length > 0 && (
        <div className="flex gap-2 mb-6">
          {(['all', 'movie', 'tv'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {f === 'movie' && <Film className="w-3.5 h-3.5" />}
              {f === 'tv' && <Tv className="w-3.5 h-3.5" />}
              {f === 'all' && <Clock className="w-3.5 h-3.5" />}
              {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
              <span className="text-xs opacity-60">
                ({f === 'all' ? items.length : items.filter(i => i.media_type === f).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* History Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 bg-muted/30 rounded-full mb-4">
            <Clock className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No watch history</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            {filter !== 'all' ? `No ${filter === 'movie' ? 'movies' : 'TV shows'} in your history.` : 'Start watching something to see your history here.'}
          </p>
          <Link
            href="/"
            className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Browse Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {filtered.map((item) => {
            const label = item.media_type === 'tv' && item.season
              ? `S${item.season} E${item.episode ?? 1}`
              : null;

            return (
              <div key={`${item.media_type}-${item.id}`} className="group relative">
                <Link href={`/${item.media_type}/${item.id}`}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                    {item.poster_path ? (
                      <Image
                        src={getImageUrl(item.poster_path, 'w300')}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
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

                    <div className="absolute top-2 left-2">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
                        item.media_type === 'tv' ? 'bg-blue-600/80 text-white' : 'bg-red-600/80 text-white'
                      )}>
                        {item.media_type}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="mt-1.5 px-0.5">
                  <h3 className="text-xs sm:text-sm font-medium truncate">{item.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {getTimeAgo(item.timestamp)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id, item.media_type)}
                  className={cn(
                    'absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/90 z-10'
                  )}
                  aria-label="Remove from history"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
