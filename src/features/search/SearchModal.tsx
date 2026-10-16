'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types/models';
import { socialDataService } from '@/lib/socialDataService';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { Search, X, Loader2, UserPlus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search (300ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const users = await socialDataService.searchUsers(query.trim());
        setResults(users);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск людей по имени, @username или городу..."
            className="flex-1 bg-transparent border-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary text-muted-foreground hover:text-foreground"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-3 flex flex-col gap-1.5">
          {isSearching && (
            <div className="p-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Поиск в SocialMediaUZ...</span>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
                Найдено пользователей ({results.length})
              </span>
              {results.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-secondary/70 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-border/80 group-hover:ring-primary/40 transition"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                          {user.display_name}
                        </span>
                        <BeltBadge xp={user.xp} size="sm" showTitle={false} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>@{user.username}</span>
                        {user.city && (
                          <>
                            <span>•</span>
                            <span>{user.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                    Профиль
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}

          {!isSearching && query.trim() && results.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Search className="w-6 h-6 text-muted-foreground/40" />
              <p>По запросу «{query}» ничего не найдено.</p>
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Введите имя, @никнейм или город пользователя для мгновенного перехода в профиль.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
