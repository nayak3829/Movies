'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronDown, Server, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  totalSeasons?: number;
  episodesPerSeason?: number[];
  onClose: () => void;
}

const STREAMING_SERVERS = [
  { name: 'Vidsrc', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://vidsrc.xyz/embed/movie/${id}` : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },
  { name: 'Vidsrc VIP', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://vidsrc.vip/embed/movie/${id}` : `https://vidsrc.vip/embed/tv/${id}/${s}/${e}` },
  { name: 'Vidsrc ME', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://vidsrc.net/embed/movie/?tmdb=${id}` : `https://vidsrc.net/embed/tv/?tmdb=${id}&season=${s}&episode=${e}` },
  { name: 'AutoEmbed', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://autoembed.co/movie/tmdb/${id}` : `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
  { name: 'EmbedSU', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${s}/${e}` },
  { name: 'Videasy', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://player.videasy.net/movie/${id}` : `https://player.videasy.net/tv/${id}/${s}/${e}` },
  { name: 'VidFast', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://vidfast.co/movie/${id}` : `https://vidfast.co/tv/${id}/${s}/${e}` },
  { name: 'SuperEmbed', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://multiembed.mov/?video_id=${id}&tmdb=1` : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { name: 'MoviesAPI', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://moviesapi.club/movie/${id}` : `https://moviesapi.club/tv/${id}-${s}-${e}` },
  { name: '2Embed', getUrl: (id: number, type: string, s?: number, e?: number) => 
    type === 'movie' ? `https://www.2embed.cc/embed/${id}` : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
];

export function VideoPlayer({
  tmdbId,
  type,
  title,
  season = 1,
  episode = 1,
  totalSeasons = 1,
  episodesPerSeason = [10],
  onClose,
}: VideoPlayerProps) {
  const [currentServer, setCurrentServer] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoFetching, setIsAutoFetching] = useState(true);
  const [serverStatus, setServerStatus] = useState<Record<number, 'loading' | 'success' | 'failed'>>({});
  const [statusMessage, setStatusMessage] = useState('Auto-detecting best server...');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triedServersRef = useRef<Set<number>>(new Set());

  const server = STREAMING_SERVERS[currentServer];
  const embedUrl = server.getUrl(tmdbId, type, currentSeason, currentEpisode);

  const tryNextServer = useCallback(() => {
    const nextServer = currentServer + 1;
    if (nextServer < STREAMING_SERVERS.length) {
      setServerStatus(prev => ({ ...prev, [currentServer]: 'failed' }));
      setStatusMessage(`${STREAMING_SERVERS[currentServer].name} failed. Trying ${STREAMING_SERVERS[nextServer].name}...`);
      triedServersRef.current.add(currentServer);
      setCurrentServer(nextServer);
      setIsLoading(true);
    } else {
      setIsAutoFetching(false);
      setIsLoading(false);
      setStatusMessage('All servers tried. Select manually or retry.');
    }
  }, [currentServer]);

  const handleServerChange = (index: number) => {
    setIsAutoFetching(false);
    setIsLoading(true);
    setCurrentServer(index);
    triedServersRef.current.clear();
    setServerStatus({});
  };

  const handleRetryAutoFetch = () => {
    setIsAutoFetching(true);
    setIsLoading(true);
    setCurrentServer(0);
    triedServersRef.current.clear();
    setServerStatus({});
    setStatusMessage('Auto-detecting best server...');
  };

  // Auto-fetch logic with timeout
  useEffect(() => {
    if (!isAutoFetching) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setServerStatus(prev => ({ ...prev, [currentServer]: 'loading' }));
    setStatusMessage(`Trying ${STREAMING_SERVERS[currentServer].name}...`);

    // Set a 8-second timeout to try next server
    timeoutRef.current = setTimeout(() => {
      if (isLoading && isAutoFetching) {
        tryNextServer();
      }
    }, 8000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentServer, isAutoFetching, isLoading, tryNextServer]);

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setServerStatus(prev => ({ ...prev, [currentServer]: 'success' }));
    setStatusMessage(`Playing from ${STREAMING_SERVERS[currentServer].name}`);
    setIsAutoFetching(false);
  };

  const handleIframeError = () => {
    if (isAutoFetching) {
      tryNextServer();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-white font-semibold text-lg">{title}</h2>
              {type === 'tv' && (
                <p className="text-white/70 text-sm">
                  Season {currentSeason} Episode {currentEpisode}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Server Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <Server className="w-4 h-4" />
                  {server.name}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                {STREAMING_SERVERS.map((s, index) => (
                  <DropdownMenuItem
                    key={s.name}
                    onClick={() => handleServerChange(index)}
                    className={currentServer === index ? 'bg-primary/20' : ''}
                  >
                    {s.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Season Selector (TV only) */}
            {type === 'tv' && totalSeasons > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    Season {currentSeason}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => {
                        setIsLoading(true);
                        setCurrentSeason(s);
                        setCurrentEpisode(1);
                      }}
                      className={currentSeason === s ? 'bg-primary/20' : ''}
                    >
                      Season {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Episode Selector (TV only) */}
            {type === 'tv' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    Episode {currentEpisode}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                  {Array.from(
                    { length: episodesPerSeason[currentSeason - 1] || 10 },
                    (_, i) => i + 1
                  ).map((e) => (
                    <DropdownMenuItem
                      key={e}
                      onClick={() => {
                        setIsLoading(true);
                        setCurrentEpisode(e);
                      }}
                      className={currentEpisode === e ? 'bg-primary/20' : ''}
                    >
                      Episode {e}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-white">Loading {server.name}...</p>
          </div>
        </div>
      )}

      {/* Video iframe */}
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
