'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, Check, Share2, Star, Film, ExternalLink, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomVideoPlayer } from '@/components/custom-video-player';
import { TrailerModal } from '@/components/trailer-modal';
import { getImageUrl } from '@/lib/tmdb';
import { saveToWatchHistory } from '@/components/continue-watching';
import { WatchProgress, getWatchProgress, saveWatchProgress } from '@/components/watch-progress';

interface Video {
  key: string;
  site: string;
  type: string;
  name: string;
}

interface MovieDetailClientProps {
  movie: {
    id: number;
    title: string;
    tagline?: string;
    overview: string;
    backdrop_path: string | null;
    poster_path: string | null;
    vote_average: number;
    release_date?: string;
    runtime: number;
    genres: { id: number; name: string }[];
    videos?: { results: Video[] };
    credits?: {
      cast: {
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
      }[];
    };
    external_ids?: {
      imdb_id: string | null;
    };
  };
}

export function MovieDetailClient({ movie }: MovieDetailClientProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inMyList, setInMyList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [watchProgressPercent, setWatchProgressPercent] = useState<number | null>(null);

  const trailer = movie.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  ) || movie.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Teaser'
  ) || movie.videos?.results?.find(
    (v) => v.site === 'YouTube'
  );

  const handleShare = async () => {
    const url = window.location.href;
    const title = movie.title;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('myList') || '[]');
    const isInList = list.some((item: { id: number }) => item.id === movie.id);
    setInMyList(isInList);
    
    // Check watch progress
    const progress = getWatchProgress(movie.id, 'movie');
    if (progress && progress.progress > 5 && progress.progress < 95) {
      setWatchProgressPercent(progress.progress);
    }
  }, [movie.id]);

  const toggleMyList = () => {
    const list = JSON.parse(localStorage.getItem('myList') || '[]');
    if (inMyList) {
      const newList = list.filter((item: { id: number }) => item.id !== movie.id);
      localStorage.setItem('myList', JSON.stringify(newList));
      setInMyList(false);
    } else {
      list.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        media_type: 'movie',
      });
      localStorage.setItem('myList', JSON.stringify(list));
      setInMyList(true);
    }
  };

  return (
    <>
      {showPlayer && (
        <CustomVideoPlayer
          tmdbId={movie.id}
          imdbId={movie.external_ids?.imdb_id}
          type="movie"
          title={movie.title}
          posterPath={movie.poster_path}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {showTrailer && trailer && (
        <TrailerModal
          videoKey={trailer.key}
          title={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}

      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh]">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20 md:via-background/60 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent h-24" />
        </div>

        <div className="relative h-full container mx-auto px-4 flex items-end pb-8 sm:pb-12 md:pb-20">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start w-full">
            {/* Poster - Hidden on mobile */}
            <div className="hidden md:block relative w-48 lg:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl flex-shrink-0 border border-white/10">
              <img
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Info */}
            <div className="max-w-xl md:max-w-2xl">
              {/* Back Button */}
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-4 group transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 md:mb-3 leading-tight"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.03em' }}
              >
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-sm md:text-base lg:text-lg text-white/60 italic mb-2 md:mb-3">{movie.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4 text-xs md:text-sm">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">{movie.release_date?.split('-')[0]}</span>
                {movie.runtime > 0 && (
                  <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                )}
                <span className="px-2 py-1 border border-white/30 rounded text-[10px] md:text-xs bg-black/40 backdrop-blur-sm">
                  HD
                </span>
                {movie.external_ids?.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 px-2 py-1 rounded-full text-yellow-400 text-[10px] md:text-xs transition-colors"
                  >
                    IMDb <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                {movie.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-2 md:px-3 py-0.5 md:py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs md:text-sm border border-white/10"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm md:text-base text-white/70 mb-4 md:mb-6 line-clamp-2 sm:line-clamp-3 md:line-clamp-4 leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Button 
                  size="default"
                  className="gap-1.5 md:gap-2 bg-white text-black hover:bg-white/90 font-semibold shadow-lg text-xs sm:text-sm md:text-base px-4 md:px-6"
                  onClick={() => {
                    saveToWatchHistory({
                      id: movie.id,
                      title: movie.title,
                      poster_path: movie.poster_path,
                      backdrop_path: movie.backdrop_path,
                      media_type: 'movie',
                    });
                    setShowPlayer(true);
                  }}
                >
                  {watchProgressPercent ? (
                    <>
                      <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                      Resume ({Math.round(watchProgressPercent)}%)
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                      Play
                    </>
                  )}
                </Button>

                {trailer && (
                  <Button
                    size="default"
                    variant="secondary"
                    className="gap-1.5 md:gap-2 bg-red-600/80 hover:bg-red-600 border-0 font-semibold text-xs sm:text-sm md:text-base px-4 md:px-6 text-white"
                    onClick={() => setShowTrailer(true)}
                  >
                    <Film className="w-4 h-4 md:w-5 md:h-5" />
                    Trailer
                  </Button>
                )}

                <Button 
                  size="default"
                  variant="secondary" 
                  className="gap-1.5 md:gap-2 bg-white/20 hover:bg-white/30 border-0 font-semibold text-xs sm:text-sm md:text-base px-4 md:px-6"
                  onClick={toggleMyList}
                >
                  {inMyList ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
                  {inMyList ? 'Added' : 'My List'}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className={`rounded-full w-9 h-9 md:w-10 md:h-10 border-white/20 transition-all ${copied ? 'bg-green-600/80 border-green-500' : 'bg-white/10 hover:bg-white/20'}`}
                  onClick={handleShare}
                  aria-label={copied ? 'Copied!' : 'Share'}
                  title={copied ? 'Link copied!' : 'Share'}
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4 md:w-5 md:h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <section className="container mx-auto px-4 py-6 md:py-12">
          <h2 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6">Cast</h2>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {movie.credits.cast.slice(0, 16).map((actor) => (
              <Link key={actor.id} href={`/person/${actor.id}`} className="flex-shrink-0 w-20 sm:w-24 md:w-32 group">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 bg-muted border-2 border-white/10 group-hover:border-white/40 transition-all">
                  {actor.profile_path ? (
                    <img
                      src={getImageUrl(actor.profile_path, 'w185')}
                      alt={actor.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl md:text-3xl text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
                      {actor.name[0]}
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-xs md:text-sm text-center truncate group-hover:text-white transition-colors">{actor.name}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground text-center truncate">{actor.character}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
