'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  SkipBack,
  SkipForward,
  ChevronLeft,
  X,
  Loader2,
  RefreshCw,
  PictureInPicture2,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { saveWatchProgress } from '@/components/watch-progress';

interface VideoPlayerProps {
  tmdbId: number;
  imdbId?: string | null;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string | null;
  season?: number;
  episode?: number;
  totalSeasons?: number;
  episodesPerSeason?: number[];
  onClose: () => void;
}

interface StreamSource {
  url: string;
  quality: string;
}

interface StreamResponse {
  type: 'hls' | 'embed';
  url: string;
  sources?: StreamSource[];
  subtitles?: { url: string; lang: string; default?: boolean }[];
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_TIMER_OPTIONS = [30, 60, 90, 120];

export function CustomVideoPlayer({
  tmdbId,
  imdbId,
  type,
  title,
  posterPath,
  season = 1,
  episode = 1,
  totalSeasons = 1,
  episodesPerSeason = [10],
  onClose,
}: VideoPlayerProps) {
  // State
  const [streamData, setStreamData] = useState<StreamResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualities, setQualities] = useState<{ height: number; bitrate: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
  const [isPiP, setIsPiP] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Ad state
  const [showPrerollAd, setShowPrerollAd] = useState(true);
  const [prerollCountdown, setPrerollCountdown] = useState(5);
  const [showMidrollAd, setShowMidrollAd] = useState(false);
  const [midrollShown, setMidrollShown] = useState(false);
  const [showBannerAd, setShowBannerAd] = useState(false);
  const [bannerAdDismissed, setBannerAdDismissed] = useState(false);
  const [popunderTriggered, setPopunderTriggered] = useState(false);
  
  // Sleep timer
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(0);
  
  // Autoplay next
  const [showAutoplayOverlay, setShowAutoplayOverlay] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState(10);
  
  // Still watching prompt
  const [showStillWatching, setShowStillWatching] = useState(false);
  
  // Episode navigation
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const totalEpisodes = episodesPerSeason[currentSeason - 1] || 10;
  const hasNextEpisode = type === 'tv' && (currentEpisode < totalEpisodes || currentSeason < totalSeasons);
  const hasPrevEpisode = type === 'tv' && (currentEpisode > 1 || currentSeason > 1);

  // Fetch stream data
  useEffect(() => {
    const fetchStream = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          tmdb_id: tmdbId.toString(),
          type,
        });
        
        if (type === 'tv') {
          params.set('season', currentSeason.toString());
          params.set('episode', currentEpisode.toString());
        }
        
        const response = await fetch(`/api/stream?${params}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch stream');
        }
        
        setStreamData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStream();
  }, [tmdbId, type, currentSeason, currentEpisode]);

  // Initialize HLS or fallback to iframe
  useEffect(() => {
    if (!streamData || !videoRef.current) return;
    
    const video = videoRef.current;
    const streamUrl = streamData.url;
    
    // Check if it's an HLS stream
    if (streamData.type === 'hls' && streamUrl.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (!showPrerollAd) {
            video.play().catch(() => {});
          }
        });
        
        hls.on(Hls.Events.LEVEL_LOADED, () => {
          setQualities(hls.levels.map(l => ({ height: l.height, bitrate: l.bitrate })));
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                tryNextSource();
                break;
            }
          }
        });
        
        hlsRef.current = hls;
        
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (!showPrerollAd) {
            video.play().catch(() => {});
          }
        });
      }
    }
    
    // For embed type, we'll use iframe fallback
    setIsLoading(false);
  }, [streamData, showPrerollAd]);

  // Try next source on error
  const tryNextSource = () => {
    if (streamData?.sources && currentSourceIndex < streamData.sources.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      setError('All sources failed. Please try again later.');
    }
  };

  // Preroll ad countdown
  useEffect(() => {
    if (!showPrerollAd || prerollCountdown <= 0) return;
    
    const timer = setInterval(() => {
      setPrerollCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showPrerollAd, prerollCountdown]);

  // Check for mid-roll ad (at 50% of video)
  useEffect(() => {
    if (duration > 0 && currentTime >= duration * 0.5 && !midrollShown && !showMidrollAd) {
      setShowMidrollAd(true);
      setMidrollShown(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [currentTime, duration, midrollShown, showMidrollAd]);

  // Show banner ad after 5 minutes, reappear every 15 minutes
  useEffect(() => {
    if (bannerAdDismissed || showPrerollAd || showMidrollAd) return;
    
    const showBannerAt = [300, 1200, 2100]; // 5, 20, 35 minutes
    const shouldShow = showBannerAt.some(time => 
      currentTime >= time && currentTime < time + 5
    );
    
    if (shouldShow && !showBannerAd) {
      setShowBannerAd(true);
      setBannerAdDismissed(false);
    }
  }, [currentTime, bannerAdDismissed, showPrerollAd, showMidrollAd, showBannerAd]);

  // Trigger popunder once on first play
  useEffect(() => {
    if (!popunderTriggered && isPlaying) {
      const hasTriggered = sessionStorage.getItem('popunderTriggered');
      if (!hasTriggered) {
        // Popunder script would be triggered here
        sessionStorage.setItem('popunderTriggered', 'true');
        setPopunderTriggered(true);
      }
    }
  }, [isPlaying, popunderTriggered]);

  // Sleep timer
  useEffect(() => {
    if (sleepTimer === null) return;
    
    setSleepTimeRemaining(sleepTimer * 60);
    
    const interval = setInterval(() => {
      setSleepTimeRemaining(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sleepTimer, onClose]);

  // Still watching check (90 minutes of no interaction)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastInteractionRef.current;
      if (idleTime >= 90 * 60 * 1000 && isPlaying) {
        setShowStillWatching(true);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    }, 60000);
    
    return () => clearInterval(checkInterval);
  }, [isPlaying]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      lastInteractionRef.current = Date.now();
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying && !showPrerollAd && !showMidrollAd) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    const player = playerRef.current;
    if (player) {
      player.addEventListener('mousemove', handleMouseMove);
      player.addEventListener('touchstart', handleMouseMove);
    }
    
    return () => {
      if (player) {
        player.removeEventListener('mousemove', handleMouseMove);
        player.removeEventListener('touchstart', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showPrerollAd, showMidrollAd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPrerollAd || showMidrollAd) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, showPrerollAd, showMidrollAd]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Save watch progress
  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      saveWatchProgress(tmdbId, type, currentTime, duration, {
        title,
        posterPath,
        season: type === 'tv' ? currentSeason : undefined,
        episode: type === 'tv' ? currentEpisode : undefined,
      });
    }
  }, [currentTime, duration, tmdbId, type, title, posterPath, currentSeason, currentEpisode]);

  // Player controls
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = value[0];
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  }, []);

  const handleQualityChange = useCallback((level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, []);

  const handleNextEpisode = useCallback(() => {
    setShowAutoplayOverlay(false);
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(prev => prev + 1);
    } else if (currentSeason < totalSeasons) {
      setCurrentSeason(prev => prev + 1);
      setCurrentEpisode(1);
    }
  }, [currentEpisode, totalEpisodes, currentSeason, totalSeasons]);

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode > 1) {
      setCurrentEpisode(prev => prev - 1);
    } else if (currentSeason > 1) {
      setCurrentSeason(prev => prev - 1);
      setCurrentEpisode(episodesPerSeason[currentSeason - 2] || 10);
    }
  }, [currentEpisode, currentSeason, episodesPerSeason]);

  // Skip preroll ad
  const skipPrerollAd = () => {
    setShowPrerollAd(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Skip midroll ad
  const skipMidrollAd = () => {
    setShowMidrollAd(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleEnded = () => {
    if (hasNextEpisode) {
      setShowAutoplayOverlay(true);
      setAutoplayCountdown(10);
    }
  };

  // Autoplay countdown
  useEffect(() => {
    if (!showAutoplayOverlay || autoplayCountdown <= 0) return;
    
    const timer = setInterval(() => {
      setAutoplayCountdown(prev => {
        if (prev <= 1) {
          handleNextEpisode();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showAutoplayOverlay, autoplayCountdown, handleNextEpisode]);

  // Minimized player
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 md:bottom-4 right-4 w-80 aspect-video bg-black rounded-lg shadow-2xl overflow-hidden z-50 border border-border">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="bg-black/50 hover:bg-black/70"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 bg-black/50 hover:bg-black/70"
            onClick={() => setIsMinimized(false)}
          >
            <Maximize className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 bg-black/50 hover:bg-black/70"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Check if using embed fallback
  const useEmbed = streamData?.type === 'embed' || !streamData?.url?.endsWith('.m3u8');

  return (
    <div
      ref={playerRef}
      className={cn(
        'fixed inset-0 z-50 bg-black flex flex-col',
        !showControls && isPlaying && 'cursor-none'
      )}
    >
      {/* Top Bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-white/20"
              onClick={onClose}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              {type === 'tv' && (
                <p className="text-sm text-white/70">
                  Season {currentSeason}, Episode {currentEpisode}
                </p>
              )}
            </div>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-white/20"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-white/70">Loading stream...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <p className="text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : useEmbed ? (
          <iframe
            ref={iframeRef}
            src={streamData?.sources?.[currentSourceIndex]?.url || streamData?.url}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={posterPath ? `https://image.tmdb.org/t/p/w1280${posterPath}` : undefined}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onProgress={handleProgress}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onClick={togglePlay}
            playsInline
          />
        )}
      </div>

