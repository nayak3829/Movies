'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    // Check connection speed
    const connection = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number } }).connection;
    if (connection) {
      const isSlowNetwork = connection.effectiveType === '2g' || 
                           connection.effectiveType === 'slow-2g' ||
                           connection.downlink < 1;
      setIsSlowConnection(isSlowNetwork);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    const handleConnectionChange = () => {
      const conn = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number } }).connection;
      if (conn) {
        const isSlow = conn.effectiveType === '2g' || 
                      conn.effectiveType === 'slow-2g' ||
                      conn.downlink < 1;
        setIsSlowConnection(isSlow);
        if (isSlow) {
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 5000);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const conn = (navigator as Navigator & { connection?: { addEventListener: (type: string, fn: () => void) => void; removeEventListener: (type: string, fn: () => void) => void } }).connection;
    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) {
        conn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  if (!showBanner && isOnline && !isSlowConnection) return null;

  return (
    <div
      className={cn(
        'fixed top-16 left-0 right-0 z-40 transition-all duration-300',
        showBanner ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}
    >
      <div
        className={cn(
          'py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2',
          !isOnline
            ? 'bg-red-500/90 text-white'
            : isSlowConnection
            ? 'bg-yellow-500/90 text-black'
            : 'bg-green-500/90 text-white'
        )}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You are offline. Some features may not work.</span>
          </>
        ) : isSlowConnection ? (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>Slow connection detected. Images may load slowly.</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>You are back online!</span>
          </>
        )}
        <button
          onClick={() => setShowBanner(false)}
          className="ml-2 px-2 py-0.5 rounded hover:bg-black/20 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
