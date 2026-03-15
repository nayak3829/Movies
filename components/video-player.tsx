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
    
    // Log server order for debugging
    console.log('[v0] Server order for auto-fetch:', filteredServers.map(s => s.name).slice(0, 5));
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
      
      console.log('[v0] Switching to server:', nextServer?.name);
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
    
    console.log('[v0] Retrying with server order:', filteredServers.map(s => s.name).slice(0, 5));
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
        console.log('[v0] Server timeout:', servers[currentServerIndex]?.name);
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
      console.log('[v0] Server loaded successfully:', currentServer?.name, 'in', loadTime, 'ms');
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

  if (servers.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black via-black/80 to-transparent p-3 sm:p-4 pb-6 sm:pb-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-semibold text-sm sm:text-lg truncate max-w-[150px] sm:max-w-none">{title}</h2>
              {type === 'tv' && (
                <p className="text-white/70 text-xs sm:text-sm">
                  S{currentSeason} E{currentEpisode}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Episode Navigation for TV - Hidden on very small screens */}
            {type === 'tv' && (
              <div className="hidden xs:flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handlePrevEpisode}
                  disabled={!hasPrevEpisode}
                  className="h-7 w-7 sm:h-9 sm:w-9"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleNextEpisode}
                  disabled={!hasNextEpisode}
                  className="h-7 w-7 sm:h-9 sm:w-9"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            )}

            {/* Server Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-1 sm:gap-2 h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                  <Server className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="max-w-[60px] sm:max-w-[100px] truncate hidden xs:inline">{currentServer?.name}</span>
                  {getServerStatusIcon(currentServer?.id || '')}
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Servers ({servers.length}) - Sorted by reliability
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
                      className={`flex items-center justify-between ${currentServerIndex === index ? 'bg-primary/20' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        {s.isCustom && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">Custom</span>}
                        {isRecent && <span className="text-[10px] bg-green-500/20 text-green-400 px-1 rounded">Live</span>}
                        {!isRecent && isReliable && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded">Good</span>}
                        <span className="truncate max-w-[120px]">{s.name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        {successRate !== null && total > 2 && (
                          <span className={`text-[10px] ${successRate > 60 ? 'text-green-400' : successRate > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {successRate}%
                          </span>
                        )}
                        {getServerStatusIcon(s.id)}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRetryAutoFetch} className="text-yellow-500">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto-detect Best Server
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Season Selector (TV only) */}
            {type === 'tv' && totalSeasons > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="gap-1 sm:gap-2 h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                    S{currentSeason}
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => {
                        setIsLoading(true);
                        setLoadStartTime(Date.now());
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
                  <Button variant="secondary" className="gap-1 sm:gap-2 h-7 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                    E{currentEpisode}
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                  {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((e) => (
                    <DropdownMenuItem
                      key={e}
                      onClick={() => {
                        setIsLoading(true);
                        setLoadStartTime(Date.now());
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

            {/* Settings Button */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="icon" className="h-7 w-7 sm:h-9 sm:w-9">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
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

        {/* Status Message */}
        {(isLoading || isAutoFetching) && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm text-white/70">
            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-5">
          <div className="flex flex-col items-center gap-3 sm:gap-4 px-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Server className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm sm:text-base">{statusMessage}</p>
              {isAutoFetching && (
                <p className="text-white/50 text-xs sm:text-sm mt-1">
                  Server {currentServerIndex + 1} of {servers.length}
                </p>
              )}
            </div>
            {!isAutoFetching && (
              <Button 
                variant="secondary" 
                onClick={handleRetryAutoFetch}
                className="gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Auto-detect
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Next Episode Button (TV only) */}
      {type === 'tv' && hasNextEpisode && !isLoading && (
        <Button
          variant="secondary"
          className="absolute bottom-16 sm:bottom-20 right-3 sm:right-4 z-10 gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
          onClick={handleNextEpisode}
        >
          <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Next Episode</span>
          <span className="xs:hidden">Next</span>
        </Button>
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
  );
}
