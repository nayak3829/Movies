import { cn } from '@/lib/utils';

export function MovieCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-[2/3] rounded-md sm:rounded-lg overflow-hidden', className)}>
      <div className="absolute inset-0 bg-muted animate-pulse">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      {/* Fake rating badge */}
      <div className="absolute top-2 right-2 w-12 h-5 rounded bg-muted-foreground/20" />
    </div>
  );
}

export function MovieRowSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="py-3 md:py-5">
      {/* Title skeleton */}
      <div className="mb-3 md:mb-4 px-4 md:px-12">
        <div className="h-6 w-40 bg-muted rounded animate-pulse" />
      </div>
      {/* Cards skeleton */}
      <div className="flex gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 overflow-hidden px-4 md:px-12">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] xl:w-[200px]">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative h-[55vh] sm:h-[65vh] md:h-[80vh] lg:h-[85vh] w-full overflow-hidden bg-muted">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      
      {/* Content skeleton */}
      <div className="absolute bottom-20 sm:bottom-28 md:bottom-36 left-4 md:left-12 max-w-xl">
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-muted-foreground/20 rounded-full animate-pulse" />
          <div className="h-6 w-12 bg-muted-foreground/20 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-muted-foreground/20 rounded-full animate-pulse" />
        </div>
        <div className="h-12 md:h-16 w-80 bg-muted-foreground/20 rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-muted-foreground/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-muted-foreground/10 rounded animate-pulse mb-5" />
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="relative h-[50vh] md:h-[70vh] bg-muted animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
      
      {/* Content skeleton */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster skeleton */}
          <div className="w-48 md:w-64 aspect-[2/3] bg-muted rounded-lg animate-pulse flex-shrink-0" />
          
          {/* Info skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
            <div className="flex gap-3 pt-4">
              <div className="h-10 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
