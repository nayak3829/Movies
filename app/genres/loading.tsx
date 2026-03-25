export default function GenresLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-10">
      <div className="container mx-auto px-4">
        <div className="h-10 w-64 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-muted/60 rounded animate-pulse mb-10" />

        <div className="h-6 w-40 bg-muted rounded animate-pulse mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-10">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />
          ))}
        </div>

        <div className="h-6 w-40 bg-muted rounded animate-pulse mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
