'use client';

import { Film, Tv, Search, Bookmark, History, TrendingUp, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type EmptyStateType = 
  | 'no-results' 
  | 'no-watchlist' 
  | 'no-history' 
  | 'no-movies' 
  | 'no-tv'
  | 'error'
  | 'offline'
  | 'loading-failed';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: typeof Film;
  defaultTitle: string;
  defaultDescription: string;
  defaultAction?: { label: string; href: string };
}> = {
  'no-results': {
    icon: Search,
    defaultTitle: 'No Results Found',
    defaultDescription: 'Try adjusting your search or filters to find what you are looking for.',
    defaultAction: { label: 'Browse Movies', href: '/movies' },
  },
  'no-watchlist': {
    icon: Bookmark,
    defaultTitle: 'Your Watchlist is Empty',
    defaultDescription: 'Start adding movies and TV shows to your watchlist to keep track of what you want to watch.',
    defaultAction: { label: 'Discover Content', href: '/' },
  },
  'no-history': {
    icon: History,
    defaultTitle: 'No Watch History',
    defaultDescription: 'Start watching movies and TV shows to see your viewing history here.',
    defaultAction: { label: 'Start Watching', href: '/' },
  },
  'no-movies': {
    icon: Film,
    defaultTitle: 'No Movies Available',
    defaultDescription: 'We could not find any movies to display at the moment.',
    defaultAction: { label: 'Go Home', href: '/' },
  },
  'no-tv': {
    icon: Tv,
    defaultTitle: 'No TV Shows Available',
    defaultDescription: 'We could not find any TV shows to display at the moment.',
    defaultAction: { label: 'Go Home', href: '/' },
  },
  'error': {
    icon: AlertCircle,
    defaultTitle: 'Something Went Wrong',
    defaultDescription: 'An error occurred while loading content. Please try again.',
  },
  'offline': {
    icon: WifiOff,
    defaultTitle: 'You are Offline',
    defaultDescription: 'Check your internet connection and try again.',
  },
  'loading-failed': {
    icon: RefreshCw,
    defaultTitle: 'Failed to Load',
    defaultDescription: 'Content could not be loaded. Please refresh the page.',
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  const finalTitle = title || config.defaultTitle;
  const finalDescription = description || config.defaultDescription;
  const finalActionLabel = actionLabel || config.defaultAction?.label;
  const finalActionHref = actionHref || config.defaultAction?.href;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-4",
      className
    )}>
      {/* Animated Icon Container */}
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        
        {/* Icon circle */}
        <div className="relative w-20 h-20 rounded-full bg-muted/50 border border-white/10 flex items-center justify-center">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {finalTitle}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {finalDescription}
      </p>

      {/* Actions */}
      {(finalActionLabel && (finalActionHref || onAction)) && (
        <div className="flex gap-3">
          {onAction ? (
            <Button onClick={onAction} className="gap-2">
              {type === 'loading-failed' && <RefreshCw className="w-4 h-4" />}
              {finalActionLabel}
            </Button>
          ) : finalActionHref ? (
            <Link href={finalActionHref}>
              <Button className="gap-2">
                <TrendingUp className="w-4 h-4" />
                {finalActionLabel}
              </Button>
            </Link>
          ) : null}
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

// Compact version for inline use
export function CompactEmptyState({ 
  message, 
  icon: Icon = Search 
}: { 
  message: string; 
  icon?: typeof Film;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="w-8 h-8 text-muted-foreground/50 mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
