import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { WatchHistoryClient } from '@/components/watch-history-client';

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4">
        <WatchHistoryClient />
      </div>
      <Footer />
    </main>
  );
}
