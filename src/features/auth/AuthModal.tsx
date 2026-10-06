'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useI18n } from '@/features/i18n/LanguageContext';
import { SEED_USERS } from '@/lib/seedData';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, setCurrentUser, currentUser } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<'login' | 'register' | 'switch'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
        }
      } else if (mode === 'register') {
        if (!username || !email) {
          setErrorMsg('Заполните обязательные поля');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, username, displayName);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка аутентификации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {mode === 'login' ? 'Вход в CEOWEB' : mode === 'register' ? 'Создать аккаунт' : 'Переключение профиля'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {mode === 'switch' ? 'Выберите активного пользователя' : 'Безопасная аутентификация Supabase'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-secondary rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg transition ${mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Вход
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg transition ${mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Регистрация
          </button>
          <button
            onClick={() => { setMode('switch'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg transition ${mode === 'switch' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Профили
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {errorMsg}
          </div>
        )}

        {mode === 'switch' ? (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {SEED_USERS.map((user) => {
              const isCurrent = currentUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isCurrent ? 'bg-primary/10 border-primary/40' : 'bg-secondary/40 border-border hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar_url} alt={user.display_name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-foreground">{user.display_name}</div>
                      <div className="text-[10px] text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                  {isCurrent && <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/20">Активен</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Никнейм (@username)</label>
                  <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2 text-xs">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="alex_ceo"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-transparent w-full focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Имя (Display Name)</label>
                  <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2 text-xs">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Alex Developer"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-transparent w-full focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
              <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2 text-xs">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="ceo@network.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent w-full focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Пароль</label>
              <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2 text-xs">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent w-full focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <span>{loading ? 'Обработка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
