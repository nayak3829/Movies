'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyListPage() {
  // In a real app, this would fetch from a database or local storage
  const myList: any[] = [];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-8 min-h-[80vh]">
        <div className="container mx-auto px-4">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}
          >
            My List
          </h1>
          <p className="text-muted-foreground mb-8">Your saved movies and TV shows</p>

          {myList.length === 0 ? (
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
              {/* Movie cards would go here */}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
