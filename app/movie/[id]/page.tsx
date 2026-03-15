import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getMovieDetails, getPopularMovies, MovieResponse } from '@/lib/tmdb';
import { MovieRow } from '@/components/movie-row';
import { MovieDetailClient } from '@/components/movie-detail-client';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

const emptyResponse: MovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

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

  let similar = emptyResponse;
  try {
    similar = await getPopularMovies();
  } catch {
    // Continue with empty similar movies
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <MovieDetailClient movie={movie} />

      {/* Similar Movies */}
      {similar.results.length > 0 && (
        <section className="py-8">
          <MovieRow title="You Might Also Like" movies={similar.results} />
        </section>
      )}

      <Footer />
    </main>
  );
}
