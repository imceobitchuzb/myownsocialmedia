'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/models';
import { SEED_USERS } from '@/lib/seedData';
import { isRealSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { socialDataService } from '@/lib/socialDataService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, username?: string, displayName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  addXP: (amount: number, action?: string, refId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to load profile from Supabase
  const loadSupabaseProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        return data as unknown as User;
      }
    } catch (err) {
      console.error('Failed to load profile from Supabase:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isRealSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const profile = await loadSupabaseProfile(session.user.id);
            if (profile && mounted) {
              setCurrentUserState(profile);
              setIsLoading(false);
              return;
            }
          }

          // Subscribe to auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (session?.user) {
                const profile = await loadSupabaseProfile(session.user.id);
                if (profile && mounted) {
                  setCurrentUserState(profile);
                }
              } else if (mounted) {
                setCurrentUserState(null);
              }
            }
          );

          if (mounted) setIsLoading(false);
          return () => subscription.unsubscribe();
        } catch (err) {
          console.error('Supabase auth init error:', err);
        }
      }

      // Safe local session fallback (e.g. offline or admissions review)
      const saved = typeof window !== 'undefined' ? localStorage.getItem('ceoweb_user') : null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (mounted) setCurrentUserState(parsed);
        } catch {
          if (mounted) setCurrentUserState(SEED_USERS[0]);
        }
      } else {
        if (mounted) setCurrentUserState(SEED_USERS[0]);
      }

      if (mounted) setIsLoading(false);
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [loadSupabaseProfile]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('ceoweb_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('ceoweb_user');
      }
    }
  };

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        if (password) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) return { error: error.message };
          if (data.user) {
            const profile = await loadSupabaseProfile(data.user.id);
            if (profile) setCurrentUser(profile);
          }
          return {};
        } else {
          // Magic link fallback
          const { error } = await supabase.auth.signInWithOtp({ email });
          if (error) return { error: error.message };
          return {};
        }
      } catch (err: any) {
        return { error: err?.message || 'Login failed' };
      }
    }

    // Local mode account lookup
    const found = SEED_USERS.find(
      (u) => u.username.toLowerCase() === email.toLowerCase() || u.id === email
    ) || SEED_USERS[0];
    setCurrentUser(found);
    return {};
  };

  const signUp = async (
    email: string,
    password?: string,
    username?: string,
    displayName?: string
  ): Promise<{ error?: string }> => {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || 'SecureCEOPassword123!',
          options: {
            data: {
              username: username || email.split('@')[0],
              display_name: displayName || username || email.split('@')[0],
            },
          },
        });
        if (error) return { error: error.message };
        if (data.user) {
          const profile = await loadSupabaseProfile(data.user.id);
          if (profile) setCurrentUser(profile);
        }
        return {};
      } catch (err: any) {
        return { error: err?.message || 'Registration failed' };
      }
    }

    // Local mode user creation
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: username || email.split('@')[0],
      display_name: displayName || username || email.split('@')[0],
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'New CEOWEB member',
      status_line: 'Ready to build',
      xp: 0,
      belt_rank: 'white',
      age: 18,
    };
    setCurrentUser(newUser);
    return {};
  };

  const logout = async () => {
    if (isRealSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase logout error:', err);
      }
    }
    setCurrentUser(null);
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (!currentUser) return;

    if (isRealSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', currentUser.id);
      } catch (err) {
        console.error('Failed to update profile in Supabase:', err);
      }
    }

    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
  };

  const addXP = async (amount: number, action = 'social_activity', refId?: string) => {
    if (!currentUser) return;
    try {
      const result = await socialDataService.awardXP(currentUser.id, amount, action, refId);
      if (result.success) {
        setCurrentUserState((prev) => (prev ? { ...prev, xp: result.xp, belt_rank: result.belt_rank } : null));
        if (typeof window !== 'undefined' && currentUser) {
          localStorage.setItem('ceoweb_user', JSON.stringify({ ...currentUser, xp: result.xp, belt_rank: result.belt_rank }));
        }
      }
    } catch (err) {
      console.error('addXP error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        setCurrentUser,
        signIn,
        signUp,
        logout,
        updateCurrentUser,
        addXP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
