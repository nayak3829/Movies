'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Plus, Trash2, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb';

interface SavedItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
}

export default function MyListPage() {
  const [myList, setMyList] = useState<SavedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('myList') || '[]');
    setMyList(list);
    setIsLoaded(true);
  }, []);

  const removeFromList = (id: number) => {
    const newList = myList.filter(item => item.id !== id);
    localStorage.setItem('myList', JSON.stringify(newList));
    setMyList(newList);
  };

  const clearAll = () => {
    localStorage.setItem('myList', JSON.stringify([]));
    setMyList([]);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-8 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
              >
                My List
              </h1>
              <p className="text-muted-foreground">
                {myList.length > 0 
                  ? `${myList.length} title${myList.length > 1 ? 's' : ''} saved`
                  : 'Your saved movies and TV shows'
                }
              </p>
            </div>
            {myList.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAll}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>

          {!isLoaded ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : myList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Plus className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your list is empty</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Start adding movies and TV shows to your list by clicking the + button on any title.
              </p>
              <Link href="/">
                <Button size="lg" className="gap-2">
                  Browse Content
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {myList.map((item) => {
                const title = item.title || item.name || 'Unknown';
                const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
                
                return (
                  <div key={item.id} className="group relative">
                    <Link href={`/${item.media_type}/${item.id}`}>
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
                        <Image
                          src={getImageUrl(item.poster_path, 'w500')}
                          alt={title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Hover Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-2 mb-2">
                            <Button size="sm" className="h-8 w-8 p-0 rounded-full">
                              <Play className="w-4 h-4 fill-current" />
                            </Button>
                            <span className="text-xs capitalize bg-primary/80 px-2 py-0.5 rounded">
                              {item.media_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromList(item.id)}
                      className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    {/* Info */}
                    <div className="mt-2">
                      <h3 className="font-medium text-sm truncate">{title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {item.vote_average.toFixed(1)}
                        </span>
                        {year && <span>{year}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
