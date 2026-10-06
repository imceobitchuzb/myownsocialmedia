'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/models';
import { SEED_USERS } from '@/lib/seedData';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  loginAsDemo: (userId?: string) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  addXP: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted demo session or default to the guest demo user
    const saved = localStorage.getItem('ninjaloop_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        const demo = SEED_USERS.find(u => u.id === 'user-demo') || SEED_USERS[0];
        setCurrentUser(demo);
      }
    } else {
      const demo = SEED_USERS.find(u => u.id === 'user-demo') || SEED_USERS[0];
      setCurrentUser(demo);
    }
    setIsLoading(false);
  }, []);

  const loginAsDemo = (userId = 'user-demo') => {
    const user = SEED_USERS.find(u => u.id === userId) || SEED_USERS[0];
    setCurrentUser(user);
    localStorage.setItem('ninjaloop_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ninjaloop_user');
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('ninjaloop_user', JSON.stringify(updated));
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
        loginAsDemo,
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
