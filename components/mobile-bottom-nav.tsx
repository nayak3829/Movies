'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Bookmark, Search, Menu, X, TrendingUp, Grid3X3, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchModal } from './search-modal';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tv-shows', label: 'TV', icon: Tv },
  { href: '/my-list', label: 'My List', icon: Bookmark },
];

const moreMenuItems = [
  { href: '/new-popular', label: 'New & Popular', icon: TrendingUp },
  { href: '/genres', label: 'Genres', icon: Grid3X3 },
  { href: '/history', label: 'History', icon: HistoryIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      {/* More Menu Overlay */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu Panel */}
      <div className={cn(
        "fixed bottom-16 left-0 right-0 z-40 md:hidden transition-all duration-300",
        isMoreOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <div className="mx-4 mb-2 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-2 grid grid-cols-3 gap-1">
            {moreMenuItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all",
                    isActive 
                      ? "bg-primary/20 text-primary" 
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-6 h-6", isActive && "text-primary")} />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group"
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-white/50 group-hover:text-white/80'
                    )}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-white/50 group-hover:text-white/70'
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
          
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group"
          >
            <div className="p-1.5 rounded-xl transition-all duration-200">
              <Search className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
            </div>
            <span className="text-[10px] font-medium text-white/50 group-hover:text-white/70 transition-colors">
              Search
            </span>
          </button>

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group"
          >
            {isMoreOpen && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-200",
              isMoreOpen && "bg-primary/10"
            )}>
              {isMoreOpen ? (
                <X className="w-5 h-5 text-primary transition-all" />
              ) : (
                <Menu className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors duration-200",
              isMoreOpen ? "text-primary" : "text-white/50 group-hover:text-white/70"
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
