'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, BellOff, Calendar, Star, ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImageUrl, Movie } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface ComingSoonProps {
  movies: Movie[];
  title?: string;
}

const NOTIFY_STORAGE_KEY = 'notifyUpcoming';

function getNotificationList(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(NOTIFY_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function toggleNotification(id: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getNotificationList();
    const isInList = list.includes(id);
    const newList = isInList 
      ? list.filter(i => i !== id)
      : [...list, id];
    localStorage.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(newList));
    return !isInList;
  } catch {
    return false;
  }
}

export function ComingSoon({ movies, title = "Coming Soon" }: ComingSoonProps) {
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    setMounted(true);
    setNotifications(getNotificationList());
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => ref?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleToggleNotify = (id: number) => {
    const isNowNotified = toggleNotification(id);
    setNotifications(getNotificationList());
    // Could show a toast here
  };

  if (!movies || movies.length === 0) return null;

  // Filter to only upcoming movies (release date in future)
  const upcomingMovies = movies.filter(movie => {
    const releaseDate = movie.release_date || movie.first_air_date;
    if (!releaseDate) return true;
    return new Date(releaseDate) >= new Date();
  });

  if (upcomingMovies.length === 0) return null;

  return (
    <section className="relative py-6 md:py-8">
      <div className="container mx-auto px-4 md:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h2 
              className="text-xl md:text-2xl font-bold"
              style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
            >
              {title}
            </h2>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="h-8 w-8 rounded-full hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="h-8 w-8 rounded-full hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {upcomingMovies.slice(0, 10).map((movie) => {
            const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
            const title = movie.title || movie.name || 'Unknown';
            const releaseDate = movie.release_date || movie.first_air_date;
            const isNotified = notifications.includes(movie.id);

            return (
              <div 
                key={movie.id}
                className="flex-shrink-0 w-72 md:w-80 snap-start"
              >
                <div className="relative group">
                  {/* Backdrop Image */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w780')}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Coming Soon Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-white rounded">
                        Coming Soon
                      </span>
                    </div>

                    {/* Notify Button */}
                    {mounted && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleNotify(movie.id);
                        }}
                        className={cn(
                          "absolute top-3 right-3 p-2 rounded-full transition-all",
                          isNotified 
                            ? "bg-primary text-white" 
                            : "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                        )}
                        aria-label={isNotified ? "Remove notification" : "Notify me"}
                      >
                        {isNotified ? (
                          <BellOff className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                        {title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        {releaseDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(releaseDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        {movie.vote_average > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {movie.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {/* Hover Actions */}
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/${mediaType}/${movie.id}`} className="flex-1">
                          <Button size="sm" className="w-full gap-1 h-8">
                            <Info className="w-3.5 h-3.5" />
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {movie.overview || 'No description available.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
