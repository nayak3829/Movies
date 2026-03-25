export default function CollectionsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-40 h-14 md:h-16 bg-background/80 backdrop-blur-sm" />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <div className="h-12 w-48 bg-muted/40 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-muted/25 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-muted/30 overflow-hidden relative">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
