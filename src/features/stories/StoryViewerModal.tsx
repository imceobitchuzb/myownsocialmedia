'use client';

import React, { useState, useEffect } from 'react';
import { Story } from '@/types/models';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { BeltBadge } from '@/components/shared/BeltBadge';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const activeStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            clearInterval(interval);
            onClose();
            return 100;
          }
        }
        return prev + 2; // 50 ticks = ~5 seconds total per story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  if (!activeStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container simulating phone view */}
      <div className="relative w-full max-w-sm h-[85vh] max-h-[750px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800">
        {/* Progress Bar Segments */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between text-white drop-shadow">
          <div className="flex items-center gap-2.5">
            <img
              src={activeStory.author.avatar_url}
              alt={activeStory.author.display_name}
              className="w-9 h-9 rounded-full border-2 border-white object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-none">{activeStory.author.display_name}</span>
              <span className="text-[10px] text-white/80 mt-0.5">24h Story</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close story"
            className="p-1.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Story Visual Media */}
        <div className="relative flex-1 w-full bg-black flex items-center justify-center select-none">
          <img
            src={activeStory.media_url}
            alt="Ephemeral story"
            className="w-full h-full object-cover"
          />

          {/* Text Overlay */}
          {activeStory.text_overlay && (
            <div className="absolute bottom-16 left-6 right-6 z-20 text-center">
              <p className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-white font-semibold text-sm shadow-lg">
                {activeStory.text_overlay}
              </p>
            </div>
          )}

          {/* Tap Zones */}
          <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer" onClick={handleNext} />
        </div>

        {/* Story Bottom Bar with View Counter */}
        <div className="h-12 bg-neutral-950/80 px-4 flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{activeStory.views_count} views</span>
          </div>
          <BeltBadge xp={activeStory.author.xp} size="sm" />
        </div>
      </div>
    </div>
  );
};
