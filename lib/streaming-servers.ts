export interface StreamingServer {
  id: string;
  name: string;
  url: string; // Base URL
  movieTemplate: string;
  tvTemplate: string;
  isCustom?: boolean;
  priority?: number;
}

// Default streaming servers - sorted by multi-audio support and reliability
// Servers with multi-audio/subtitle support are prioritized first
// Updated March 2026 with working servers
export const DEFAULT_SERVERS: StreamingServer[] = [
  {
    id: 'vidsrc-icu',
    name: 'VidSrc ICU (Multi-Audio)',
    url: 'vidsrc.icu',
    movieTemplate: 'https://vidsrc.icu/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.icu/embed/tv/{id}/{season}/{episode}',
    priority: 0
  },
  {
    id: 'vidsrc-cc',
    name: 'VidSrc CC (Multi-Audio)',
    url: 'vidsrc.cc',
    movieTemplate: 'https://vidsrc.cc/v2/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.cc/v2/embed/tv/{id}/{season}/{episode}',
    priority: 1
  },
  {
    id: 'embed-su',
    name: 'Embed.su (Multi-Audio)',
    url: 'embed.su',
    movieTemplate: 'https://embed.su/embed/movie/{id}',
    tvTemplate: 'https://embed.su/embed/tv/{id}/{season}/{episode}',
    priority: 2
  },
  {
    id: 'vidsrc-dev',
    name: 'VidSrc Dev',
    url: 'vidsrc.dev',
    movieTemplate: 'https://vidsrc.dev/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.dev/embed/tv/{id}/{season}/{episode}',
    priority: 3
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed (Multi-Audio)',
    url: 'multiembed.mov',
    movieTemplate: 'https://multiembed.mov/directstream.php?video_id={id}&tmdb=1',
    tvTemplate: 'https://multiembed.mov/directstream.php?video_id={id}&tmdb=1&s={season}&e={episode}',
    priority: 4
  },
  {
    id: 'autoembed-cc',
    name: 'AutoEmbed (Multi-Audio)',
    url: 'player.autoembed.cc',
    movieTemplate: 'https://player.autoembed.cc/embed/movie/{id}',
    tvTemplate: 'https://player.autoembed.cc/embed/tv/{id}/{season}/{episode}',
    priority: 5
  },
  {
    id: 'vidsrc-me',
    name: 'VidSrc ME',
    url: 'vidsrc.me',
    movieTemplate: 'https://vidsrc.me/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.me/embed/tv/{id}/{season}/{episode}',
    priority: 6
  },
  {
    id: 'vidsrc-xyz',
    name: 'VidSrc XYZ',
    url: 'vidsrc.xyz',
    movieTemplate: 'https://vidsrc.xyz/embed/movie/{id}',
    tvTemplate: 'https://vidsrc.xyz/embed/tv/{id}/{season}/{episode}',
    priority: 7
  },
  {
    id: '2embed',
    name: '2Embed',
    url: '2embed.cc',
    movieTemplate: 'https://www.2embed.cc/embed/{id}',
    tvTemplate: 'https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}',
    priority: 8
  },
  {
    id: 'smashystream',
    name: 'SmashyStream',
    url: 'embed.smashystream.com',
    movieTemplate: 'https://embed.smashystream.com/playere.php?tmdb={id}',
    tvTemplate: 'https://embed.smashystream.com/playere.php?tmdb={id}&season={season}&episode={episode}',
    priority: 9
  },
  {
    id: 'moviesapi',
    name: 'MoviesAPI',
    url: 'moviesapi.club',
    movieTemplate: 'https://moviesapi.club/movie/{id}',
    tvTemplate: 'https://moviesapi.club/tv/{id}-{season}-{episode}',
    priority: 10
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    url: 'vidlink.pro',
    movieTemplate: 'https://vidlink.pro/movie/{id}',
    tvTemplate: 'https://vidlink.pro/tv/{id}/{season}/{episode}',
    priority: 11
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

// Calculate server score based on stats and recency
function calculateServerScore(stats: ServerStats | undefined, priority: number): number {
  if (!stats) return 100 - priority; // Default score based on priority
  
  const total = stats.successCount + stats.failCount;
  if (total === 0) return 100 - priority;
  
  const successRate = stats.successCount / total;
  const recencyBonus = stats.lastSuccess 
    ? Math.max(0, 20 - (Date.now() - stats.lastSuccess) / (1000 * 60 * 60 * 24)) // Bonus for recent success (within 20 days)
    : 0;
  const loadTimeBonus = stats.avgLoadTime 
    ? Math.max(0, 15 - stats.avgLoadTime / 1000) // Bonus for fast load times
    : 0;
  
  // Score formula: success rate (60%) + recency (20%) + load time (10%) + priority (10%)
  return (successRate * 60) + recencyBonus + loadTimeBonus + ((14 - Math.min(priority, 14)) * 0.7);
}

// Get all servers (custom + default), sorted by smart scoring
export function getAllServers(): StreamingServer[] {
  const customServers = getCustomServers();
  const stats = getServerStats();
  
  const allServers = [...customServers, ...DEFAULT_SERVERS];
  
  // Sort by calculated score (higher = better)
  return allServers.sort((a, b) => {
    const statsA = stats[a.id];
    const statsB = stats[b.id];
    
    const scoreA = calculateServerScore(statsA, a.priority ?? 99);
    const scoreB = calculateServerScore(statsB, b.priority ?? 99);
    
    // Higher score comes first
    return scoreB - scoreA;
  });
}

// Get servers sorted for auto-fetch (prioritize working servers)
export function getServersForAutoFetch(): StreamingServer[] {
  const stats = getServerStats();
  const allServers = getAllServers();
  
  // Separate servers into categories
  const recentlyWorking: StreamingServer[] = [];
  const highSuccessRate: StreamingServer[] = [];
  const untested: StreamingServer[] = [];
  const lowSuccessRate: StreamingServer[] = [];
  
  const oneHourAgo = Date.now() - (1000 * 60 * 60);
  const oneDayAgo = Date.now() - (1000 * 60 * 60 * 24);
  
  for (const server of allServers) {
    const serverStats = stats[server.id];
    
    if (!serverStats || (serverStats.successCount === 0 && serverStats.failCount === 0)) {
      untested.push(server);
      continue;
    }
    
    const total = serverStats.successCount + serverStats.failCount;
    const successRate = serverStats.successCount / total;
    
    // Recently worked (within last hour) - highest priority
    if (serverStats.lastSuccess && serverStats.lastSuccess > oneHourAgo) {
      recentlyWorking.push(server);
    }
    // Good success rate (>60%) and worked within a day
    else if (successRate > 0.6 && serverStats.lastSuccess && serverStats.lastSuccess > oneDayAgo) {
      highSuccessRate.push(server);
    }
    // Low success rate or old
    else if (successRate < 0.4) {
      lowSuccessRate.push(server);
    }
    // Everything else goes to high success
    else {
      highSuccessRate.push(server);
    }
  }
  
  // Return in order: recently working -> high success -> untested -> low success
  return [...recentlyWorking, ...highSuccessRate, ...untested, ...lowSuccessRate];
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
