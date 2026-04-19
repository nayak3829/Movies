import { NextRequest, NextResponse } from 'next/server';

interface StreamSource {
  url: string;
  quality: string;
}

interface SubtitleTrack {
  url: string;
  lang: string;
  default?: boolean;
}

interface StreamResponse {
  type: 'hls' | 'embed';
  url: string;
  sources?: StreamSource[];
  subtitles?: SubtitleTrack[];
}

// Streaming source configurations
const STREAMING_SOURCES = {
  movie: [
    { name: 'vidsrc.xyz', template: 'https://vidsrc.xyz/embed/movie/{tmdb_id}' },
    { name: 'vidsrc.cc', template: 'https://vidsrc.cc/v2/embed/movie/{tmdb_id}' },
    { name: 'vidsrc.to', template: 'https://vidsrc.to/embed/movie/{tmdb_id}' },
    { name: 'embed.su', template: 'https://embed.su/embed/movie/{tmdb_id}' },
    { name: '2embed', template: 'https://2embed.org/embed/movie/{tmdb_id}' },
  ],
  tv: [
    { name: 'vidsrc.xyz', template: 'https://vidsrc.xyz/embed/tv/{tmdb_id}/{season}/{episode}' },
    { name: 'vidsrc.cc', template: 'https://vidsrc.cc/v2/embed/tv/{tmdb_id}/{season}/{episode}' },
    { name: 'vidsrc.to', template: 'https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}' },
    { name: 'embed.su', template: 'https://embed.su/embed/tv/{tmdb_id}/{season}/{episode}' },
    { name: '2embed', template: 'https://2embed.org/embed/tv/{tmdb_id}/{season}/{episode}' },
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdb_id');
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  if (!tmdbId) {
    return NextResponse.json(
      { error: 'TMDB ID is required' },
      { status: 400 }
    );
  }

  if (type !== 'movie' && type !== 'tv') {
    return NextResponse.json(
      { error: 'Type must be movie or tv' },
      { status: 400 }
    );
  }

  try {
    // Get the appropriate sources for the content type
    const sources = type === 'movie' ? STREAMING_SOURCES.movie : STREAMING_SOURCES.tv;
    
    // Build URLs for all sources
    const streamUrls = sources.map(source => {
      let url = source.template.replace('{tmdb_id}', tmdbId);
      if (type === 'tv') {
        url = url.replace('{season}', season).replace('{episode}', episode);
      }
      return {
        name: source.name,
        url,
      };
    });

    // For now, return embed URLs since extracting HLS requires more complex scraping
    // In production, you would attempt to extract m3u8 streams from each source
    const response: StreamResponse = {
      type: 'embed',
      url: streamUrls[0].url, // Primary source
      sources: streamUrls.map((s, index) => ({
        url: s.url,
        quality: index === 0 ? '1080p' : index === 1 ? '720p' : '480p',
      })),
      subtitles: [], // Would be populated if HLS extraction is successful
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache stream URLs
      },
    });
  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json(
      { error: 'Failed to get stream URL' },
      { status: 500 }
    );
  }
}
