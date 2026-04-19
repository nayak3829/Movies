'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MontagInterstitialProps {
  onClose: () => void;
  countdown?: number;
  className?: string;
}

export function MontagInterstitial({ onClose, countdown = 5, className }: MontagInterstitialProps) {
  const [timeLeft, setTimeLeft] = useState(countdown);
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Monetag In-Page Push ad
    const script = document.createElement('script');
    script.src = 'https://dessertstormstay.com/400/8812752';
    script.async = true;
    
    if (adContainerRef.current) {
      adContainerRef.current.appendChild(script);
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className={cn(
      'fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center',
      className
    )}>
      <div className="max-w-2xl w-full p-8 text-center">
        <p className="text-white/70 text-sm mb-4">Advertisement</p>
        
        <div 
          ref={adContainerRef}
          className="bg-muted/20 border border-border rounded-lg p-8 mb-6 min-h-[300px] flex items-center justify-center"
        >
          <p className="text-muted-foreground">Loading ad content...</p>
        </div>

        <Button
          onClick={onClose}
          disabled={timeLeft > 0}
          className="min-w-[150px]"
        >
          {timeLeft > 0 ? `Skip in ${timeLeft}s` : 'Skip Ad'}
        </Button>
      </div>

      {timeLeft <= 0 && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 hover:bg-white/10"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

// Banner ad component for between movie rows
interface MontagBannerProps {
  className?: string;
}

export function MontagBanner({ className }: MontagBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Monetag banner ad
    const script = document.createElement('script');
    script.src = 'https://dessertstormstay.com/400/8812752';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    
    if (adContainerRef.current) {
      adContainerRef.current.appendChild(script);
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={cn(
      'w-full py-4 flex items-center justify-center',
      className
    )}>
      <div className="container mx-auto px-4">
        <div
          ref={adContainerRef}
          className={cn(
            'w-full max-w-[728px] mx-auto min-h-[90px] rounded-lg bg-muted/10 border border-border/50 flex items-center justify-center',
            !isLoaded && 'animate-pulse'
          )}
        >
          {!isLoaded && (
            <p className="text-muted-foreground text-xs">Advertisement</p>
          )}
        </div>
      </div>
    </div>
  );
}