      {/* Preroll Ad Overlay */}
      {showPrerollAd && (
        <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full p-8 text-center">
            <p className="text-white/70 mb-4">Advertisement</p>
            <div className="bg-muted/20 border border-border rounded-lg p-8 mb-6">
              <p className="text-white/50 text-sm">Ad Content Here</p>
              {/* Monetag In-Page Push ad would render here */}
              <div id="monetag-preroll" className="min-h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading ad...</p>
              </div>
            </div>
            <Button
              onClick={skipPrerollAd}
              disabled={prerollCountdown > 0}
              className="min-w-[150px]"
            >
              {prerollCountdown > 0 ? `Skip in ${prerollCountdown}s` : 'Skip Ad'}
            </Button>
          </div>
        </div>
      )}

      {/* Midroll Ad Overlay */}
      {showMidrollAd && (
        <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center">
          <div className="max-w-xl w-full p-8 text-center">
            <p className="text-white/70 mb-4">Video will resume shortly</p>
            <div className="bg-muted/20 border border-border rounded-lg p-8 mb-6">
              <p className="text-white/50 text-sm">Ad Content Here</p>
              <div id="monetag-midroll" className="min-h-[250px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading ad...</p>
              </div>
            </div>
            <Button onClick={skipMidrollAd}>
              Continue Watching
            </Button>
          </div>
        </div>
      )}

