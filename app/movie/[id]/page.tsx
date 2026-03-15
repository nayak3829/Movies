import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getMovieDetails, getPopularMovies } from '@/lib/tmdb';
import { MovieRow } from '@/components/movie-row';
import { MovieDetailClient } from '@/components/movie-detail-client';

interface MoviePageProps {
  params: Promise<{ id: string }>;
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

  const similar = await getPopularMovies();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <MovieDetailClient movie={movie} />

      {/* Similar Movies */}
      <section className="py-8">
        <MovieRow title="You Might Also Like" movies={similar.results} />
      </section>

      <Footer />
    </main>
  );
}
