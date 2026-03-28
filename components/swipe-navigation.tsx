'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeNavigationProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  showIndicators?: boolean;
  currentIndex?: number;
  totalItems?: number;
  className?: string;
}

export function SwipeNavigation({
  children,
  onSwipeLeft,
  onSwipeRight,
  showIndicators = false,
  currentIndex = 0,
  totalItems = 0,
  className,
}: SwipeNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    const distance = touchStart - currentTouch;
    if (Math.abs(distance) > 20) {
      setSwipeDirection(distance > 0 ? 'left' : 'right');
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwiping(false);
      setSwipeDirection(null);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    setSwiping(false);
    setSwipeDirection(null);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="touch-pan-y"
      >
        {children}
      </div>

      {/* Swipe indicators */}
      {swiping && swipeDirection && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full backdrop-blur-sm transition-opacity",
          swipeDirection === 'left' ? "right-4" : "left-4"
        )}>
          {swipeDirection === 'left' ? (
            <ChevronRight className="w-6 h-6 text-white" />
          ) : (
            <ChevronLeft className="w-6 h-6 text-white" />
          )}
        </div>
      )}

      {/* Dot indicators */}
      {showIndicators && totalItems > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: totalItems }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "bg-primary w-4" 
                  : "bg-white/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for swipe detection
export function useSwipe(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  minDistance = 50
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!touchStart) return;
      
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
      
      const deltaX = touchStart.x - touchEnd.x;
      const deltaY = touchStart.y - touchEnd.y;
      
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontal) {
        if (deltaX > minDistance && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX < -minDistance && onSwipeRight) {
          onSwipeRight();
        }
      } else {
        if (deltaY > minDistance && onSwipeUp) {
          onSwipeUp();
        } else if (deltaY < -minDistance && onSwipeDown) {
          onSwipeDown();
        }
      }
      
      setTouchStart(null);
    },
  };

  return handlers;
}
