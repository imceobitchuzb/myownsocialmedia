'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User as UserIcon,
  MessageSquare,
  Users,
  Compass,
  Trophy,
  Sparkles,
  ShieldAlert,
  Moon,
  Sun,
  Camera,
  Radio,
  Search,
  Globe2,
  Settings as SettingsIcon,
  LogIn,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useI18n } from '@/features/i18n/LanguageContext';
import { AuthModal } from '@/features/auth/AuthModal';
import { SearchModal } from '@/features/search/SearchModal';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onOpenFocusMode?: () => void;
  onOpenSnapCamera?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenFocusMode,
  onOpenSnapCamera,
}) => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { label: t.feed_wall, href: '/', icon: Home },
    { label: t.friends_radar, href: '/map', icon: Globe2, badge: '3D' },
    { label: t.messages, href: '/messages', icon: MessageSquare },
    { label: t.weekly_challenges, href: '/challenges', icon: Trophy },
    { label: t.communities, href: '/communities', icon: Users },
    { label: t.story_chains, href: '/chains', icon: Sparkles },
    { label: t.live_streams, href: '/live', icon: Radio, badge: 'Live' },
    {
      label: t.my_wall,
      href: currentUser ? `/profile/${currentUser.username}` : '/profile/kenji_sato',
      icon: UserIcon,
    },
    { label: t.settings_privacy, href: '/settings', icon: SettingsIcon },
    { label: t.moderation, href: '/admin/moderation', icon: ShieldAlert, adminOnly: true },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border p-4 justify-between select-none overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1">
            <Link href="/" className="flex items-center group">
              <Logo size={34} showWordmark={true} />
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition active:scale-95"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {/* Quick Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-secondary/50 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition text-xs shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-primary" />
              <span>Поиск людей...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-card border border-border font-mono">
              /
            </kbd>
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.adminOnly && !currentUser?.is_admin) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-primary-foreground' : 'group-hover:text-primary transition-colors')} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Snap & Camera Action */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
            {onOpenSnapCamera && (
              <button
                onClick={onOpenSnapCamera}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary text-foreground text-xs font-bold transition border border-border/80 shadow-sm"
              >
                <Camera className="w-4 h-4 text-primary" />
                <span>{t.send_quick_snap}</span>
              </button>
            )}
          </div>
        </div>

        {/* Current User Quick Drawer / Login Button */}
        <div className="pt-4 border-t border-border/60">
          {currentUser ? (
            <div
              onClick={() => setIsAuthOpen(true)}
              role="button"
              tabIndex={0}
              className="p-3 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col gap-2 cursor-pointer hover:bg-secondary/70 transition group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.display_name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary/60 transition"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-xs truncate text-foreground">{currentUser.display_name}</span>
                  <span className="text-[11px] text-muted-foreground truncate">@{currentUser.username}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-0.5 pt-1.5 border-t border-border/40">
                <BeltBadge xp={currentUser.xp} size="sm" showTitle={false} />
                <span className="text-xs font-bold text-primary">{currentUser.xp} XP</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти / Регистрация</span>
            </button>
          )}
        </div>
      </aside>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
