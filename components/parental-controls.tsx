'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Lock, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AgeRating = 'all' | 'pg' | 'pg13' | 'r' | 'nc17';

interface ParentalControlsProps {
  onRatingChange?: (rating: AgeRating) => void;
}

const PARENTAL_KEY = 'parentalControls';

const ageRatings: { value: AgeRating; label: string; description: string; color: string }[] = [
  { value: 'all', label: 'All Ages', description: 'Show all content', color: 'text-green-400' },
  { value: 'pg', label: 'PG', description: 'General audiences, some guidance', color: 'text-blue-400' },
  { value: 'pg13', label: 'PG-13', description: 'Some content may be inappropriate', color: 'text-yellow-400' },
  { value: 'r', label: 'R', description: 'Restricted, adult content', color: 'text-orange-400' },
  { value: 'nc17', label: 'NC-17', description: 'Adults only', color: 'text-red-400' },
];

export function getParentalSettings(): { rating: AgeRating; pinEnabled: boolean } {
  if (typeof window === 'undefined') return { rating: 'all', pinEnabled: false };
  try {
    const settings = JSON.parse(localStorage.getItem(PARENTAL_KEY) || '{}');
    return {
      rating: settings.rating || 'all',
      pinEnabled: settings.pinEnabled || false,
    };
  } catch {
    return { rating: 'all', pinEnabled: false };
  }
}

export function saveParentalSettings(settings: { rating: AgeRating; pin?: string; pinEnabled?: boolean }) {
  try {
    const current = JSON.parse(localStorage.getItem(PARENTAL_KEY) || '{}');
    localStorage.setItem(PARENTAL_KEY, JSON.stringify({ ...current, ...settings }));
  } catch {
    // ignore
  }
}

export function ParentalControls({ onRatingChange }: ParentalControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState<AgeRating>('all');
  const [pinEnabled, setPinEnabled] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const settings = getParentalSettings();
    setCurrentRating(settings.rating);
    setPinEnabled(settings.pinEnabled);
    setIsLocked(settings.pinEnabled);
  }, []);

  const handleRatingSelect = (rating: AgeRating) => {
    setCurrentRating(rating);
    saveParentalSettings({ rating });
    onRatingChange?.(rating);
  };

  const handleSetPin = () => {
    if (pin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    
    saveParentalSettings({ pin, pinEnabled: true });
    setPinEnabled(true);
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setPinError('');
  };

  const handleUnlock = () => {
    try {
      const settings = JSON.parse(localStorage.getItem(PARENTAL_KEY) || '{}');
      if (settings.pin === enteredPin) {
        setIsLocked(false);
        setEnteredPin('');
      } else {
        setPinError('Incorrect PIN');
      }
    } catch {
      setPinError('Error verifying PIN');
    }
  };

  const handleDisablePin = () => {
    saveParentalSettings({ pinEnabled: false });
    setPinEnabled(false);
    setIsLocked(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm">Parental Controls</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-background border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Parental Controls</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lock Screen */}
            {isLocked && pinEnabled ? (
              <div className="text-center py-4">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-white/70 mb-4">Enter your PIN to access settings</p>
                <input
                  type="password"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="****"
                  className="w-32 text-center text-2xl tracking-widest bg-white/5 border border-white/20 rounded-lg py-2 mb-2"
                />
                {pinError && <p className="text-red-400 text-sm mb-2">{pinError}</p>}
                <Button onClick={handleUnlock} className="w-full mt-4">Unlock</Button>
              </div>
            ) : showPinSetup ? (
              /* PIN Setup */
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70 block mb-2">Create 4-digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="****"
                    className="w-full text-center text-xl tracking-widest bg-white/5 border border-white/20 rounded-lg py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 block mb-2">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="****"
                    className="w-full text-center text-xl tracking-widest bg-white/5 border border-white/20 rounded-lg py-2"
                  />
                </div>
                {pinError && <p className="text-red-400 text-sm">{pinError}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPinSetup(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSetPin} className="flex-1">Set PIN</Button>
                </div>
              </div>
            ) : (
              /* Main Settings */
              <div className="space-y-6">
                {/* Age Rating Selection */}
                <div>
                  <p className="text-sm text-white/70 mb-3">Content Rating Filter</p>
                  <div className="space-y-2">
                    {ageRatings.map((rating) => (
                      <button
                        key={rating.value}
                        onClick={() => handleRatingSelect(rating.value)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                          currentRating === rating.value
                            ? "bg-primary/20 border-primary"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn("font-bold", rating.color)}>{rating.label}</span>
                          <span className="text-sm text-white/50">{rating.description}</span>
                        </div>
                        {currentRating === rating.value && (
                          <ShieldCheck className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PIN Protection */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-white/70" />
                      <span className="text-sm">PIN Protection</span>
                    </div>
                    {pinEnabled ? (
                      <button
                        onClick={handleDisablePin}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPinSetup(true)}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-white/40">
                    {pinEnabled 
                      ? 'PIN is required to change parental control settings'
                      : 'Add a PIN to protect these settings'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Badge showing current restriction level
export function ParentalBadge() {
  const [rating, setRating] = useState<AgeRating>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const settings = getParentalSettings();
    setRating(settings.rating);
  }, []);

  if (!mounted || rating === 'all') return null;

  const ratingInfo = ageRatings.find(r => r.value === rating);

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-1 rounded text-xs font-bold",
      "bg-black/50 border border-white/20"
    )}>
      <ShieldAlert className="w-3 h-3" />
      <span>{ratingInfo?.label}</span>
    </div>
  );
}
