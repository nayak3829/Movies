'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Server,
  Zap,
  BarChart3,
  RefreshCw,
  Clock,
  Trash2,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Crown,
  Medal,
  Award,
  Wifi,
  WifiOff,
  AlertTriangle,
  Sun,
  Moon,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchModal } from './search-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAllServers, getServerStats, resetServerStats, type ServerStats } from '@/lib/streaming-servers';

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isServersDialogOpen, setIsServersDialogOpen] = useState(false);
  const [serversList, setServersList] = useState<ReturnType<typeof getServersListData>>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dynamicNotifs, setDynamicNotifs] = useState<{id:number;title:string;message:string;time:string}[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      const notifs = history.slice(0, 3).map((item: {id:number;title:string;media_type:string;timestamp:number}, i: number) => {
        const mins = Math.round((Date.now() - item.timestamp) / 60000);
        const timeStr = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins/60)}h ago` : `${Math.round(mins/1440)}d ago`;
        return {
          id: item.id + i,
          title: item.media_type === 'tv' ? 'Continue Watching' : 'Recently Watched',
          message: item.title,
          time: timeStr,
        };
      });
      if (notifs.length === 0) {
        notifs.push({ id: 1, title: 'Welcome to TechVyro', message: 'Start watching movies and TV shows', time: 'now' });
      }
      setDynamicNotifs(notifs);
    } catch {
      setDynamicNotifs([{ id: 1, title: 'Welcome', message: 'Discover movies and TV shows', time: 'now' }]);
    }
  }, []);

  // Get servers sorted by reliability for the dialog
  const getServersListData = () => {
    const servers = getAllServers();
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
    const servers = serversList;
    const totalServers = servers.length;
    const testedServers = servers.filter(s => s.total > 0).length;
    const goodServers = servers.filter(s => s.successRate !== null && s.successRate > 0.7).length;
    const totalRequests = servers.reduce((acc, s) => acc + s.total, 0);
    const avgSuccessRate = servers.filter(s => s.successRate !== null).length > 0
      ? servers.filter(s => s.successRate !== null).reduce((acc, s) => acc + (s.successRate ?? 0), 0) / servers.filter(s => s.successRate !== null).length
      : 0;
    
    return { totalServers, testedServers, goodServers, totalRequests, avgSuccessRate };
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setServersList(getServersListData());
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Reset all stats
  const handleResetStats = () => {
    resetServerStats();
    setServersList(getServersListData());
    setLastUpdated(new Date());
  };

  // Auto-fetch servers data when dialog is open
  useEffect(() => {
    if (!isServersDialogOpen) return;

    // Initial fetch
    setServersList(getServersListData());
    setLastUpdated(new Date());

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      setServersList(getServersListData());
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isServersDialogOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/tv-shows', label: 'TV Shows' },
    { href: '/genres', label: 'Genres' },
    { href: '/collections', label: 'Collections' },
    { href: '/new-popular', label: 'New & Popular' },
    { href: '/my-list', label: 'My List' },
    { href: '/history', label: 'History' },
  ];

  const notifications = dynamicNotifs;

  // Prevent hydration mismatch by rendering placeholder on server
  if (!isMounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 md:h-[68px] bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[68px]">
            <div className="flex items-center gap-8 lg:gap-12">
              <span 
                className="text-2xl md:text-3xl font-bold tracking-wider" 
                style={{ fontFamily: 'var(--font-bebas)' }}
              >
                <span className="text-foreground">TECH</span>
                <span className="text-primary drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]">VYRO</span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled 
            ? 'bg-background/98 backdrop-blur-xl shadow-lg shadow-black/20' 
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[68px]">
            {/* Logo */}
            <div className="flex items-center gap-8 lg:gap-12">
              <Link href="/" className="flex items-center gap-2 group">
                <span 
                  className="text-2xl md:text-3xl font-bold tracking-wider transition-transform duration-300 group-hover:scale-105" 
                  style={{ fontFamily: 'var(--font-bebas)' }}
                >
                  <span className="text-foreground">TECH</span>
                  <span className="text-primary drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]">VYRO</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md',
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Dark/Light Toggle */}
              {isMounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'p-2.5 rounded-full transition-all duration-300',
                    'hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 hover:scale-110 active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50'
                  )}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Search Button */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  'p-2.5 rounded-full transition-all duration-300',
                  'hover:bg-white/10 hover:scale-110 active:scale-95',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <div className="hidden md:block relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={cn(
                    'relative p-2.5 rounded-full transition-all duration-300',
                    'hover:bg-white/10 hover:scale-110 active:scale-95',
                    isNotificationOpen && 'bg-white/10'
                  )}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-background/98 backdrop-blur-xl border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className="p-4 border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-muted/30">
                      <button className="w-full text-center text-sm text-primary hover:underline">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={cn(
                    'flex items-center gap-2 p-1 pr-2 rounded-md transition-all duration-300',
                    'hover:bg-white/10',
                    isProfileOpen && 'bg-white/10'
                  )}
                >
                  <div className="w-8 h-8 rounded overflow-hidden bg-gradient-to-br from-primary to-red-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform duration-300',
                    isProfileOpen && 'rotate-180'
                  )} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-background/98 backdrop-blur-xl border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-red-700 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Guest User</p>
                          <p className="text-xs text-gray-400">Free Plan</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <User className="w-4 h-4" />
                        Manage Profile
                      </Link>
                      <Link href="/history" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <History className="w-4 h-4" />
                        Watch History
                      </Link>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </button>
                      <button 
                        onClick={() => {
                          setIsServersDialogOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Server className="w-4 h-4" />
                        Servers (Reliability)
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <HelpCircle className="w-4 h-4" />
                        Help Center
                      </button>
                    </div>
                    <div className="border-t border-border py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-primary hover:bg-white/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  'md:hidden p-2.5 rounded-full transition-all duration-300',
                  'hover:bg-white/10 active:scale-95',
                  isMobileMenuOpen && 'bg-white/10'
                )}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-out',
          isMobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="bg-background/98 backdrop-blur-xl border-t border-border">
            <div className="container mx-auto px-4 py-3 space-y-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'block py-3 px-4 rounded-lg text-base font-medium transition-all duration-200',
                      isActive 
                        ? 'text-white bg-primary/20 border-l-4 border-primary' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              {/* Mobile Profile Section */}
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-red-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Guest User</p>
                    <p className="text-xs text-gray-400">Free Plan</p>
                  </div>
                </div>
                {/* Mobile Servers Button */}
                <button 
                  onClick={() => {
                    setIsServersDialogOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                >
                  <Server className="w-4 h-4" />
                  Servers (Reliability)
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Servers Sorted by Reliability Dialog */}
      <Dialog open={isServersDialogOpen} onOpenChange={setIsServersDialogOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-md max-h-[85vh] overflow-hidden p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm">
                <Server className="w-4 h-4 text-primary" />
                Server Reliability
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleManualRefresh}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isRefreshing && "animate-spin")} />
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
            {lastUpdated && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span suppressHydrationWarning>Auto-updating | {lastUpdated.toLocaleTimeString()}</span>
              </p>
            )}
          </DialogHeader>

          {/* Summary Stats Cards */}
          {serversList.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 py-2">
              <div className="flex flex-col items-center p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Server className="w-3 h-3 text-primary mb-0.5" />
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
                <span className="text-[9px] text-muted-foreground">Avg</span>
              </div>
            </div>
          )}
          
          <div className="space-y-1.5 overflow-y-auto max-h-[45vh] pr-1">
            {serversList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <Server className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No servers available</p>
              </div>
            ) : (
              serversList.map((server, index) => {
                const hasStats = server.total > 0;
                const isGood = server.successRate !== null && server.successRate > 0.7;
                const isMedium = server.successRate !== null && server.successRate > 0.4 && server.successRate <= 0.7;
                const isPoor = server.successRate !== null && server.successRate <= 0.4;
                
                return (
                  <div 
                    key={server.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn(
                        "relative flex items-center justify-center w-6 h-6 rounded-full shrink-0",
                        index === 0 && "bg-gradient-to-br from-yellow-400 to-yellow-600",
                        index === 1 && "bg-gradient-to-br from-gray-300 to-gray-500",
                        index === 2 && "bg-gradient-to-br from-orange-400 to-orange-600",
                        index > 2 && "bg-muted"
                      )}>
                        {index === 0 && <Crown className="w-3 h-3 text-yellow-900" />}
                        {index === 1 && <Medal className="w-3 h-3 text-gray-700" />}
                        {index === 2 && <Award className="w-3 h-3 text-orange-900" />}
                        {index > 2 && <span className="text-[10px] font-bold text-muted-foreground">{index + 1}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {server.name.replace(' (Multi-Audio)', '')}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          {hasStats && (
                            <>
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
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {hasStats ? (
                        <div className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5",
                          isGood && "bg-green-500/20 text-green-500",
                          isMedium && "bg-yellow-500/20 text-yellow-500",
                          isPoor && "bg-red-500/20 text-red-500"
                        )}>
                          {isGood && <TrendingUp className="w-2.5 h-2.5" />}
                          {isMedium && <BarChart3 className="w-2.5 h-2.5" />}
                          {isPoor && <TrendingDown className="w-2.5 h-2.5" />}
                          {Math.round((server.successRate ?? 0) * 100)}%
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span className="text-[10px] font-medium">New</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-center gap-3 text-[10px]">
              <span className="flex items-center gap-0.5 text-green-500">
                <TrendingUp className="w-2.5 h-2.5" /> {'>'}70%
              </span>
              <span className="flex items-center gap-0.5 text-yellow-500">
                <BarChart3 className="w-2.5 h-2.5" /> 40-70%
              </span>
              <span className="flex items-center gap-0.5 text-red-500">
                <TrendingDown className="w-2.5 h-2.5" /> {'<'}40%
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
