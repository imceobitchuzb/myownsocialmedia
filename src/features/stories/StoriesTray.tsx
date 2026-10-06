'use client';

import React, { useState } from 'react';
import { Story, User } from '@/types/models';
import { Plus } from 'lucide-react';
import { StoryViewerModal } from './StoryViewerModal';

interface StoriesTrayProps {
  stories: Story[];
  currentUser: User | null;
  onPostStory?: (imageUrl: string, text: string) => void;
}

export const StoriesTray: React.FC<StoriesTrayProps> = ({
  stories,
  currentUser,
  onPostStory,
}) => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [storyImage, setStoryImage] = useState('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80');
  const [storyText, setStoryText] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onPostStory) {
      onPostStory(storyImage, storyText);
    }
    setIsCreating(false);
    setStoryText('');
  };

  return (
    <div className="w-full bg-card border border-border/80 rounded-2xl p-4 mb-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {/* Add Story Button */}
        <div
          onClick={() => setIsCreating(true)}
          className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
        >
          <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-primary/60 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform bg-primary/5">
            {currentUser ? (
              <img
                src={currentUser.avatar_url}
                alt="Your avatar"
                className="w-full h-full rounded-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-secondary" />
            )}
            <span className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full shadow-md">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
            Add Story
          </span>
        </div>

        {/* Story Circles */}
        {stories.map((story, idx) => (
          <div
            key={story.id}
            onClick={() => setSelectedStoryIndex(idx)}
            className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-400 group-hover:scale-105 transition-transform shadow-sm">
              <div className="w-full h-full rounded-full bg-card p-[2px]">
                <img
                  src={story.author.avatar_url}
                  alt={story.author.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-foreground truncate max-w-[68px]">
              {story.author.display_name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      {/* Quick Add Story Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-3">Add 24h Ephemeral Story</h3>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Image URL</label>
                <input
                  type="text"
                  value={storyImage}
                  onChange={(e) => setStoryImage(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Story Caption Overlay</label>
                <input
                  type="text"
                  placeholder="e.g. Practicing Katana algorithms..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className="w-full mt-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90"
                >
                  Post Story (+25 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
