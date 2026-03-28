'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface FastImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
}

export function FastImage({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder-movie.jpg',
  showSkeleton = true,
  skeletonClassName,
  priority,
  ...props
}: FastImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority || false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Skeleton loader */}
      {showSkeleton && !isLoaded && (
        <div className={cn(
          "absolute inset-0 bg-muted overflow-hidden",
          skeletonClassName
        )}>
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      )}

      {/* Only render image when in view */}
      {isInView && (
        <Image
          src={imageSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          priority={priority}
          {...props}
        />
      )}
    </div>
  );
}
