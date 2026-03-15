export interface StreamingServer {
  id: string;
  name: string;
  url: string; // Base URL
  movieTemplate: string;
  tvTemplate: string;
  isCustom?: boolean;
  priority?: number;
}

// Default streaming servers from your HTML file - sorted by reliability
export const DEFAULT_SERVERS: StreamingServer[] = [
  {
    id: 'all-servers',
    name: 'All Servers (IMDB)',
    url: 'https://smrta384und.com/play/',
    movieTemplate: 'https://smrta384und.com/play/{imdb}',
    tvTemplate: 'https://smrta384und.com/play/{imdb}',
    priority: 0
  },
  {
    id: 'vidsrc-to',
    name: 'vidsrc.to',
    url: 'vidsrc.to',
    movieTemplate: 'https://vidsrc.to/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.to/embed/tv/{id}/{season}/{episode}',
    priority: 1
  },
  {
    id: 'vidsrc-vip',
    name: 'vidsrc.vip',
    url: 'vidsrc.vip',
    movieTemplate: 'https://vidsrc.vip/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.vip/embed/tv/{id}/{season}/{episode}',
    priority: 2
  },
  {
    id: 'vidsrc-icu',
    name: 'vidsrc.icu',
    url: 'vidsrc.icu',
    movieTemplate: 'https://vidsrc.icu/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.icu/embed/tv/{id}/{season}/{episode}',
    priority: 3
  },
  {
    id: 'vidsrc-cc',
    name: 'vidsrc.cc/v2',
    url: 'vidsrc.cc/v2',
    movieTemplate: 'https://vidsrc.cc/v2/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.cc/v2/embed/tv/{id}/{season}/{episode}',
    priority: 4
  },
  {
    id: 'embed-su',
    name: 'embed.su',
    url: 'embed.su',
    movieTemplate: 'https://embed.su/embed/movie/{id}',
    tvTemplate: 'https://embed.su/embed/tv/{id}/{season}/{episode}',
    priority: 5
  },
  {
    id: 'vidsrc-me',
    name: 'vidsrc.me',
    url: 'vidsrc.me',
    movieTemplate: 'https://vidsrc.me/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.me/embed/tv/{id}/{season}/{episode}',
    priority: 6
  },
  {
    id: 'autoembed-pro',
    name: 'autoembed.pro',
    url: 'autoembed.pro',
    movieTemplate: 'https://autoembed.pro/embed/movie/{id}',
    tvTemplate: 'https://autoembed.pro/embed/tv/{id}/{season}/{episode}',
    priority: 7
  },
  {
    id: 'vidfast-pro',
    name: 'vidfast.pro',
    url: 'vidfast.pro',
    movieTemplate: 'https://vidfast.pro/movie/{id}',
    tvTemplate: 'https://vidfast.pro/embed/tv/{id}/{season}/{episode}',
    priority: 8
  },
  {
    id: 'videasy',
    name: 'player.videasy.net',
    url: 'player.videasy.net',
    movieTemplate: 'https://player.videasy.net/movie/{id}',
    tvTemplate: 'https://player.videasy.net/tv/{id}/{season}/{episode}',
    priority: 9
  },
  {
    id: 'autoembed-cc',
    name: 'player.autoembed.cc',
    url: 'player.autoembed.cc',
    movieTemplate: 'https://player.autoembed.cc/embed/movie/{id}',
    tvTemplate: 'https://player.autoembed.cc/embed/tv/{id}/{season}/{episode}',
    priority: 10
  },
  {
    id: 'uembed',
    name: 'uembed.site',
    url: 'uembed.site',
    movieTemplate: 'https://uembed.site/?id={id}',
    tvTemplate: 'https://uembed.site/?id={id}&s={season}&e={episode}',
    priority: 11
  },
  {
    id: '111movies',
    name: '111movies.com',
    url: '111movies.com',
    movieTemplate: 'https://111movies.com/movie/{id}',
    tvTemplate: 'https://111movies.com/tv/{id}/season/{season}/episode/{episode}',
    priority: 12
  },
  {
    id: 'hyhd',
    name: 'hyhd.org',
    url: 'hyhd.org',
    movieTemplate: 'https://hyhd.org/embed/{id}',
    tvTemplate: 'https://hyhd.org/embed/tv/{id}/{season}/{episode}',
    priority: 13
  }
];

