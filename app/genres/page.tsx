import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Clapperboard, Tv2 } from 'lucide-react';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Browse Genres - TechVyro',
  description: 'Browse movies and TV shows by genre. Action, Comedy, Drama, Horror, Sci-Fi and more.',
};

const MOVIE_GENRES = [
  { id: 28,    name: 'Action',        backdrop: '/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg',  emoji: '💥', type: 'movie' as const },
  { id: 12,    name: 'Adventure',     backdrop: '/sItIskd5xpiE64bBWYwZintkGf3.jpg',  emoji: '🗺️', type: 'movie' as const },
  { id: 16,    name: 'Animation',     backdrop: '/xuJ0F9RfKvVSJNDg2usurQ9WvY5.jpg',  emoji: '🎨', type: 'movie' as const },
  { id: 35,    name: 'Comedy',        backdrop: '/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',  emoji: '😂', type: 'movie' as const },
  { id: 80,    name: 'Crime',         backdrop: '/6WqqEjiycNvDLjbEClM1zCwIbDD.jpg',  emoji: '🔫', type: 'movie' as const },
  { id: 99,    name: 'Documentary',   backdrop: '/uIpJPDNFoeX0TVml9smPrs9KUVx.jpg',  emoji: '🎥', type: 'movie' as const },
  { id: 18,    name: 'Drama',         backdrop: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',  emoji: '🎭', type: 'movie' as const },
  { id: 14,    name: 'Fantasy',       backdrop: '/2meX1nMdScFOoV4370rqHWKmXhY.jpg',  emoji: '🧙', type: 'movie' as const },
  { id: 36,    name: 'History',       backdrop: '/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg',  emoji: '🏛️', type: 'movie' as const },
  { id: 27,    name: 'Horror',        backdrop: '/vno2LrEQr3lTOk3U1G1ihZsy64b.jpg',  emoji: '👻', type: 'movie' as const },
  { id: 10402, name: 'Music',         backdrop: '/kkfqNkGQR5og5sDjJTxTVmI9PW.jpg',   emoji: '🎵', type: 'movie' as const },
  { id: 9648,  name: 'Mystery',       backdrop: '/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg',  emoji: '🔍', type: 'movie' as const },
  { id: 10749, name: 'Romance',       backdrop: '/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',  emoji: '❤️', type: 'movie' as const },
  { id: 878,   name: 'Science Fiction', backdrop: '/sItIskd5xpiE64bBWYwZintkGf3.jpg', emoji: '🚀', type: 'movie' as const },
  { id: 10770, name: 'TV Movie',      backdrop: '/uIpJPDNFoeX0TVml9smPrs9KUVx.jpg',  emoji: '📺', type: 'movie' as const },
  { id: 53,    name: 'Thriller',      backdrop: '/6WqqEjiycNvDLjbEClM1zCwIbDD.jpg',  emoji: '😱', type: 'movie' as const },
  { id: 10752, name: 'War',           backdrop: '/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg',  emoji: '⚔️', type: 'movie' as const },
  { id: 37,    name: 'Western',       backdrop: '/vno2LrEQr3lTOk3U1G1ihZsy64b.jpg',  emoji: '🤠', type: 'movie' as const },
];

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure', backdrop: '/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg', emoji: '⚡', type: 'tv' as const },
  { id: 16,    name: 'Animation',     backdrop: '/xuJ0F9RfKvVSJNDg2usurQ9WvY5.jpg',  emoji: '🎨', type: 'tv' as const },
  { id: 35,    name: 'Comedy',        backdrop: '/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',  emoji: '😂', type: 'tv' as const },
  { id: 80,    name: 'Crime',         backdrop: '/6WqqEjiycNvDLjbEClM1zCwIbDD.jpg',  emoji: '🔫', type: 'tv' as const },
  { id: 99,    name: 'Documentary',   backdrop: '/uIpJPDNFoeX0TVml9smPrs9KUVx.jpg',  emoji: '🎥', type: 'tv' as const },
  { id: 18,    name: 'Drama',         backdrop: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',  emoji: '🎭', type: 'tv' as const },
  { id: 10751, name: 'Family',        backdrop: '/2meX1nMdScFOoV4370rqHWKmXhY.jpg',  emoji: '👨‍👩‍👧', type: 'tv' as const },
  { id: 10762, name: 'Kids',          backdrop: '/xuJ0F9RfKvVSJNDg2usurQ9WvY5.jpg',  emoji: '🧒', type: 'tv' as const },
  { id: 9648,  name: 'Mystery',       backdrop: '/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg',  emoji: '🔍', type: 'tv' as const },
  { id: 10763, name: 'News',          backdrop: '/kkfqNkGQR5og5sDjJTxTVmI9PW.jpg',   emoji: '📰', type: 'tv' as const },
  { id: 10764, name: 'Reality',       backdrop: '/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg',  emoji: '📸', type: 'tv' as const },
  { id: 10765, name: 'Sci-Fi & Fantasy', backdrop: '/sItIskd5xpiE64bBWYwZintkGf3.jpg', emoji: '🚀', type: 'tv' as const },
  { id: 10766, name: 'Soap',          backdrop: '/vno2LrEQr3lTOk3U1G1ihZsy64b.jpg',  emoji: '💫', type: 'tv' as const },
  { id: 10767, name: 'Talk',          backdrop: '/6WqqEjiycNvDLjbEClM1zCwIbDD.jpg',  emoji: '🎤', type: 'tv' as const },
  { id: 10768, name: 'War & Politics', backdrop: '/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg', emoji: '⚔️', type: 'tv' as const },
  { id: 37,    name: 'Western',       backdrop: '/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg',  emoji: '🤠', type: 'tv' as const },
];

function GenreCard({ genre }: { genre: typeof MOVIE_GENRES[0] | typeof TV_GENRES[0] }) {
  const href = genre.type === 'movie'
    ? `/movies?genre=${genre.id}`
    : `/tv-shows?genre=${genre.id}`;

  return (
    <Link href={href} className="group relative overflow-hidden rounded-xl aspect-video border border-white/10 group-hover:border-white/30 transition-all shadow-lg block">
      <Image
        src={`https://image.tmdb.org/t/p/w500${genre.backdrop}`}
        alt={genre.name}
        fill
        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 group-hover:from-black/70 transition-all" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
        <span className="text-2xl sm:text-3xl drop-shadow-lg">{genre.emoji}</span>
        <span className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-lg">
          {genre.name}
        </span>
      </div>
      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white/70 flex items-center gap-1">
        {genre.type === 'movie'
          ? <><Clapperboard className="w-2.5 h-2.5" />Movie</>
          : <><Tv2 className="w-2.5 h-2.5" />TV</>}
      </div>
    </Link>
  );
}

export default function GenresPage() {
  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />

      <div className="pt-20 sm:pt-24 pb-10">
        <div className="container mx-auto px-4 mb-8">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
          >
            Browse by Genre
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Find movies and shows in your favourite genre
          </p>
        </div>

        <div className="container mx-auto px-4 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-5 border-l-4 border-primary pl-4">
              <Clapperboard className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold">Movie Genres</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {MOVIE_GENRES.map(genre => (
                <GenreCard key={`movie-${genre.id}`} genre={genre} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-5 border-l-4 border-primary pl-4">
              <Tv2 className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold">TV Show Genres</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {TV_GENRES.map(genre => (
                <GenreCard key={`tv-${genre.id}`} genre={genre} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
