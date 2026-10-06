'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/models';
import { SEED_USERS } from '@/lib/seedData';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  addXP: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load authenticated user session
    const saved = localStorage.getItem('ceoweb_user');
    if (saved) {
      try {
        setCurrentUserState(JSON.parse(saved));
      } catch {
        const defaultUser = SEED_USERS.find(u => u.id === 'user-me') || SEED_USERS[0];
        setCurrentUserState(defaultUser);
      }
    } else {
      const defaultUser = SEED_USERS.find(u => u.id === 'user-me') || SEED_USERS[0];
      setCurrentUserState(defaultUser);
    }
    setIsLoading(false);
  }, []);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('ceoweb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ceoweb_user');
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem('ceoweb_user');
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUserState(updated);
    localStorage.setItem('ceoweb_user', JSON.stringify(updated));
  };

  const addXP = (amount: number) => {
    if (!currentUser) return;
    const newXp = currentUser.xp + amount;
    updateCurrentUser({ xp: newXp });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        setCurrentUser,
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
