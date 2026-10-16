'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { FocusModeModal } from '@/features/feed/FocusModeModal';
import { SnapModal } from '@/features/snaps/SnapModal';
import { SearchModal } from '@/features/search/SearchModal';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/components/layout/ThemeProvider';
import { Logo } from '@/components/shared/Logo';
import {
  Home,
  Globe2,
  Trophy,
  MessageSquare,
  User as UserIcon,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { socialDataService } from '@/lib/socialDataService';
import { SEED_USERS } from '@/lib/seedData';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isSnapCameraOpen, setIsSnapCameraOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const { currentUser, addXP } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const handleSendSnap = (recipientId: string, mediaUrl: string, caption: string) => {
    if (currentUser) {
      const recipientUser = SEED_USERS.find((u) => u.id === recipientId) || currentUser;
      socialDataService.sendSnap({
        id: `snap-${Date.now()}`,
        sender_id: currentUser.id,
        sender: currentUser,
        recipient_id: recipientId,
        recipient: recipientUser,
        media_url: mediaUrl,
        caption: caption || undefined,
        status: 'delivered',
        created_at: new Date().toISOString(),
      });
    }
    addXP(20, 'send_snap');
  };

  const mobileTabs = [
    { label: 'Лента', href: '/', icon: Home },
    { label: '3D Радар', href: '/map', icon: Globe2 },
    { label: 'Чат', href: '/messages', icon: MessageSquare },
    { label: 'Вызовы', href: '/challenges', icon: Trophy },
    {
      label: 'Профиль',
      href: currentUser ? `/profile/${currentUser.username}` : '/profile/kenji_sato',
      icon: UserIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[1440px] flex">
        {/* Desktop Left Sidebar */}
        <Sidebar
          onOpenFocusMode={() => setIsFocusModeOpen(true)}
          onOpenSnapCamera={() => setIsSnapCameraOpen(true)}
        />

        {/* Center Main Stream */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen border-r border-border">
          {/* Mobile Top Header (Visible only on < md screens) */}
          <header className="md:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Logo size={28} showWordmark={true} />
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Search"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            </div>
          </header>

          {/* Page Content Body with Mobile Bottom Inset */}
          <main className="flex-1 min-w-0 px-3.5 sm:px-6 py-5 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
            {children}
          </main>
        </div>

        {/* Desktop Right Panel */}
        <RightPanel />
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on < md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border flex items-center justify-around py-2 px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 text-[10px] font-semibold transition-all px-3 py-1.5 rounded-2xl min-w-[56px] min-h-[44px] justify-center active:scale-95',
                isActive
                  ? 'text-primary bg-primary/10 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-primary animate-pulse')} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Search Modal */}
      <SearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />

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
