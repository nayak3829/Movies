'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronDown, Server, Loader2, CheckCircle, XCircle, 
  RefreshCw, Plus, Trash2, Settings, Zap, BarChart3,
  ChevronLeft, ChevronRight, SkipForward, Crown, Medal, Award,
  TrendingUp, TrendingDown, Clock, Activity, Wifi, CheckCircle2, AlertTriangle,
  Maximize, Minimize, Keyboard, List
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
  const [serverStatsRefresh, setServerStatsRefresh] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showEpisodePanel, setShowEpisodePanel] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Track fullscreen changes
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Auto-refresh server stats when settings dialog is open
  useEffect(() => {
    if (!showSettings) return;
    const interval = setInterval(() => {
      setServerStatsRefresh(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [showSettings]);

  // Get enhanced server list with stats
  const getEnhancedServerList = () => {
    const stats = getServerStats();
    return servers.map(server => {
      const serverStats = stats[server.id];
      const total = serverStats ? serverStats.successCount + serverStats.failCount : 0;
      const successRate = total > 0 ? serverStats!.successCount / total : null;
      const avgLoadTime = serverStats?.avgLoadTime ?? null;
      const lastUsed = serverStats?.lastSuccess ?? null;
      return {
        ...server,
        stats: serverStats,
        successRate,
        total,
        avgLoadTime,
        lastUsed,
        successCount: serverStats?.successCount ?? 0,
        failCount: serverStats?.failCount ?? 0
      };
    });
  };

  // Get summary stats
  const getSummaryStats = () => {
    const serverList = getEnhancedServerList();
    const totalServers = serverList.length;
    const testedServers = serverList.filter(s => s.total > 0).length;
    const goodServers = serverList.filter(s => s.successRate !== null && s.successRate > 0.7).length;
    const totalRequests = serverList.reduce((acc, s) => acc + s.total, 0);
    const avgSuccessRate = serverList.filter(s => s.successRate !== null).length > 0
      ? serverList.filter(s => s.successRate !== null).reduce((acc, s) => acc + (s.successRate ?? 0), 0) / serverList.filter(s => s.successRate !== null).length
      : 0;
    return { totalServers, testedServers, goodServers, totalRequests, avgSuccessRate };
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triedServersRef = useRef<Set<number>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  // Mount check for hydration safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load servers on mount - use smart auto-fetch sorting and start auto-fetch immediately
  useEffect(() => {
    if (!isMounted) return;
    
    const loadedServers = getServersForAutoFetch();
    // If no IMDB ID, filter out the all-servers option
    const filteredServers = imdbId 
      ? loadedServers 
      : loadedServers.filter(s => s.id !== 'all-servers');
    setServers(filteredServers);
    
    // Start auto-fetch immediately with best server
    if (filteredServers.length > 0) {
      setIsAutoFetching(true);
      setIsLoading(true);
      setCurrentServerIndex(0);
      setLoadStartTime(Date.now());
      
      // Show info about the first server being tried
      const firstServer = filteredServers[0];
      const stats = getServerStats()[firstServer?.id];
      const hasGoodStats = stats && stats.successCount > stats.failCount;
      
      setStatusMessage(
        hasGoodStats 
          ? `Connecting to ${firstServer?.name} (most reliable)...`
          : `Connecting to ${firstServer?.name}...`
      );
    }
  }, [imdbId, isMounted, tmdbId, type]);

  // Block popup windows and 3rd party redirects from streaming servers
  useEffect(() => {
    const originalOpen = window.open;
    
    // Override window.open to block ALL popups from streaming sites
    window.open = function() {
      return null;
    };

    // Block click events that try to open new windows
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        const targetAttr = anchor.getAttribute('target');
        if (targetAttr === '_blank' || (href && (href.startsWith('http') && !href.includes(window.location.host)))) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      window.open = originalOpen;
      document.removeEventListener('click', handleClick, true);
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

  const handleNextEpisode = useCallback(() => {
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(currentEpisode + 1);
    } else if (currentSeason < totalSeasons) {
      setCurrentSeason(currentSeason + 1);
      setCurrentEpisode(1);
    }
    setIsLoading(true);
    setLoadStartTime(Date.now());
  }, [currentEpisode, totalEpisodes, currentSeason, totalSeasons]);

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    } else if (currentSeason > 1) {
      const prevSeasonEpisodes = episodesPerSeason[currentSeason - 2] || 10;
      setCurrentSeason(currentSeason - 1);
      setCurrentEpisode(prevSeasonEpisodes);
    }
    setIsLoading(true);
    setLoadStartTime(Date.now());
  }, [currentEpisode, currentSeason, totalSeasons, episodesPerSeason]);

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

  // Auto-fetch logic with smart timeout - starts immediately when servers are loaded
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
    
    // Show server reliability info with better messaging
    const hasGoodStats = stats && stats.successCount > stats.failCount;
    const successRate = stats ? Math.round((stats.successCount / (stats.successCount + stats.failCount)) * 100) : 0;
    
    if (currentServerIndex === 0) {
      setStatusMessage(
        hasGoodStats 
          ? `Connecting to ${servers[currentServerIndex]?.name} (${successRate}% reliable)...`
          : `Connecting to ${servers[currentServerIndex]?.name}...`
      );
    } else {
      setStatusMessage(
        hasGoodStats 
          ? `Trying ${servers[currentServerIndex]?.name} (${successRate}% reliable)...`
          : `Trying ${servers[currentServerIndex]?.name}...`
      );
    }

    // Dynamic timeout: 4s for servers with good history, 3s for unknown/bad servers
    const timeout = hasGoodStats ? 4000 : 3000;
    
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
    
    // Auto-hide settings dialog after video loads
    if (showSettings) {
      setTimeout(() => {
        setShowSettings(false);
      }, 1500);
    }
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
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
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

  // Dedicated keyboard shortcuts (F=fullscreen, ←→=episodes)
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleFullscreen();
      }
      if (e.key === 'ArrowRight' && type === 'tv') {
        e.preventDefault();
        handleNextEpisode();
      }
      if (e.key === 'ArrowLeft' && type === 'tv') {
        e.preventDefault();
        handlePrevEpisode();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [handleFullscreen, handleNextEpisode, handlePrevEpisode, type]);

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
      ref={playerRef}
      className={`fixed z-50 bg-black group transition-all duration-500 ${
        isMinimized
          ? 'bottom-4 right-4 w-72 sm:w-80 h-44 sm:h-48 rounded-xl overflow-hidden shadow-2xl border border-white/20 cursor-default'
          : `inset-0 ${cursorVisible ? 'cursor-default' : 'cursor-none'}`
      }`}
      onMouseMove={!isMinimized ? showControls : undefined}
      onTouchStart={!isMinimized ? showControls : undefined}
      onClick={!isMinimized ? showControls : undefined}
    >
      {/* Minimized overlay with restore button */}
      {isMinimized && (
        <div className="absolute inset-0 z-[60] flex items-start justify-between p-2 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <p className="text-white text-[10px] font-medium truncate max-w-[60%] drop-shadow">{title}</p>
          <div className="flex gap-1 pointer-events-auto">
            <button
              onClick={() => setIsMinimized(false)}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
              title="Restore"
            >
              <Maximize className="w-3 h-3 text-white" />
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-red-600/80 flex items-center justify-center transition-colors"
              title="Close"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}
      {/* Netflix-style Top Gradient Header */}
      <div 
        className={`absolute top-0 left-0 right-0 z-[35] transition-all duration-500 ${
          isMinimized ? 'hidden' : controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
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
              {/* Minimize / PiP Button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 items-center justify-center"
                title="Mini Player (Picture in Picture)"
              >
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>

              {/* Server Indicator - clickable to open settings */}
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${serverStatuses[currentServer?.id || ''] === 'success' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-white/80 text-[10px] sm:text-xs max-w-[60px] sm:max-w-none truncate">{currentServer?.name}</span>
                <Settings className="w-3 h-3 text-white/50" />
              </button>

              {/* Settings */}
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </DialogTrigger>
              <DialogContent className="w-[calc(100vw-32px)] max-w-md max-h-[85vh] overflow-y-auto p-4">
                <DialogHeader className="pb-2">
                  <DialogTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm">
                      <Server className="w-4 h-4 text-red-500" />
                      Server Settings
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setServerStatsRefresh(prev => prev + 1)}
                        className="p-1 rounded-md hover:bg-muted transition-colors"
                        title="Refresh"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={handleResetStats}
                        className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
                        title="Reset all stats"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </DialogTitle>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    Auto-updating every 5s
                  </p>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Audio/Subtitle Tip */}
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-blue-400 text-[10px] font-bold">i</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-blue-400 mb-0.5">Audio & Subtitles</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Use the CC/Settings icon inside the player to change audio language and subtitles.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Server & Quick Switch */}
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-muted-foreground">Current Server</span>
                      <button
                        onClick={() => {
                          handleRetryAutoFetch();
                          setShowSettings(false);
                        }}
                        className="text-[11px] text-red-500 hover:text-red-400 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Auto-detect
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${serverStatuses[currentServer?.id || ''] === 'success' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                      <span className="font-medium text-sm text-foreground truncate">{currentServer?.name}</span>
                    </div>
                  </div>

                  {/* Quick Server Switch */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-medium flex items-center gap-1.5 text-muted-foreground">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      Quick Switch Server
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                      {servers.slice(0, 8).map((s, index) => {
                        const stats = getServerStats()[s.id];
                        const isActive = currentServerIndex === index;
                        const isGood = stats && stats.successCount > stats.failCount;
                        
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              handleServerChange(index);
                              setShowSettings(false);
                            }}
                            className={`p-1.5 rounded-lg text-left text-[10px] transition-all ${
                              isActive 
                                ? 'bg-red-500/20 border-2 border-red-500' 
                                : 'bg-muted/30 border border-border hover:border-red-500/50 active:bg-red-500/10'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {isGood && <Zap className="w-2.5 h-2.5 text-green-500 shrink-0" />}
                              <span className="truncate font-medium">{s.name.replace(' (Multi-Audio)', '')}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="flex flex-col items-center p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                      <Server className="w-3 h-3 text-red-500 mb-0.5" />
                      <span className="text-sm font-bold text-foreground">{getSummaryStats().totalServers}</span>
                      <span className="text-[9px] text-muted-foreground">Total</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mb-0.5" />
                      <span className="text-sm font-bold text-green-500">{getSummaryStats().goodServers}</span>
                      <span className="text-[9px] text-muted-foreground">Good</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Activity className="w-3 h-3 text-blue-500 mb-0.5" />
                      <span className="text-sm font-bold text-blue-500">{getSummaryStats().totalRequests}</span>
                      <span className="text-[9px] text-muted-foreground">Requests</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <TrendingUp className="w-3 h-3 text-yellow-500 mb-0.5" />
                      <span className="text-sm font-bold text-yellow-500">{Math.round(getSummaryStats().avgSuccessRate * 100)}%</span>
                      <span className="text-[9px] text-muted-foreground">Avg Rate</span>
                    </div>
                  </div>

                  {/* Add Server Button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full gap-1.5 text-xs h-8"
                    onClick={() => setShowAddServer(!showAddServer)}
                  >
                    <Plus className="w-3 h-3" />
                    Add Custom Server
                  </Button>
                  
                  {/* Add Server Form */}
                  {showAddServer && (
                    <div className="space-y-2 p-2.5 border rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <Label htmlFor="serverName" className="text-[11px]">Server Name</Label>
                        <Input 
                          id="serverName"
                          placeholder="My Server"
                          value={newServerName}
                          onChange={(e) => setNewServerName(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="movieUrl" className="text-[11px]">Movie URL Template</Label>
                        <Input 
                          id="movieUrl"
                          placeholder="https://example.com/movie/{id}"
                          value={newServerMovie}
                          onChange={(e) => setNewServerMovie(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <p className="text-[9px] text-muted-foreground">Use {'{id}'} for TMDB ID</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tvUrl" className="text-[11px]">TV URL Template</Label>
                        <Input 
                          id="tvUrl"
                          placeholder="https://example.com/tv/{id}/{season}/{episode}"
                          value={newServerTv}
                          onChange={(e) => setNewServerTv(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <p className="text-[9px] text-muted-foreground">Use {'{id}'}, {'{season}'}, {'{episode}'}</p>
                      </div>
                      <Button onClick={handleAddServer} size="sm" className="w-full h-8 text-xs">
                        Add Server
                      </Button>
                    </div>
                  )}
                  
                  {/* Custom Servers List */}
                  {getCustomServers().length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[11px] font-medium text-muted-foreground">Custom Servers</h4>
                      {getCustomServers().map((server) => (
                        <div 
                          key={server.id}
                          className="flex items-center justify-between p-1.5 border rounded-lg"
                        >
                          <span className="text-xs truncate">{server.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleRemoveServer(server.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Server Stats - Enhanced */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Servers - Sorted by Reliability
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {getEnhancedServerList().map((server, index) => {
                        const hasStats = server.total > 0;
                        const isGood = server.successRate !== null && server.successRate > 0.7;
                        const isMedium = server.successRate !== null && server.successRate > 0.4 && server.successRate <= 0.7;
                        const isPoor = server.successRate !== null && server.successRate <= 0.4;
                        
                        return (
                          <div 
                            key={server.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Rank Badge */}
                              <div className={`relative flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-muted'
                              }`}>
                                {index === 0 && <Crown className="w-3.5 h-3.5 text-yellow-900" />}
                                {index === 1 && <Medal className="w-3.5 h-3.5 text-gray-700" />}
                                {index === 2 && <Award className="w-3.5 h-3.5 text-orange-900" />}
                                {index > 2 && <span className="text-[10px] font-bold text-muted-foreground">{index + 1}</span>}
                              </div>
                              
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {server.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-0.5">
                                    <Wifi className="w-2.5 h-2.5" />
                                    {server.url}
                                  </span>
                                  {hasStats && (
                                    <>
                                      <span className="text-border">|</span>
                                      <span className="flex items-center gap-0.5 text-green-500">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        {server.successCount}
                                      </span>
                                      <span className="flex items-center gap-0.5 text-red-500">
                                        <XCircle className="w-2.5 h-2.5" />
                                        {server.failCount}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                              {hasStats ? (
                                <>
                                  <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 ${
                                    isGood ? 'bg-green-500/20 text-green-500' :
                                    isMedium ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-red-500/20 text-red-500'
                                  }`}>
                                    {isGood && <TrendingUp className="w-2.5 h-2.5" />}
                                    {isMedium && <BarChart3 className="w-2.5 h-2.5" />}
                                    {isPoor && <TrendingDown className="w-2.5 h-2.5" />}
                                    {Math.round((server.successRate ?? 0) * 100)}%
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {server.avgLoadTime && (
                                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 bg-muted/50 px-1 py-0.5 rounded">
                                        <Clock className="w-2 h-2" />
                                        {(server.avgLoadTime / 1000).toFixed(1)}s
                                      </span>
                                    )}
                                    {server.lastUsed && (
                                      <span className="text-[9px] text-muted-foreground bg-muted/50 px-1 py-0.5 rounded">
                                        {Date.now() - server.lastUsed < 3600000 ? (
                                          <span className="text-green-500">Active</span>
                                        ) : (
                                          <span>{Math.floor((Date.now() - server.lastUsed) / 3600000)}h ago</span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-1 bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded-full">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span className="text-[10px] font-medium">Untested</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex items-center justify-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="w-2.5 h-2.5" /> {'>'}70% Good
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <BarChart3 className="w-2.5 h-2.5" /> 40-70% Medium
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <TrendingDown className="w-2.5 h-2.5" /> {'<'}40% Poor
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      {DEFAULT_SERVERS.length} servers | Auto-sorted by reliability
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Netflix-style Bottom Controls Bar - Only show when loading or user hovers */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-[35] transition-all duration-500 ${
          isMinimized ? 'hidden' : (controlsVisible && (isLoading || isAutoFetching || type === 'tv')) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-3 sm:pt-8 sm:pb-4 px-3 sm:px-6">
          {/* Server Status Bar */}
          {(isLoading || isAutoFetching) && (
            <div className="flex items-center gap-2 mb-3 px-1">
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

          {/* Controls Row - Compact for mobile */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Episode Navigation */}
            <div className="flex items-center gap-1 sm:gap-2">
              {type === 'tv' && (
                <>
                  <button
                    onClick={handlePrevEpisode}
                    disabled={!hasPrevEpisode}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    disabled={!hasNextEpisode}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Center: Season/Episode Selectors */}
            {type === 'tv' && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Season Selector */}
                {totalSeasons > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="px-2 sm:px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1">
                        <span className="text-white text-xs sm:text-sm font-medium">S{currentSeason}</span>
                        <ChevronDown className="w-3 h-3 text-white/70" />
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
                    <button className="px-2 sm:px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1">
                      <span className="text-white text-xs sm:text-sm font-medium">E{currentEpisode}</span>
                      <ChevronDown className="w-3 h-3 text-white/70" />
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

            {/* Right: Next Episode Button only */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Next Episode Button */}
              {type === 'tv' && hasNextEpisode && (
                <button
                  onClick={handleNextEpisode}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md bg-white text-black text-xs sm:text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Netflix-style Loading Overlay */}
      {isLoading && !isMinimized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-[25]">
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
        {/* Interaction overlay - shows controls on tap/move, blocks first tap ads */}
        <div 
          className={`absolute inset-0 z-[10] ${
            controlsVisible ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
          onMouseMove={showControls}
          onTouchStart={(e) => {
            e.preventDefault();
            showControls();
          }}
          onClick={(e) => {
            if (!controlsVisible) {
              e.preventDefault();
              e.stopPropagation();
            }
            showControls();
          }}
        />
        
        {/* Video iframe */}
        {isMounted && embedUrl && (
          <iframe
            key={embedUrl}
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; clipboard-write"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => {
              handleIframeLoad();
            }}
            onError={() => {
              if (isAutoFetching) {
                tryNextServer();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
