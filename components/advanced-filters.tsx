'use client';

import { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Star, 
  Calendar, 
  Globe, 
  Film,
  Sparkles,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterState {
  year: { min: number; max: number };
  rating: { min: number; max: number };
  language: string;
  sortBy: string;
  genres: number[];
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  genres?: { id: number; name: string }[];
  showGenres?: boolean;
}

const currentYear = new Date().getFullYear();

const languages = [
  { code: '', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
];

const sortOptions = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Highest Grossing' },
  { value: 'vote_count.desc', label: 'Most Voted' },
];

const defaultFilters: FilterState = {
  year: { min: 1970, max: currentYear },
  rating: { min: 0, max: 10 },
  language: '',
  sortBy: 'popularity.desc',
  genres: [],
};

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onApply,
  genres = [],
  showGenres = false
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
    setIsOpen(false);
  };

  const toggleGenre = (genreId: number) => {
    setLocalFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const hasActiveFilters = 
    localFilters.year.min !== defaultFilters.year.min ||
    localFilters.year.max !== defaultFilters.year.max ||
    localFilters.rating.min !== defaultFilters.rating.min ||
    localFilters.rating.max !== defaultFilters.rating.max ||
    localFilters.language !== defaultFilters.language ||
    localFilters.sortBy !== defaultFilters.sortBy ||
    localFilters.genres.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "gap-2 border-white/20 hover:bg-white/10",
            hasActiveFilters && "border-primary bg-primary/10 text-primary"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
              {[
                localFilters.year.min !== defaultFilters.year.min || localFilters.year.max !== defaultFilters.year.max,
                localFilters.rating.min !== defaultFilters.rating.min || localFilters.rating.max !== defaultFilters.rating.max,
                localFilters.language !== defaultFilters.language,
                localFilters.sortBy !== defaultFilters.sortBy,
                localFilters.genres.length > 0,
              ].filter(Boolean).length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Advanced Filters
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Year Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Release Year
              </label>
              <span className="text-xs text-muted-foreground">
                {localFilters.year.min} - {localFilters.year.max}
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                value={localFilters.year.min}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  year: { ...prev.year, min: Number(e.target.value) }
                }))}
                min={1900}
                max={currentYear}
                className="w-20 px-2 py-1 text-sm bg-secondary border border-border rounded-md"
              />
              <div className="flex-1">
                <Slider
                  value={[localFilters.year.min, localFilters.year.max]}
                  min={1900}
                  max={currentYear}
                  step={1}
                  onValueChange={([min, max]) => setLocalFilters(prev => ({
                    ...prev,
                    year: { min, max }
                  }))}
                  className="w-full"
                />
              </div>
              <input
                type="number"
                value={localFilters.year.max}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  year: { ...prev.year, max: Number(e.target.value) }
                }))}
                min={1900}
                max={currentYear}
                className="w-20 px-2 py-1 text-sm bg-secondary border border-border rounded-md"
              />
            </div>
          </div>

          {/* Rating Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-500" />
                TMDB Rating
              </label>
              <span className="text-xs text-muted-foreground">
                {localFilters.rating.min.toFixed(1)} - {localFilters.rating.max.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[localFilters.rating.min, localFilters.rating.max]}
              min={0}
              max={10}
              step={0.5}
              onValueChange={([min, max]) => setLocalFilters(prev => ({
                ...prev,
                rating: { min, max }
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Language */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Original Language
            </label>
            <Select
              value={localFilters.language}
              onValueChange={(value) => setLocalFilters(prev => ({
                ...prev,
                language: value
              }))}
            >
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border max-h-60">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Film className="w-4 h-4 text-muted-foreground" />
              Sort By
            </label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) => setLocalFilters(prev => ({
                ...prev,
                sortBy: value
              }))}
            >
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Genres (if enabled) */}
          {showGenres && genres.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Genres</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full transition-all",
                      localFilters.genres.includes(genre.id)
                        ? "bg-primary text-white"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    )}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="flex-1 gap-2"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            onClick={handleApply}
          >
            <Sparkles className="w-4 h-4" />
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick filter chips for mobile/inline use
export function QuickFilters({
  sortBy,
  onSortChange,
}: {
  sortBy: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all",
            sortBy === option.value
              ? "bg-primary text-white"
              : "bg-white/10 hover:bg-white/20 text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
