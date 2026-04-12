'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Search, Loader2, Film, Tv, Star, TrendingUp, Hash } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  media_type: 'movie' | 'tv' | 'person';
  release_date?: string;
  first_air_date?: string;
  overview: string;
}

function ResultCard({ item }: { item: SearchResult }) {
  const title = item.title || item.name || 'Unknown';
  const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
  return (
    <Link href={`/${item.media_type}/${item.id}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 mb-2">
        {item.poster_path ? (
          <img
            src={getImageUrl(item.poster_path, 'w342')}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20">
            {item.media_type === 'tv' ? <Tv className="w-8 h-8" /> : <Film className="w-8 h-8" />}
            <span className="text-xs px-2 text-center">{title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white/70 flex items-center gap-1">
          {item.media_type === 'tv' ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
          {item.media_type === 'tv' ? 'TV' : 'Movie'}
        </div>
      </div>
      <h3 className="font-medium text-sm truncate group-hover:text-white transition-colors">{title}</h3>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
        {item.vote_average > 0 && (
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            {item.vote_average.toFixed(1)}
          </span>
        )}
        {year && <span>{year}</span>}
      </div>
    </Link>
  );
}

const IMDB_ID_REGEX = /^tt\d{5,10}$/i;

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [isImdbSearch, setIsImdbSearch] = useState(false);

  const doSearch = useCallback(async (value: string) => {
    if (!value.trim()) { setResults([]); setIsImdbSearch(false); return; }
    setLoading(true);

    const isImdb = IMDB_ID_REGEX.test(value.trim());
    setIsImdbSearch(isImdb);
    const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    try {
      let data;
      if (isImdb) {
        // Direct TMDB API call for IMDB search - no Vercel serverless
        const res = await fetch(
          `https://api.themoviedb.org/3/find/${value.trim()}?api_key=${TMDB_KEY}&external_source=imdb_id`
        );
        const findData = await res.json();
        data = {
          results: [
            ...(findData.movie_results || []).map((m: SearchResult) => ({ ...m, media_type: 'movie' })),
            ...(findData.tv_results || []).map((t: SearchResult) => ({ ...t, media_type: 'tv' })),
          ]
        };
      } else {
        // Direct TMDB API call for search - no Vercel serverless
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(value)}`
        );
        data = await res.json();
      }
      setResults(data.results?.filter((r: SearchResult) => r.media_type !== 'person') || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (q) { setQuery(q); doSearch(q); }
  }, [q, doSearch]);

  useEffect(() => {
    // Direct TMDB API call for trending - no Vercel serverless
    const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_KEY}`)
      .then(r => r.json())
      .then(d => setTrending(d.results?.filter((r: SearchResult) => r.media_type !== 'person') || []))
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      doSearch(query.trim());
    }
  };

  const filtered = filter === 'all' ? results : results.filter(r => r.media_type === filter);
  const isImdbLike = query.trim().toLowerCase().startsWith('tt');

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-24 md:pb-8 container mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}>
          Search
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) { setResults([]); setIsImdbSearch(false); }
            }}
            placeholder="Search movies, shows, or enter IMDb ID (e.g. tt1375666)..."
            autoFocus
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-base transition-all"
          />
          {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />}
        </form>

        {/* IMDb hint */}
        {isImdbLike && !isImdbSearch && (
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-yellow-400" />
            Tip: Press Enter or Search to look up by IMDb ID
          </p>
        )}
        {isImdbSearch && results.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
              <Hash className="w-3 h-3" />
              IMDb ID Search
            </span>
            <span className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
          </div>
        )}

        {/* Type Filters — shown when results exist and not IMDb search */}
        {results.length > 0 && !isImdbSearch && (
          <div className="flex items-center gap-2 mb-6">
            {(['all', 'movie', 'tv'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-white/8 text-white/60 hover:bg-white/15 hover:text-white'
                }`}
              >
                {f === 'all' ? `All (${results.length})` : f === 'movie' ? `Movies (${results.filter(r => r.media_type === 'movie').length})` : `TV Shows (${results.filter(r => r.media_type === 'tv').length})`}
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && q && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-white/40 text-xl mb-2">No results for &ldquo;{q}&rdquo;</p>
            <p className="text-white/25 text-sm">
              {IMDB_ID_REGEX.test(q) ? 'No match found for this IMDb ID' : 'Try a different search term or use an IMDb ID (e.g. tt1375666)'}
            </p>
          </div>
        )}

        {/* Search Results Grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(item => (
              <ResultCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
          </div>
        )}

        {/* Trending — shown only when no active search */}
        {!q && !loading && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg md:text-xl font-semibold">Trending Right Now</h2>
            </div>

            {trendingLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : trending.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {trending.map(item => (
                  <ResultCard key={`trending-${item.media_type}-${item.id}`} item={item} />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
