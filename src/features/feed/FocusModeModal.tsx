'use client';

import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle, Coffee, Shield } from 'lucide-react';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({ isOpen, onClose }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      alert('Focus session complete! Your mind is sharpened. Great job executive!');
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const handleStart = (minutes: number) => {
    setSelectedMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsActive(true);
  };

  const handleCancel = () => {
    setIsActive(false);
    setSecondsRemaining(selectedMinutes * 60);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Dojo Focus Icon */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
          <Timer className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold mb-1">Dojo Focus Sanctuary</h2>
        <p className="text-xs text-muted-foreground mb-6 max-w-xs">
          Silence feed distractions, block incoming notification pings, and dedicate your attention to deep work.
        </p>

        {isActive ? (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="text-5xl font-mono font-extrabold tracking-widest text-cyan-400 py-6 px-8 bg-secondary/40 rounded-2xl border border-cyan-500/20">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl">
              <Shield className="w-4 h-4" />
              <span>Feed and notifications paused</span>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition"
              >
                End Focus Session
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition"
              >
                Keep Running & Hide
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 w-full">
            <div className="grid grid-cols-3 gap-3">
              {[15, 30, 60].map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleStart(dur)}
                  className="py-3 px-2 rounded-2xl border border-border bg-secondary/40 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition flex flex-col items-center gap-1 group"
                >
                  <span className="text-lg font-bold group-hover:text-cyan-400">{dur}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Minutes</span>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground py-2 transition"
            >
              Close and Return to Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
