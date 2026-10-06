'use client';

import React from 'react';
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
  Timer,
  Radio,
  MapPin
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useI18n } from '@/features/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC<{ onOpenFocusMode?: () => void; onOpenSnapCamera?: () => void }> = ({
  onOpenFocusMode,
  onOpenSnapCamera
}) => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const navItems = [
    { label: t.feed_wall, href: '/', icon: Home },
    { label: t.friends_radar, href: '/map', icon: MapPin },
    { label: t.live_streams, href: '/live', icon: Radio, badge: 'Live' },
    { label: t.story_chains, href: '/chains', icon: Sparkles, badge: 'Hot' },
    { label: t.weekly_challenges, href: '/challenges', icon: Trophy },
    { label: t.messages, href: '/messages', icon: MessageSquare },
    { label: t.communities, href: '/communities', icon: Users },
    { label: t.my_wall, href: currentUser ? `/profile/${currentUser.username}` : '/profile/ceo_founder', icon: UserIcon },
    { label: t.settings_privacy, href: '/settings', icon: Sparkles },
    { label: t.moderation, href: '/admin/moderation', icon: ShieldAlert, adminOnly: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border p-4 justify-between select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Logo size={36} showWordmark={true} />
          </Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Current User Quick Badge */}
        {currentUser && (
          <div className="p-3 rounded-2xl bg-secondary/50 border border-border/50 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.display_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
              />
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium text-sm truncate">{currentUser.display_name}</span>
                <span className="text-xs text-muted-foreground truncate">@{currentUser.username}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <BeltBadge xp={currentUser.xp} size="sm" />
              <span className="text-xs font-semibold text-rose-500">{currentUser.xp} XP</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            if (item.adminOnly && !currentUser?.is_admin) return null;
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Action shortcuts: Snap Camera & Focus Mode */}
      <div className="flex flex-col gap-2 pt-4 border-t border-border">
        {/* Language switch button */}
        <button
          onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
          className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl font-medium text-xs bg-secondary/60 hover:bg-secondary text-foreground transition"
        >
          <span>{t.language}</span>
          <span className="font-bold text-primary uppercase">{lang}</span>
        </button>

        {onOpenSnapCamera && (
          <button
            onClick={onOpenSnapCamera}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20 hover:opacity-95 transition"
          >
            <Camera className="w-4 h-4" />
            <span>{t.send_quick_snap}</span>
          </button>
        )}
        {onOpenFocusMode && (
          <button
            onClick={onOpenFocusMode}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium text-xs bg-secondary/80 hover:bg-secondary text-foreground transition"
          >
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.focus_mode}</span>
          </button>
        )}
      </div>
    </aside>
  );
};
