'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WatchProgressProps {
  contentId: number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  totalDuration?: number; // in minutes
  className?: string;
  showPercentage?: boolean;
}

interface ProgressData {
  id: number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  progress: number; // 0-100
  timestamp: number;
  lastPosition?: number; // in seconds
}

const STORAGE_KEY = 'watchProgress';

// Get progress for a specific content
export function getWatchProgress(
  contentId: number, 
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): ProgressData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const allProgress: ProgressData[] = JSON.parse(stored);
    
    if (mediaType === 'tv') {
      return allProgress.find(
        p => p.id === contentId && 
             p.mediaType === 'tv' && 
             p.season === season && 
             p.episode === episode
      ) || null;
    }
    
    return allProgress.find(
      p => p.id === contentId && p.mediaType === mediaType
    ) || null;
  } catch {
    return null;
  }
}

// Save progress for content
export function saveWatchProgress(
  contentId: number,
  mediaType: 'movie' | 'tv',
  progress: number,
  lastPosition?: number,
  season?: number,
  episode?: number
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allProgress: ProgressData[] = stored ? JSON.parse(stored) : [];
    
    // Remove old entry if exists
    if (mediaType === 'tv') {
      allProgress = allProgress.filter(
        p => !(p.id === contentId && p.mediaType === 'tv' && p.season === season && p.episode === episode)
      );
    } else {
      allProgress = allProgress.filter(
        p => !(p.id === contentId && p.mediaType === mediaType)
      );
    }
    
    // Add new entry (only if progress > 0)
    if (progress > 0) {
      allProgress.unshift({
        id: contentId,
        mediaType,
        season,
        episode,
        progress: Math.min(100, Math.max(0, progress)),
        timestamp: Date.now(),
        lastPosition,
      });
    }
    
    // Keep only last 100 entries
    allProgress = allProgress.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch {
    // Ignore storage errors
  }
}

// Get all in-progress content
export function getAllInProgress(): ProgressData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allProgress: ProgressData[] = JSON.parse(stored);
    // Return items that are between 5% and 95% complete
    return allProgress.filter(p => p.progress > 5 && p.progress < 95);
  } catch {
    return [];
  }
}

// Clear progress for specific content
export function clearWatchProgress(
  contentId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    let allProgress: ProgressData[] = JSON.parse(stored);
    
    if (mediaType === 'tv') {
      allProgress = allProgress.filter(
        p => !(p.id === contentId && p.mediaType === 'tv' && p.season === season && p.episode === episode)
      );
    } else {
      allProgress = allProgress.filter(
        p => !(p.id === contentId && p.mediaType === mediaType)
      );
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch {
    // Ignore storage errors
  }
}

// Component to display progress bar
export function WatchProgress({
  contentId,
  mediaType,
  season,
  episode,
  className,
  showPercentage = false,
}: WatchProgressProps) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const data = getWatchProgress(contentId, mediaType, season, episode);
    if (data) {
      setProgress(data.progress);
    }
  }, [contentId, mediaType, season, episode]);

  if (progress === null || progress <= 5) return null;

  return (
    <div className={cn("w-full", className)}>
      <Progress 
        value={progress} 
        className="h-1 bg-white/20"
      />
      {showPercentage && (
        <span className="text-xs text-muted-foreground mt-1">
          {Math.round(progress)}% watched
        </span>
      )}
    </div>
  );
}

// Resume watching badge
export function ResumeWatchingBadge({
  contentId,
  mediaType,
  season,
  episode,
  className,
}: WatchProgressProps) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const data = getWatchProgress(contentId, mediaType, season, episode);
    if (data && data.progress > 5 && data.progress < 95) {
      setProgress(data.progress);
    }
  }, [contentId, mediaType, season, episode]);

  if (progress === null) return null;

  return (
    <div className={cn(
      "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent",
      className
    )}>
      <div className="p-2">
        <div className="flex items-center justify-between text-xs text-white/80 mb-1">
          <span>Resume</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1 bg-white/20" />
      </div>
    </div>
  );
}
