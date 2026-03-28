'use client';

import { useState, useEffect } from 'react';
import { Settings2, Check, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type VideoQuality = 'auto' | '4k' | '1080p' | '720p' | '480p' | '360p';

interface QualitySelectorProps {
  currentQuality: VideoQuality;
  onQualityChange: (quality: VideoQuality) => void;
  availableQualities?: VideoQuality[];
  compact?: boolean;
}

const qualityLabels: Record<VideoQuality, { label: string; description: string; badge?: string }> = {
  auto: { label: 'Auto', description: 'Best for your connection', badge: 'Recommended' },
  '4k': { label: '4K', description: '2160p Ultra HD' },
  '1080p': { label: '1080p', description: 'Full HD' },
  '720p': { label: '720p', description: 'HD' },
  '480p': { label: '480p', description: 'SD' },
  '360p': { label: '360p', description: 'Low quality' },
};

const STORAGE_KEY = 'preferredQuality';

export function getPreferredQuality(): VideoQuality {
  if (typeof window === 'undefined') return 'auto';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && Object.keys(qualityLabels).includes(stored)) {
      return stored as VideoQuality;
    }
  } catch {}
  return 'auto';
}

export function setPreferredQuality(quality: VideoQuality): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, quality);
  } catch {}
}

export function QualitySelector({
  currentQuality,
  onQualityChange,
  availableQualities = ['auto', '1080p', '720p', '480p', '360p'],
  compact = false,
}: QualitySelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (quality: VideoQuality) => {
    onQualityChange(quality);
    setPreferredQuality(quality);
  };

  if (!mounted) return null;

  const currentLabel = qualityLabels[currentQuality];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-1.5 text-white/80 hover:text-white hover:bg-white/10",
            compact && "h-8 px-2"
          )}
        >
          <Settings2 className={cn("w-4 h-4", compact && "w-3.5 h-3.5")} />
          <span className={cn(compact && "text-xs")}>{currentLabel.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-background/95 backdrop-blur-xl border-border w-48"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Video Quality
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableQualities.map((quality) => {
          const { label, description, badge } = qualityLabels[quality];
          const isSelected = currentQuality === quality;
          
          return (
            <DropdownMenuItem
              key={quality}
              onClick={() => handleChange(quality)}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                isSelected && "bg-primary/10"
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium",
                    isSelected && "text-primary"
                  )}>
                    {label}
                  </span>
                  {badge && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                      <Zap className="w-2.5 h-2.5" />
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{description}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Inline quality chips for quick selection
export function QualityChips({
  currentQuality,
  onQualityChange,
  availableQualities = ['auto', '1080p', '720p', '480p'],
}: Omit<QualitySelectorProps, 'compact'>) {
  return (
    <div className="flex gap-1.5">
      {availableQualities.map((quality) => {
        const isSelected = currentQuality === quality;
        return (
          <button
            key={quality}
            onClick={() => {
              onQualityChange(quality);
              setPreferredQuality(quality);
            }}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded transition-all",
              isSelected
                ? "bg-primary text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            )}
          >
            {qualityLabels[quality].label}
          </button>
        );
      })}
    </div>
  );
}
