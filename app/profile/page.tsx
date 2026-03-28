'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { User, Clock, Bookmark, Star, Film, Tv, Trash2, Settings, Shield, Download, Share2, Eye, TrendingUp, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ParentalControls } from '@/components/parental-controls';
import type { WatchHistoryItem } from '@/components/continue-watching';

interface SavedItem { id: number; media_type: 'movie' | 'tv'; }
interface Rating { id: number; rating: number; }

export default function ProfilePage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [myList, setMyList] = useState<SavedItem[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [totalWatchTime, setTotalWatchTime] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    try {
      const historyData = JSON.parse(localStorage.getItem('watchHistory') || '[]');
      setHistory(historyData);
      setMyList(JSON.parse(localStorage.getItem('myList') || '[]'));
      const stored = JSON.parse(localStorage.getItem('userRatings') || '{}');
      setRatings(Object.entries(stored).map(([k, v]) => ({ id: Number(k), rating: v as number })));
      
      // Calculate estimated watch time (2 hours per movie, 45 min per episode)
      const movieTime = historyData.filter((h: WatchHistoryItem) => h.media_type === 'movie').length * 120;
      const tvTime = historyData.filter((h: WatchHistoryItem) => h.media_type === 'tv').length * 45;
      setTotalWatchTime(movieTime + tvTime);
    } catch {}
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('watchHistory');
    setHistory([]);
  };

  const clearRatings = () => {
    localStorage.removeItem('userRatings');
    setRatings([]);
  };

  const clearAll = () => {
    localStorage.removeItem('watchHistory');
    localStorage.removeItem('myList');
    localStorage.removeItem('userRatings');
    setHistory([]);
    setMyList([]);
    setRatings([]);
  };

  const moviesWatched = history.filter(h => h.media_type === 'movie').length;
  const showsWatched = history.filter(h => h.media_type === 'tv').length;
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1) : '0';
  const formatWatchTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h`;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-24 md:pb-12 container mx-auto px-4 max-w-3xl">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-xl shadow-primary/30 ring-4 ring-primary/20">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Guest User</h1>
              <p className="text-muted-foreground text-sm">Free Plan</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">TechVyro Member</span>
              </div>
            </div>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <ParentalControls />
          </div>
        </div>

        {/* Stats Grid */}
        {isMounted && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {[
              { icon: Film, label: 'Movies', value: moviesWatched, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Tv, label: 'TV Shows', value: showsWatched, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: Bookmark, label: 'My List', value: myList.length, color: 'text-green-400', bg: 'bg-green-500/10' },
              { icon: Star, label: 'Avg Rating', value: avgRating, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { icon: Clock, label: 'Watch Time', value: formatWatchTime(totalWatchTime), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`${bg} border border-white/5 rounded-xl p-4 flex flex-col items-center text-center hover:border-white/10 transition-colors`}>
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <span className={`text-xl font-bold ${color}`}>{value}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {isMounted && (moviesWatched > 0 || showsWatched > 0) && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Achievements
            </h2>
            <div className="flex flex-wrap gap-2">
              {moviesWatched >= 1 && (
                <span className="px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  First Movie
                </span>
              )}
              {moviesWatched >= 10 && (
                <span className="px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  Movie Enthusiast (10+)
                </span>
              )}
              {showsWatched >= 5 && (
                <span className="px-3 py-1.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                  Binge Watcher
                </span>
              )}
              {ratings.length >= 5 && (
                <span className="px-3 py-1.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                  Critic ({ratings.length} ratings)
                </span>
              )}
              {myList.length >= 10 && (
                <span className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                  Collector
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-3 mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Quick Access
          </h2>
          {[
            { href: '/history', icon: Clock, label: 'Watch History', desc: `${history.length} titles watched` },
            { href: '/my-list', icon: Bookmark, label: 'My List', desc: `${myList.length} titles saved` },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{isMounted ? desc : '...'}</p>
              </div>
              <span className="text-white/30 text-xs">›</span>
            </Link>
          ))}
        </div>

        {/* Danger Zone */}
        {isMounted && (history.length > 0 || ratings.length > 0 || myList.length > 0) && (
          <div className="border border-destructive/30 rounded-xl p-5 bg-destructive/5">
            <h3 className="font-semibold text-destructive mb-1 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground mb-4">These actions cannot be undone.</p>
            <div className="flex flex-wrap gap-2">
              {history.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearHistory} className="gap-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Clock className="w-3.5 h-3.5" />
                  Clear History
                </Button>
              )}
              {ratings.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearRatings} className="gap-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Star className="w-3.5 h-3.5" />
                  Clear Ratings
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={clearAll} className="gap-2 text-xs">
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
