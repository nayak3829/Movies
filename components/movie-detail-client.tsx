'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Plus, Check, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { getImageUrl } from '@/lib/tmdb';

interface MovieDetailClientProps {
  movie: {
    id: number;
    title: string;
    tagline?: string;
    overview: string;
    backdrop_path: string;
    poster_path: string;
    vote_average: number;
    release_date?: string;
    runtime: number;
    genres: { id: number; name: string }[];
    credits?: {
      cast: {
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
      }[];
    };
  };
}

export function MovieDetailClient({ movie }: MovieDetailClientProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [inMyList, setInMyList] = useState(() => {
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('myList') || '[]');
      return list.some((item: { id: number }) => item.id === movie.id);
    }
    return false;
  });

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
        <VideoPlayer
          tmdbId={movie.id}
          type="movie"
          title={movie.title}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* Hero Section */}
      <div className="relative h-[70vh] md:h-[80vh]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="relative h-full container mx-auto px-4 flex items-end pb-16 md:pb-24">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="hidden md:block relative w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
              <Image
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="max-w-2xl">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
              >
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-lg text-muted-foreground italic mb-4">{movie.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span>{movie.release_date?.split('-')[0]}</span>
                {movie.runtime > 0 && (
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                )}
                <span className="px-2 py-0.5 border border-muted-foreground rounded text-xs">
                  HD
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground mb-8 line-clamp-4 leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  size="lg" 
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  onClick={() => setShowPlayer(true)}
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="gap-2"
                  onClick={toggleMyList}
                >
                  {inMyList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {inMyList ? 'In My List' : 'My List'}
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-semibold mb-6">Cast</h2>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {movie.credits.cast.slice(0, 10).map((actor) => (
              <div key={actor.id} className="flex-shrink-0 w-32">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-2 bg-secondary">
                  {actor.profile_path ? (
                    <Image
                      src={getImageUrl(actor.profile_path, 'w200')}
                      alt={actor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
                      {actor.name[0]}
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-center truncate">{actor.name}</h3>
                <p className="text-xs text-muted-foreground text-center truncate">{actor.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
