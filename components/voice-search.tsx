'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceSearchProps {
  onResult: (text: string) => void;
  onListening?: (isListening: boolean) => void;
  className?: string;
}

export function VoiceSearch({ onResult, onListening, className }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as Window & typeof globalThis & { 
      webkitSpeechRecognition?: typeof window.SpeechRecognition;
      SpeechRecognition?: typeof window.SpeechRecognition;
    }).webkitSpeechRecognition || (window as Window & typeof globalThis & { 
      SpeechRecognition?: typeof window.SpeechRecognition;
    }).SpeechRecognition;
    
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice search is not supported in your browser');
      return;
    }

    setError(null);
    setIsListening(true);
    onListening?.(true);

    const SpeechRecognition = (window as Window & typeof globalThis & { 
      webkitSpeechRecognition?: typeof window.SpeechRecognition;
    }).webkitSpeechRecognition || (window as Window & typeof globalThis & { 
      SpeechRecognition?: typeof window.SpeechRecognition;
    }).SpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
      onListening?.(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error === 'not-allowed' 
        ? 'Microphone access denied' 
        : 'Voice search failed');
      setIsListening(false);
      onListening?.(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListening?.(false);
    };

    try {
      recognition.start();
    } catch {
      setError('Failed to start voice search');
      setIsListening(false);
      onListening?.(false);
    }
  }, [isSupported, onResult, onListening]);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="relative">
      <button
        onClick={startListening}
        disabled={isListening}
        className={cn(
          "p-2.5 rounded-full transition-all duration-300",
          isListening 
            ? "bg-primary text-white animate-pulse" 
            : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white",
          "border border-white/10 hover:border-white/20",
          className
        )}
        aria-label={isListening ? 'Listening...' : 'Voice search'}
        title={isListening ? 'Listening...' : 'Click to search by voice'}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-5 h-5" />
            {/* Pulsing rings */}
            <span className="absolute inset-0 rounded-full border-2 border-white animate-ping" />
          </div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-primary rounded-full text-white text-xs font-medium whitespace-nowrap animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Listening...
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-destructive/90 rounded-lg text-white text-xs whitespace-nowrap animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}
    </div>
  );
}

// Larger version with visual feedback
export function VoiceSearchLarge({ 
  onResult, 
  onClose 
}: { 
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const SpeechRecognition = (window as Window & typeof globalThis & { 
      webkitSpeechRecognition?: typeof window.SpeechRecognition;
    }).webkitSpeechRecognition || (window as Window & typeof globalThis & { 
      SpeechRecognition?: typeof window.SpeechRecognition;
    }).SpeechRecognition;

    if (!SpeechRecognition) {
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      
      setTranscript(final || interim);
      
      if (final) {
        onResult(final);
        recognition.stop();
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [onResult, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="flex flex-col items-center">
        {/* Animated mic button */}
        <div className="relative mb-8">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center",
            isListening ? "bg-primary" : "bg-white/20"
          )}>
            <Mic className="w-12 h-12 text-white" />
          </div>
          
          {/* Animated rings */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" />
              <span className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDelay: '0.2s' }} />
              <span className="absolute -inset-8 rounded-full border border-primary/20 animate-ping" style={{ animationDelay: '0.4s' }} />
            </>
          )}
        </div>

        {/* Status text */}
        <p className="text-white text-lg mb-2">
          {isListening ? 'Listening...' : 'Starting...'}
        </p>

        {/* Transcript */}
        {transcript && (
          <p className="text-white/70 text-center max-w-sm mb-6">
            "{transcript}"
          </p>
        )}

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
