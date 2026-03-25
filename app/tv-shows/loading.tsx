import { Tv } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] xl:w-[200px]">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted/30">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      <div className="mt-2 h-3 w-3/4 bg-muted/30 rounded animate-pulse" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="py-3 md:py-5">
      <div className="px-4 md:px-6 mb-3 md:mb-4">
        <div className="h-5 w-40 bg-muted/30 rounded animate-pulse" />
      </div>
      <div className="flex gap-2 sm:gap-2.5 md:gap-3 px-4 md:px-6 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function TVShowsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-40 h-14 md:h-16 bg-background/80 backdrop-blur-sm" />

      <div className="pt-20 sm:pt-24 pb-4 md:pb-8">
        <div className="container mx-auto px-4 mb-4 md:mb-6">
          <div className="flex items-center gap-4 border-l-4 border-primary pl-4">
            <Tv className="w-7 h-7 text-primary flex-shrink-0 opacity-50" />
            <div>
              <div className="h-10 w-36 bg-muted/40 rounded animate-pulse" />
              <div className="h-4 w-52 bg-muted/25 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>

        <div className="space-y-0 md:space-y-1">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    </main>
  );
}
