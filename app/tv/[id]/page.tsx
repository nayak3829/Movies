import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getTVDetails, getPopularTVShows, MovieResponse } from '@/lib/tmdb';
import { MovieRow } from '@/components/movie-row';
import { TVDetailClient } from '@/components/tv-detail-client';

interface TVPageProps {
  params: Promise<{ id: string }>;
}

const emptyResponse: MovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

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

  let similar = emptyResponse;
  try {
    similar = await getPopularTVShows();
  } catch {
    // Continue with empty similar shows
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <TVDetailClient show={show} />

      {/* Similar Shows */}
      {similar.results.length > 0 && (
        <section className="py-8">
          <MovieRow title="You Might Also Like" movies={similar.results} />
        </section>
      )}

      <Footer />
    </main>
  );
}
