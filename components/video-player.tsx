'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronDown, Server, Loader2, CheckCircle, XCircle, 
  RefreshCw, Plus, Trash2, Settings, Zap, BarChart3,
  ChevronLeft, ChevronRight, SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  StreamingServer,
  getAllServers,
  getServersForAutoFetch,
  getEmbedUrl,
  addCustomServer,
  removeCustomServer,
  getCustomServers,
  updateServerStats,
  getServerStats,
  resetServerStats,
  DEFAULT_SERVERS,
} from '@/lib/streaming-servers';

interface VideoPlayerProps {
  tmdbId: number;
  imdbId?: string | null;
  type: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  totalSeasons?: number;
  episodesPerSeason?: number[];
  onClose: () => void;
}

type ServerStatus = 'idle' | 'loading' | 'success' | 'failed';

export function VideoPlayer({
  tmdbId,
  imdbId,
  type,
  title,
  season = 1,
  episode = 1,
  totalSeasons = 1,
  episodesPerSeason = [10],
  onClose,
}: VideoPlayerProps) {
  const [servers, setServers] = useState<StreamingServer[]>([]);
  const [currentServerIndex, setCurrentServerIndex] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoFetching, setIsAutoFetching] = useState(true);
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
  const [statusMessage, setStatusMessage] = useState('Finding best live server...');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddServer, setShowAddServer] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  
  // New server form state
  const [newServerName, setNewServerName] = useState('');
  const [newServerMovie, setNewServerMovie] = useState('');
  const [newServerTv, setNewServerTv] = useState('');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triedServersRef = useRef<Set<number>>(new Set());

  // Load servers on mount - use smart auto-fetch sorting
  useEffect(() => {
    const loadedServers = getServersForAutoFetch();
    // If no IMDB ID, filter out the all-servers option
    const filteredServers = imdbId 
      ? loadedServers 
      : loadedServers.filter(s => s.id !== 'all-servers');
    setServers(filteredServers);
    

  }, [imdbId]);

  // Block popup windows from streaming servers
  useEffect(() => {
    const originalOpen = window.open;
    
    // Override window.open to block popups from ads
    window.open = function(...args) {
      // Check if this is likely an ad popup (no url or suspicious patterns)
      const url = args[0];
      if (!url || 
          url === 'about:blank' || 
          url.includes('popup') || 
          url.includes('ad') ||
          url.includes('click') ||
          url.includes('track')) {
        return null;
      }
      return originalOpen.apply(window, args);
    };

    // Cleanup
    return () => {
      window.open = originalOpen;
    };
  }, []);

  const currentServer = servers[currentServerIndex];
  const embedUrl = currentServer 
    ? getEmbedUrl(currentServer, tmdbId, type, currentSeason, currentEpisode, imdbId)
    : '';

  const totalEpisodes = episodesPerSeason[currentSeason - 1] || 10;
  const hasNextEpisode = type === 'tv' && (currentEpisode < totalEpisodes || currentSeason < totalSeasons);
  const hasPrevEpisode = type === 'tv' && (currentEpisode > 1 || currentSeason > 1);

  const tryNextServer = useCallback(() => {
    const nextIndex = currentServerIndex + 1;
    if (nextIndex < servers.length) {
      const currentId = servers[currentServerIndex]?.id;
      if (currentId) {
        setServerStatuses(prev => ({ ...prev, [currentId]: 'failed' }));
        updateServerStats(currentId, false);
      }
      
      // Show more informative message
      const nextServer = servers[nextIndex];
      const stats = getServerStats()[nextServer?.id];
      const hasGoodStats = stats && stats.successCount > stats.failCount;
      
      setStatusMessage(
        hasGoodStats 
          ? `Trying ${nextServer?.name} (reliable)...`
          : `Trying ${nextServer?.name}...`
      );
      
      triedServersRef.current.add(currentServerIndex);
      setCurrentServerIndex(nextIndex);
      setIsLoading(true);
      setLoadStartTime(Date.now());
      

    } else {
      setIsAutoFetching(false);
      setIsLoading(false);
      setStatusMessage('All servers tried. Tap to retry or select manually.');
    }
  }, [currentServerIndex, servers]);

  const handleServerChange = (index: number) => {
    setIsAutoFetching(false);
    setIsLoading(true);
    setCurrentServerIndex(index);
    setLoadStartTime(Date.now());
    triedServersRef.current.clear();
    setServerStatuses({});
  };

  const handleRetryAutoFetch = () => {
    // Reload servers with smart sorting based on stats
    const loadedServers = getServersForAutoFetch();
    const filteredServers = imdbId 
      ? loadedServers 
      : loadedServers.filter(s => s.id !== 'all-servers');
    setServers(filteredServers);
    setIsAutoFetching(true);
    setIsLoading(true);
    setCurrentServerIndex(0);
    setLoadStartTime(Date.now());
    triedServersRef.current.clear();
    setServerStatuses({});
    setStatusMessage('Finding best live server...');
    

  };

  const handleNextEpisode = () => {
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(currentEpisode + 1);
    } else if (currentSeason < totalSeasons) {
      setCurrentSeason(currentSeason + 1);
      setCurrentEpisode(1);
    }
    setIsLoading(true);
    setLoadStartTime(Date.now());
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    } else if (currentSeason > 1) {
      const prevSeasonEpisodes = episodesPerSeason[currentSeason - 2] || 10;
      setCurrentSeason(currentSeason - 1);
      setCurrentEpisode(prevSeasonEpisodes);
    }
    setIsLoading(true);
    setLoadStartTime(Date.now());
  };

  const handleAddServer = () => {
    if (!newServerName || !newServerMovie || !newServerTv) return;
    
    const newServer = addCustomServer({
      name: newServerName,
      url: newServerMovie.split('/')[2] || newServerName,
      movieTemplate: newServerMovie,
      tvTemplate: newServerTv,
      priority: -1
    });
    
    setServers(prev => [newServer, ...prev]);
    setNewServerName('');
    setNewServerMovie('');
    setNewServerTv('');
    setShowAddServer(false);
  };

  const handleRemoveServer = (serverId: string) => {
    removeCustomServer(serverId);
    setServers(prev => prev.filter(s => s.id !== serverId));
    if (currentServer?.id === serverId) {
      setCurrentServerIndex(0);
    }
  };

  const handleResetStats = () => {
    resetServerStats();
    const loadedServers = getAllServers();
    const filteredServers = imdbId 
      ? loadedServers 
      : loadedServers.filter(s => s.id !== 'all-servers');
    setServers(filteredServers);
  };

  // Auto-fetch logic with smart timeout
  useEffect(() => {
    if (!isAutoFetching || servers.length === 0) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const currentId = servers[currentServerIndex]?.id;
    const stats = getServerStats()[currentId];
    
    if (currentId) {
      setServerStatuses(prev => ({ ...prev, [currentId]: 'loading' }));
    }
    
    // Show server reliability info
    const hasGoodStats = stats && stats.successCount > stats.failCount;
    setStatusMessage(
      hasGoodStats 
        ? `Trying ${servers[currentServerIndex]?.name} (reliable)...`
        : `Trying ${servers[currentServerIndex]?.name}...`
    );

    // Dynamic timeout: 4s for unknown servers, 6s for servers with good history
    const timeout = hasGoodStats ? 6000 : 4000;
    
    timeoutRef.current = setTimeout(() => {
      if (isLoading && isAutoFetching) {

        tryNextServer();
      }
    }, timeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentServerIndex, isAutoFetching, isLoading, tryNextServer, servers]);

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const loadTime = loadStartTime ? Date.now() - loadStartTime : undefined;
    const currentId = currentServer?.id;
    
    if (currentId) {
      setServerStatuses(prev => ({ ...prev, [currentId]: 'success' }));
      updateServerStats(currentId, true, loadTime);

    }
    
    setIsLoading(false);
    setStatusMessage(`Playing from ${currentServer?.name}`);
    setIsAutoFetching(false);
  };

  const getServerStatusIcon = (serverId: string) => {
    const status = serverStatuses[serverId];
    const stats = getServerStats()[serverId];
    
    if (status === 'loading') {
      return <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />;
    }
    if (status === 'success') {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    if (status === 'failed') {
      return <XCircle className="w-3 h-3 text-red-500" />;
    }
    if (stats && stats.successCount > 0) {
      const rate = stats.successCount / (stats.successCount + stats.failCount);
      if (rate > 0.7) return <Zap className="w-3 h-3 text-green-400" />;
      if (rate > 0.4) return <BarChart3 className="w-3 h-3 text-yellow-400" />;
    }
    return null;
  };

  const [controlsVisible, setControlsVisible] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMouseMoveRef = useRef<number>(Date.now());

  // Auto-hide controls and cursor after 3 seconds of inactivity
  const showControls = useCallback(() => {
    setControlsVisible(true);
    setCursorVisible(true);
    lastMouseMoveRef.current = Date.now();
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isLoading && !showSettings) {
        setControlsVisible(false);
        setCursorVisible(false);
      }
    }, 3000);
  }, [isLoading, showSettings]);

  // Also detect mouse movement over iframe using interval
  useEffect(() => {
    showControls();
    
    // Interval to check for mouse activity even when over iframe
    const checkInterval = setInterval(() => {
      const timeSinceLastMove = Date.now() - lastMouseMoveRef.current;
      if (timeSinceLastMove > 3000 && !isLoading && !showSettings && controlsVisible) {
        setControlsVisible(false);
        setCursorVisible(false);
      }
    }, 500);
    
    // Global mouse move listener to catch movements over iframe edge cases
    const handleGlobalMouseMove = () => {
      lastMouseMoveRef.current = Date.now();
      if (!controlsVisible) {
        setControlsVisible(true);
        setCursorVisible(true);
      }
    };
    
    // Keyboard listener to show controls
    const handleKeyPress = (e: KeyboardEvent) => {
      showControls();
      // ESC to close player
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      clearInterval(checkInterval);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showControls, isLoading, showSettings, controlsVisible, onClose]);

  if (servers.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin" />
          </div>
          <p className="text-white/70 text-sm">Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black group ${cursorVisible ? 'cursor-default' : 'cursor-none'}`}
      onMouseMove={showControls}
      onTouchStart={showControls}
      onClick={showControls}
    >
      {/* Netflix-style Top Gradient Header */}
      <div 
        className={`absolute top-0 left-0 right-0 z-20 transition-all duration-500 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent pt-4 pb-16 sm:pt-6 sm:pb-24 px-4 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="group/back flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover/back:scale-110 transition-transform" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-white font-bold text-base sm:text-xl md:text-2xl truncate drop-shadow-lg">
                  {title}
                </h1>
                {type === 'tv' && (
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                    Season {currentSeason}, Episode {currentEpisode}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Server Indicator (small) */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                <div className={`w-2 h-2 rounded-full ${serverStatuses[currentServer?.id || ''] === 'success' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-white/80 text-xs">{currentServer?.name}</span>
              </div>

              {/* Settings */}
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </DialogTrigger>
              <DialogContent className="max-w-[calc(100vw-24px)] sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Server Settings</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Add Server Button */}
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setShowAddServer(!showAddServer)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Server
                  </Button>
                  
                  {/* Add Server Form */}
                  {showAddServer && (
                    <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                      <div className="space-y-2">
                        <Label htmlFor="serverName">Server Name</Label>
                        <Input 
                          id="serverName"
                          placeholder="My Server"
                          value={newServerName}
                          onChange={(e) => setNewServerName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="movieUrl">Movie URL Template</Label>
                        <Input 
                          id="movieUrl"
                          placeholder="https://example.com/movie/{id}"
                          value={newServerMovie}
                          onChange={(e) => setNewServerMovie(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Use {'{id}'} for TMDB ID</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tvUrl">TV URL Template</Label>
                        <Input 
                          id="tvUrl"
                          placeholder="https://example.com/tv/{id}/{season}/{episode}"
                          value={newServerTv}
                          onChange={(e) => setNewServerTv(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Use {'{id}'}, {'{season}'}, {'{episode}'}</p>
                      </div>
                      <Button onClick={handleAddServer} className="w-full">
                        Add Server
                      </Button>
                    </div>
                  )}
                  
                  {/* Custom Servers List */}
                  {getCustomServers().length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Custom Servers</h4>
                      {getCustomServers().map((server) => (
                        <div 
                          key={server.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <span className="text-sm">{server.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleRemoveServer(server.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Server Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Server Statistics</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleResetStats}
                        className="text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {Object.entries(getServerStats()).map(([id, stats]) => {
                        const server = servers.find(s => s.id === id);
                        if (!server) return null;
                        const total = stats.successCount + stats.failCount;
                        const rate = total > 0 ? Math.round((stats.successCount / total) * 100) : 0;
                        return (
                          <div 
                            key={id}
                            className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded"
                          >
                            <span>{server.name}</span>
                            <span className={rate > 70 ? 'text-green-500' : rate > 40 ? 'text-yellow-500' : 'text-red-500'}>
                              {rate}% ({stats.successCount}/{total})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Default Servers Info */}
                  <div className="text-xs text-muted-foreground">
                    <p>{DEFAULT_SERVERS.length} default servers available</p>
                    <p>Servers are sorted by success rate</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Netflix-style Bottom Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-4 sm:pt-24 sm:pb-6 px-4 sm:px-8">
          {/* Server Status Bar */}
          {(isLoading || isAutoFetching) && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="relative w-5 h-5">
                <div className="w-5 h-5 rounded-full border-2 border-red-600/30 border-t-red-600 animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm truncate">{statusMessage}</p>
                {isAutoFetching && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${((currentServerIndex + 1) / servers.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/50 text-xs">{currentServerIndex + 1}/{servers.length}</span>
                  </div>
                )}
              </div>
              {!isAutoFetching && !isLoading && (
                <button
                  onClick={handleRetryAutoFetch}
                  className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Episode Navigation */}
            <div className="flex items-center gap-2">
              {type === 'tv' && (
                <>
                  <button
                    onClick={handlePrevEpisode}
                    disabled={!hasPrevEpisode}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    disabled={!hasNextEpisode}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Center: Season/Episode Selectors */}
            {type === 'tv' && (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Season Selector */}
                {totalSeasons > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="px-3 sm:px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                        <span className="text-white text-sm sm:text-base font-medium">S{currentSeason}</span>
                        <ChevronDown className="w-4 h-4 text-white/70" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto bg-zinc-900/95 backdrop-blur-sm border-white/10">
                      {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => {
                            setIsLoading(true);
                            setLoadStartTime(Date.now());
                            setCurrentSeason(s);
                            setCurrentEpisode(1);
                          }}
                          className={`${currentSeason === s ? 'bg-red-600/20 text-red-500' : 'text-white'}`}
                        >
                          Season {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Episode Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-3 sm:px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                      <span className="text-white text-sm sm:text-base font-medium">E{currentEpisode}</span>
                      <ChevronDown className="w-4 h-4 text-white/70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto bg-zinc-900/95 backdrop-blur-sm border-white/10">
                    {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((e) => (
                      <DropdownMenuItem
                        key={e}
                        onClick={() => {
                          setIsLoading(true);
                          setLoadStartTime(Date.now());
                          setCurrentEpisode(e);
                        }}
                        className={`${currentEpisode === e ? 'bg-red-600/20 text-red-500' : 'text-white'}`}
                      >
                        Episode {e}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Right: Server Selector + Next Episode */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Server Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 sm:px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Server className="w-4 h-4 text-white/70" />
                    <span className="text-white text-sm hidden sm:inline max-w-[80px] truncate">{currentServer?.name}</span>
                    {getServerStatusIcon(currentServer?.id || '')}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto bg-zinc-900/95 backdrop-blur-sm border-white/10">
                  <div className="px-3 py-2 text-xs font-semibold text-white/50 border-b border-white/10">
                    Servers - Sorted by reliability
                  </div>
                  {servers.map((s, index) => {
                    const stats = getServerStats()[s.id];
                    const total = stats ? stats.successCount + stats.failCount : 0;
                    const successRate = total > 0 ? Math.round((stats.successCount / total) * 100) : null;
                    const isReliable = stats && stats.successCount > stats.failCount;
                    const isRecent = stats?.lastSuccess && (Date.now() - stats.lastSuccess) < (1000 * 60 * 60);
                    
                    return (
                      <DropdownMenuItem
                        key={s.id}
                        onClick={() => handleServerChange(index)}
                        className={`flex items-center justify-between py-2.5 ${currentServerIndex === index ? 'bg-red-600/20' : ''}`}
                      >
                        <span className="flex items-center gap-2 text-white">
                          {isRecent && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">LIVE</span>}
                          {!isRecent && isReliable && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">GOOD</span>}
                          <span className="truncate max-w-[130px]">{s.name}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          {successRate !== null && total > 2 && (
                            <span className={`text-xs ${successRate > 60 ? 'text-green-400' : successRate > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {successRate}%
                            </span>
                          )}
                          {getServerStatusIcon(s.id)}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleRetryAutoFetch} className="text-red-500 py-2.5">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Auto-detect Best Server
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Next Episode Button */}
              {type === 'tv' && hasNextEpisode && (
                <button
                  onClick={handleNextEpisode}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                >
                  <span>Next Episode</span>
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Netflix-style Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
            {/* Netflix-style spinner */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Server className="w-6 h-6 sm:w-8 sm:h-8 text-white/70" />
              </div>
            </div>
            
            <div>
              <p className="text-white font-medium text-base sm:text-lg mb-2">{statusMessage}</p>
              {isAutoFetching && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-1">
                    {servers.slice(0, 5).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i < currentServerIndex ? 'bg-red-600/50' : 
                          i === currentServerIndex ? 'bg-red-600 animate-pulse' : 
                          'bg-white/20'
                        }`}
                      />
                    ))}
                    {servers.length > 5 && <span className="text-white/30 text-xs ml-1">+{servers.length - 5}</span>}
                  </div>
                </div>
              )}
            </div>

            {!isAutoFetching && (
              <button
                onClick={handleRetryAutoFetch}
                className="px-6 py-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video iframe container */}
      <div className="relative w-full h-full">
        {/* Transparent overlay to capture mouse events when controls are hidden */}
        {!controlsVisible && (
          <div 
            className="absolute inset-0 z-10"
            onMouseMove={showControls}
            onTouchStart={showControls}
            onClick={(e) => {
              showControls();
              // Allow click through after showing controls
              e.stopPropagation();
            }}
          />
        )}
        
        {/* Video iframe - no sandbox to allow streaming servers to work */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          onLoad={handleIframeLoad}
          onError={() => {
            // If current server fails, try next one
            if (isAutoFetching) {
              tryNextServer();
            }
          }}
        />
      </div>
    </div>
  );
}
