'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Playback
  { keys: ['Space'], description: 'Play / Pause', category: 'Playback' },
  { keys: ['←'], description: 'Rewind 10 seconds', category: 'Playback' },
  { keys: ['→'], description: 'Forward 10 seconds', category: 'Playback' },
  { keys: ['↑'], description: 'Increase volume', category: 'Playback' },
  { keys: ['↓'], description: 'Decrease volume', category: 'Playback' },
  { keys: ['M'], description: 'Mute / Unmute', category: 'Playback' },
  
  // Navigation
  { keys: ['F'], description: 'Toggle fullscreen', category: 'Navigation' },
  { keys: ['Esc'], description: 'Exit fullscreen / Close player', category: 'Navigation' },
  { keys: ['N'], description: 'Next episode (TV shows)', category: 'Navigation' },
  { keys: ['P'], description: 'Previous episode (TV shows)', category: 'Navigation' },
  
  // General
  { keys: ['/', 'Ctrl', 'K'], description: 'Open search', category: 'General' },
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
];

interface KeyboardShortcutsProps {
  variant?: 'button' | 'icon' | 'text';
  className?: string;
}

export function KeyboardShortcuts({ variant = 'button', className }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for ? key to open shortcuts dialog
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      
      if (e.key === '?') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const TriggerButton = () => {
    if (variant === 'icon') {
      return (
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("text-muted-foreground hover:text-foreground", className)}
        >
          <Keyboard className="w-5 h-5" />
        </Button>
      );
    }
    
    if (variant === 'text') {
      return (
        <button className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
          className
        )}>
          <Keyboard className="w-4 h-4" />
          Keyboard Shortcuts
        </button>
      );
    }

    return (
      <Button 
        variant="outline" 
        size="sm"
        className={cn("gap-2 border-white/20 hover:bg-white/10", className)}
      >
        <Keyboard className="w-4 h-4" />
        Shortcuts
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <TriggerButton />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-primary mb-3">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-muted-foreground/50 mx-1">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border rounded">?</kbd> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Inline key indicator for tooltips
export function KeyHint({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((key, index) => (
        <span key={index}>
          {index > 0 && <span className="text-muted-foreground/50 mx-0.5">+</span>}
          <kbd className="px-1 py-0.5 text-[10px] font-medium bg-background/80 border border-border/50 rounded">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}
