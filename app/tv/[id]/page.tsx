import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getTVDetails, getPopularTVShows } from '@/lib/tmdb';
import { MovieRow } from '@/components/movie-row';
import { TVDetailClient } from '@/components/tv-detail-client';

interface TVPageProps {
  params: Promise<{ id: string }>;
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

  const similar = await getPopularTVShows();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <TVDetailClient show={show} />

      {/* Similar Shows */}
      <section className="py-8">
        <MovieRow title="You Might Also Like" movies={similar.results} />
      </section>

      <Footer />
    </main>
  );
}
