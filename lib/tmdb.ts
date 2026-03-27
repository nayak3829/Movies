const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// In-memory cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
      name: string;
    }[];
  };
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
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  };
  number_of_seasons?: number;
  seasons?: {
    season_number: number;
    episode_count: number;
    name: string;
  }[];
}

export function getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '/placeholder-movie.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY environment variable is not set. Please add it in project settings.');
  }
  
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });
  
  const cacheKey = `${endpoint}?${searchParams.toString()}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 }, // 1 hour ISR cache
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('TMDB API key is invalid. Please check your TMDB_API_KEY in project settings.');
    }
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Store in cache
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

export async function getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>(`/trending/all/${timeWindow}`);
}

export async function getPopularMovies(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/movie/popular');
}

export async function getTopRatedMovies(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/movie/top_rated');
}

export async function getUpcomingMovies(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/movie/upcoming');
}

export async function getNowPlayingMovies(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/movie/now_playing');
}

export async function getPopularTVShows(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/tv/popular');
}

export async function getTopRatedTVShows(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/tv/top_rated');
}

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return fetchFromTMDB<MovieDetails>(`/movie/${id}`, { append_to_response: 'videos,credits,external_ids' });
}

export async function getTVDetails(id: number): Promise<MovieDetails> {
  return fetchFromTMDB<MovieDetails>(`/tv/${id}`, { append_to_response: 'videos,credits,external_ids' });
}

export async function searchMulti(query: string): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/search/multi', { query });
}

export async function getMoviesByGenre(genreId: number): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/discover/movie', { with_genres: genreId.toString() });
}

export async function getTVShowsByGenre(genreId: number): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/discover/tv', { with_genres: genreId.toString() });
}

export async function getAiringTodayTV(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/tv/airing_today');
}

export async function getOnTheAirTV(): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>('/tv/on_the_air');
}

export async function getSimilarMovies(id: number): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>(`/movie/${id}/similar`);
}

export async function getSimilarTV(id: number): Promise<MovieResponse> {
  return fetchFromTMDB<MovieResponse>(`/tv/${id}/similar`);
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  movie_credits?: {
    cast: (Movie & { character: string; release_date: string })[];
  };
  tv_credits?: {
    cast: (Movie & { character: string; first_air_date: string })[];
  };
  images?: {
    profiles: { file_path: string }[];
  };
}

export async function getPersonDetails(id: number): Promise<PersonDetails> {
  return fetchFromTMDB<PersonDetails>(`/person/${id}`, {
    append_to_response: 'movie_credits,tv_credits,images',
  });
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
}

export interface SeasonDetails {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  episodes: Episode[];
}

export async function getSeasonDetails(tvId: number, seasonNumber: number): Promise<SeasonDetails> {
  return fetchFromTMDB<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
}

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  url: string;
}

export interface ReviewsResponse {
  results: Review[];
  total_results: number;
}

export async function getMovieReviews(id: number): Promise<ReviewsResponse> {
  return fetchFromTMDB<ReviewsResponse>(`/movie/${id}/reviews`);
}

export async function getTVReviews(id: number): Promise<ReviewsResponse> {
  return fetchFromTMDB<ReviewsResponse>(`/tv/${id}/reviews`);
}

export interface Collection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: Movie[];
}

export async function getCollection(id: number): Promise<Collection> {
  return fetchFromTMDB<Collection>(`/collection/${id}`);
}

// TV show utilities

export const GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];
