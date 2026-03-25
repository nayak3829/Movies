import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 86400;

import { Navbar } from '@/components/navbar';
import { getMovieDetails, getSimilarMovies, getMovieReviews, MovieResponse } from '@/lib/tmdb';
import { MovieRow } from '@/components/movie-row';
import { MovieDetailClient } from '@/components/movie-detail-client';
import { ReviewsSection } from '@/components/reviews-section';
import { UserRating } from '@/components/user-rating';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

const emptyResponse: MovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  if (isNaN(movieId)) return {};

  try {
    const movie = await getMovieDetails(movieId);
    const title = movie.title || 'Movie';
    const description = movie.overview
      ? movie.overview.slice(0, 160)
      : `Watch ${title} on TechVyro`;
    const year = movie.release_date?.split('-')[0];
    const fullTitle = year ? `${title} (${year}) — TechVyro` : `${title} — TechVyro`;

    const imageUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : undefined;

    return {
      title: fullTitle,
      description,
      openGraph: {
        title: fullTitle,
        description,
        type: 'video.movie',
        ...(imageUrl && {
          images: [{ url: imageUrl, width: 1280, height: 720, alt: title }],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
    };
  } catch {
    return { title: 'Movie — TechVyro' };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = parseInt(id, 10);
  
  if (isNaN(movieId)) {
    notFound();
  }

  let movie;
  try {
    movie = await getMovieDetails(movieId);
  } catch {
    notFound();
  }

  const [similar, reviews] = await Promise.allSettled([
    getSimilarMovies(movieId),
    getMovieReviews(movieId),
  ]);

  const similarMovies = similar.status === 'fulfilled' ? similar.value : emptyResponse;
  const movieReviews = reviews.status === 'fulfilled' ? reviews.value.results : [];

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      
      <MovieDetailClient movie={movie} />

      <UserRating mediaId={movie.id} mediaType="movie" title={movie.title} />

      <ReviewsSection reviews={movieReviews} />

      {similarMovies.results.length > 0 && (
        <section className="py-8">
          <MovieRow title="More Like This" movies={similarMovies.results} />
        </section>
      )}
    </main>
  );
}
