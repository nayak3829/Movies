import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 86400;

import { Navbar } from '@/components/navbar';
import { getTVDetails, getSimilarTV, getTVReviews, MovieResponse } from '@/lib/tmdb';
import { MovieRow } from '@/components/movie-row';
import { TVDetailClient } from '@/components/tv-detail-client';
import { ReviewsSection } from '@/components/reviews-section';
import { UserRating } from '@/components/user-rating';

interface TVPageProps {
  params: Promise<{ id: string }>;
}

const emptyResponse: MovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const { id } = await params;
  const tvId = parseInt(id, 10);
  if (isNaN(tvId)) return {};

  try {
    const show = await getTVDetails(tvId);
    const title = show.name || show.title || 'TV Show';
    const description = show.overview
      ? show.overview.slice(0, 160)
      : `Watch ${title} on TechVyro`;
    const year = show.first_air_date?.split('-')[0];
    const fullTitle = year ? `${title} (${year}) — TechVyro` : `${title} — TechVyro`;

    const imageUrl = show.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
      : show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : undefined;

    return {
      title: fullTitle,
      description,
      openGraph: {
        title: fullTitle,
        description,
        type: 'video.tv_show',
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
    return { title: 'TV Show — TechVyro' };
  }
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  const tvId = parseInt(id, 10);
  
  if (isNaN(tvId)) {
    notFound();
  }

  let show;
  try {
    show = await getTVDetails(tvId);
  } catch {
    notFound();
  }

  const [similar, reviews] = await Promise.allSettled([
    getSimilarTV(tvId),
    getTVReviews(tvId),
  ]);

  const similarShows = similar.status === 'fulfilled' ? similar.value : emptyResponse;
  const showReviews = reviews.status === 'fulfilled' ? reviews.value.results : [];

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      
      <TVDetailClient show={show} />

      <UserRating mediaId={show.id} mediaType="tv" title={show.name || show.title || ''} />

      <ReviewsSection reviews={showReviews} />

      {similarShows.results.length > 0 && (
        <section className="py-8">
          <MovieRow title="More Like This" movies={similarShows.results} />
        </section>
      )}
    </main>
  );
}