// Generate embed URL for a server
export function getEmbedUrl(
  server: StreamingServer,
  tmdbId: number,
  type: 'movie' | 'tv',
  season?: number,
  episode?: number,
  imdbId?: string | null
): string {
  // Special handling for IMDB-based server
  if (server.id === 'all-servers') {
    if (!imdbId) {
      // Return null indicator - will need to skip this server
      return '';
    }
    return server.movieTemplate.replace('{imdb}', imdbId);
  }

  const template = type === 'movie' ? server.movieTemplate : server.tvTemplate;
  return template
    .replace('{id}', String(tmdbId))
    .replace('{season}', String(season || 1))
    .replace('{episode}', String(episode || 1));
}

// Local storage keys
const CUSTOM_SERVERS_KEY = 'custom_streaming_servers';
const SERVER_STATS_KEY = 'streaming_server_stats';

// Server statistics for smart sorting
export interface ServerStats {
  serverId: string;
  successCount: number;
  failCount: number;
  lastSuccess?: number;
  avgLoadTime?: number;
}

// Get custom servers added by user
export function getCustomServers(): StreamingServer[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CUSTOM_SERVERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parsing errors
  }
  return [];
}

// Add a custom server
export function addCustomServer(server: Omit<StreamingServer, 'id' | 'isCustom'>): StreamingServer {
  const customServers = getCustomServers();
  const newServer: StreamingServer = {
    ...server,
    id: `custom-${Date.now()}`,
    isCustom: true,
    priority: -1 // Custom servers get highest priority
  };
  customServers.push(newServer);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_SERVERS_KEY, JSON.stringify(customServers));
  }
  
  return newServer;
}

// Remove a custom server
export function removeCustomServer(serverId: string): void {
  if (typeof window === 'undefined') return;
  
  const customServers = getCustomServers().filter(s => s.id !== serverId);
  localStorage.setItem(CUSTOM_SERVERS_KEY, JSON.stringify(customServers));
}

// Get all servers (custom + default), sorted by priority and stats
export function getAllServers(): StreamingServer[] {
  const customServers = getCustomServers();
  const stats = getServerStats();
  
  const allServers = [...customServers, ...DEFAULT_SERVERS];
  
  // Sort by success rate and priority
  return allServers.sort((a, b) => {
    const statsA = stats[a.id] || { successCount: 0, failCount: 0 };
    const statsB = stats[b.id] || { successCount: 0, failCount: 0 };
    
    const totalA = statsA.successCount + statsA.failCount;
    const totalB = statsB.successCount + statsB.failCount;
    
    // If both have stats, prefer higher success rate
    if (totalA > 2 && totalB > 2) {
      const rateA = statsA.successCount / totalA;
      const rateB = statsB.successCount / totalB;
      if (Math.abs(rateA - rateB) > 0.15) {
        return rateB - rateA;
      }
    }
    
    // Then by priority (lower = better)
    return (a.priority ?? 99) - (b.priority ?? 99);
  });
}

// Get server statistics
export function getServerStats(): Record<string, ServerStats> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(SERVER_STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parsing errors
  }
  return {};
}

// Update server statistics
export function updateServerStats(serverId: string, success: boolean, loadTime?: number): void {
  if (typeof window === 'undefined') return;
  
  const stats = getServerStats();
  const serverStats = stats[serverId] || { serverId, successCount: 0, failCount: 0 };
  
  if (success) {
    serverStats.successCount++;
    serverStats.lastSuccess = Date.now();
    if (loadTime) {
      serverStats.avgLoadTime = serverStats.avgLoadTime
        ? (serverStats.avgLoadTime + loadTime) / 2
        : loadTime;
    }
  } else {
    serverStats.failCount++;
  }
  
  stats[serverId] = serverStats;
  localStorage.setItem(SERVER_STATS_KEY, JSON.stringify(stats));
}

// Reset all server statistics
export function resetServerStats(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SERVER_STATS_KEY);
}
