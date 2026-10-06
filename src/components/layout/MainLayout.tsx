'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { FocusModeModal } from '@/features/feed/FocusModeModal';
import { SnapModal } from '@/features/snaps/SnapModal';
import { useAuth } from '@/features/auth/AuthContext';
import { Home, Sparkles, Trophy, MessageSquare, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isSnapCameraOpen, setIsSnapCameraOpen] = useState(false);
  const { currentUser, addXP } = useAuth();
  const pathname = usePathname();

  const handleSendSnap = (recipientId: string, mediaUrl: string, caption: string) => {
    addXP(20);
  };

  const mobileTabs = [
    { label: 'Feed', href: '/', icon: Home },
    { label: 'Chains', href: '/chains', icon: Sparkles },
    { label: 'Challenges', href: '/challenges', icon: Trophy },
    { label: 'Chat', href: '/messages', icon: MessageSquare },
    { label: 'Profile', href: currentUser ? `/profile/${currentUser.username}` : '/profile/ceo_founder', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[1440px] flex">
        {/* Left Sidebar */}
        <Sidebar
          onOpenFocusMode={() => setIsFocusModeOpen(true)}
          onOpenSnapCamera={() => setIsSnapCameraOpen(true)}
        />

        {/* Center Main Stream */}
        <main className="flex-1 min-w-0 border-r border-border min-h-screen pb-20 md:pb-8 px-3 sm:px-6 py-6">
          {children}
        </main>

        {/* Right Info Panel */}
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-around py-2.5 px-1">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors px-2 py-1 rounded-xl',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Focus Mode Overlay */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
      />

      {/* Ephemeral Snap Camera Modal */}
      {isSnapCameraOpen && (
        <SnapModal
          currentUser={currentUser}
          onClose={() => setIsSnapCameraOpen(false)}
          onSendSnap={handleSendSnap}
        />
      )}
    </div>
  );
};