      {/* Banner Ad Overlay */}
      {showBannerAd && !bannerAdDismissed && !showPrerollAd && !showMidrollAd && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-black/80 rounded-lg p-2 flex items-center gap-2">
          <div id="monetag-banner" className="w-[728px] max-w-[90vw] h-[90px] flex items-center justify-center bg-muted/20 rounded">
            <p className="text-muted-foreground text-xs">Advertisement</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 hover:bg-white/20"
            onClick={() => setBannerAdDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Still Watching Prompt */}
      {showStillWatching && (
        <div className="absolute inset-0 z-30 bg-black/90 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Still watching?</h3>
            <Button
              size="lg"
              onClick={() => {
                setShowStillWatching(false);
                lastInteractionRef.current = Date.now();
                videoRef.current?.play();
              }}
            >
              Continue Watching
            </Button>
          </div>
        </div>
      )}

      {/* Autoplay Next Episode Overlay */}
      {showAutoplayOverlay && hasNextEpisode && (
        <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/70 mb-2">Next episode in</p>
            <p className="text-5xl font-bold text-white mb-6">{autoplayCountdown}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowAutoplayOverlay(false)}>
                Cancel
              </Button>
              <Button onClick={handleNextEpisode}>
                Play Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls - Only show for HLS streams */}
      {!useEmbed && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="relative h-1 bg-white/20 rounded-full group cursor-pointer">
              <div
                className="absolute h-full bg-white/30 rounded-full"
                style={{ width: `${(buffered / duration) * 100}%` }}
              />
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>

              {/* Skip Back/Forward */}
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-white/20"
                onClick={() => seek(-10)}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-white/20"
                onClick={() => seek(10)}
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              {/* Episode Navigation */}
              {type === 'tv' && (
                <>
                  {hasPrevEpisode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-white/20 gap-1"
                      onClick={handlePrevEpisode}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Button>
                  )}
                  {hasNextEpisode && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-white/20 gap-1"
                      onClick={handleNextEpisode}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <div className="w-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-sm text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sleep Timer */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="hover:bg-white/20">
                    <Moon className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                  <DropdownMenuLabel>Sleep Timer</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SLEEP_TIMER_OPTIONS.map(minutes => (
                    <DropdownMenuItem
                      key={minutes}
                      onClick={() => setSleepTimer(minutes)}
                    >
                      {minutes} minutes
                    </DropdownMenuItem>
                  ))}
                  {sleepTimer && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSleepTimer(null)}>
                        Cancel Timer ({Math.ceil(sleepTimeRemaining / 60)}m left)
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Playback Speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="hover:bg-white/20">
                    {playbackSpeed}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                  <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {PLAYBACK_SPEEDS.map(speed => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        if (videoRef.current) {
                          videoRef.current.playbackRate = speed;
                        }
                      }}
                    >
                      {speed}x {speed === 1 && '(Normal)'}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quality */}
              {qualities.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="hover:bg-white/20">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                    <DropdownMenuLabel>Quality</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleQualityChange(-1)}>
                      Auto {currentQuality === -1 && '✓'}
                    </DropdownMenuItem>
                    {qualities.map((q, i) => (
                      <DropdownMenuItem
                        key={i}
                        onClick={() => handleQualityChange(i)}
                      >
                        {q.height}p {currentQuality === i && '✓'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Subtitles */}
              <Button size="icon" variant="ghost" className="hover:bg-white/20">
                <Subtitles className="w-5 h-5" />
              </Button>

              {/* PiP */}
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-white/20"
                onClick={togglePiP}
              >
                <PictureInPicture2 className="w-5 h-5" />
              </Button>

              {/* Fullscreen */}
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
