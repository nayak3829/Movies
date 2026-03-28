'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Check, Share2, Star, Film, ExternalLink, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { TrailerModal } from '@/components/trailer-modal';
import { EpisodeGuide } from '@/components/episode-guide';
import { getImageUrl } from '@/lib/tmdb';
import { saveToWatchHistory } from '@/components/continue-watching';
import { getWatchProgress } from '@/components/watch-progress';

interface Video {
  key: string;
  site: string;
  type: string;
  name: string;
}

interface TVDetailClientProps {
  show: {
    id: number;
    name?: string;
    title?: string;
    tagline?: string;
    overview: string;
    backdrop_path: string;
    poster_path: string;
    vote_average: number;
    first_air_date?: string;
    number_of_seasons?: number;
    seasons?: { season_number: number; episode_count: number }[];
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

export function TVDetailClient({ show }: TVDetailClientProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [playerSeason, setPlayerSeason] = useState(1);
  const [playerEpisode, setPlayerEpisode] = useState(1);
  const title = show.name || show.title || 'Unknown';
  
  const [inMyList, setInMyList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastWatchedSeason, setLastWatchedSeason] = useState<number | null>(null);
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState<number | null>(null);

  const trailer = show.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  ) || show.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Teaser'
  ) || show.videos?.results?.find(
    (v) => v.site === 'YouTube'
  );

  const handleShare = async () => {
    const url = window.location.href;
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
    const isInList = list.some((item: { id: number }) => item.id === show.id);
    setInMyList(isInList);
    
    // Find last watched episode from watch history
    try {
      const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      const lastWatched = history.find((item: { id: number; media_type: string }) => 
        item.id === show.id && item.media_type === 'tv'
      );
      if (lastWatched && lastWatched.season && lastWatched.episode) {
        setLastWatchedSeason(lastWatched.season);
        setLastWatchedEpisode(lastWatched.episode);
      }
    } catch {}
  }, [show.id]);

  const toggleMyList = () => {
    const list = JSON.parse(localStorage.getItem('myList') || '[]');
    if (inMyList) {
      const newList = list.filter((item: { id: number }) => item.id !== show.id);
      localStorage.setItem('myList', JSON.stringify(newList));
      setInMyList(false);
    } else {
      list.push({
        id: show.id,
        name: title,
        poster_path: show.poster_path,
        vote_average: show.vote_average,
        media_type: 'tv',
        first_air_date: show.first_air_date,
      });
      localStorage.setItem('myList', JSON.stringify(list));
      setInMyList(true);
    }
  };

  const totalSeasons = show.number_of_seasons || 1;
  const episodesPerSeason = show.seasons?.map(s => s.episode_count) || [10];

  return (
    <>
      {showPlayer && (
        <VideoPlayer
          tmdbId={show.id}
          imdbId={show.external_ids?.imdb_id}
          type="tv"
          title={title}
          season={playerSeason}
          episode={playerEpisode}
          totalSeasons={totalSeasons}
          episodesPerSeason={episodesPerSeason}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {showTrailer && trailer && (
        <TrailerModal
          videoKey={trailer.key}
          title={title}
          onClose={() => setShowTrailer(false)}
        />
      )}

      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(show.backdrop_path, 'original')}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover object-top sm:object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20 md:via-background/60 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent h-24" />
        </div>

        <div className="relative h-full container mx-auto px-4 flex items-end pb-8 sm:pb-12 md:pb-20">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start w-full">
            {/* Poster - Hidden on mobile */}
            <div className="hidden md:block relative w-48 lg:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl flex-shrink-0 border border-white/10">
              <Image
                src={getImageUrl(show.poster_path, 'w500')}
                alt={title}
                fill
                sizes="(max-width: 1024px) 192px, 256px"
                className="object-cover"
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
                {title}
              </h1>
              
              {show.tagline && (
                <p className="text-sm md:text-base lg:text-lg text-white/60 italic mb-2 md:mb-3">{show.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4 text-xs md:text-sm">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                </div>
                <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">{show.first_air_date?.split('-')[0]}</span>
                {totalSeasons > 0 && (
                  <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">{totalSeasons} Season{totalSeasons > 1 ? 's' : ''}</span>
                )}
                <span className="px-2 py-1 border border-white/30 rounded text-[10px] md:text-xs bg-black/40 backdrop-blur-sm">
                  TV Series
                </span>
                {show.external_ids?.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${show.external_ids.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 px-2 py-1 rounded-full text-yellow-400 text-[10px] md:text-xs transition-colors"
                  >
                    IMDb <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                {show.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-2 md:px-3 py-0.5 md:py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs md:text-sm border border-white/10"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm md:text-base text-white/70 mb-4 md:mb-6 line-clamp-2 sm:line-clamp-3 md:line-clamp-4 leading-relaxed">
                {show.overview}
              </p>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Button 
                  size="default"
                  className="gap-1.5 md:gap-2 bg-white text-black hover:bg-white/90 font-semibold shadow-lg text-xs sm:text-sm md:text-base px-4 md:px-6"
                  onClick={() => {
                    const season = lastWatchedSeason || 1;
                    const episode = lastWatchedEpisode || 1;
                    setPlayerSeason(season);
                    setPlayerEpisode(episode);
                    saveToWatchHistory({
                      id: show.id,
                      title,
                      poster_path: show.poster_path,
                      backdrop_path: show.backdrop_path,
                      media_type: 'tv',
                      season,
                      episode,
                    });
                    setShowPlayer(true);
                  }}
                >
                  {lastWatchedSeason && lastWatchedEpisode ? (
                    <>
                      <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                      Resume S{lastWatchedSeason}E{lastWatchedEpisode}
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
      {show.credits?.cast && show.credits.cast.length > 0 && (
        <section className="container mx-auto px-4 py-6 md:py-12">
          <h2 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6">Cast</h2>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {show.credits.cast.slice(0, 16).map((actor) => (
              <Link key={actor.id} href={`/person/${actor.id}`} className="flex-shrink-0 w-20 sm:w-24 md:w-32 group">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 bg-muted border-2 border-white/10 group-hover:border-white/40 transition-all">
                  {actor.profile_path ? (
                    <Image
                      src={getImageUrl(actor.profile_path, 'w200')}
                      alt={actor.name}
                      fill
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
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

      {/* Episode Guide */}
      {show.seasons && show.seasons.filter(s => s.season_number > 0).length > 0 && (
        <EpisodeGuide
          tvId={show.id}
          seasons={show.seasons.map(s => ({
            season_number: s.season_number,
            episode_count: s.episode_count,
            name: `Season ${s.season_number}`,
          }))}
          onPlayEpisode={(season, episode) => {
            setPlayerSeason(season);
            setPlayerEpisode(episode);
            saveToWatchHistory({
              id: show.id,
              title,
              poster_path: show.poster_path,
              backdrop_path: show.backdrop_path,
              media_type: 'tv',
              season,
              episode,
            });
            setShowPlayer(true);
          }}
        />
      )}
    </>
  );
}
