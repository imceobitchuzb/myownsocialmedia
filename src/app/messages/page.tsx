'use client';

import React, { useState } from 'react';
import { SEED_USERS } from '@/lib/seedData';
import { DirectMessage, User } from '@/types/models';
import { useAuth } from '@/features/auth/AuthContext';
import { BeltBadge } from '@/components/shared/BeltBadge';
import {
  Send,
  CheckCheck,
  Flame,
  Phone,
  Video,
  ArrowLeft,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VoiceVideoRecorder } from '@/features/chat/VoiceVideoRecorder';
import { CallModal } from '@/features/chat/CallModal';

export default function MessagesPage() {
  const { currentUser, addXP } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<User | null>(SEED_USERS[1]); // Maya Lin
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);
  const [isMobileViewingChat, setIsMobileViewingChat] = useState<boolean>(true);

  const [messages, setMessages] = useState<DirectMessage[]>([
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: SEED_USERS[1].id,
      sender: SEED_USERS[1],
      content: 'Привет! Запустили новый 3D радар друзей на SocialMediaUZ. Выглядит потрясающе!',
      is_read: true,
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: currentUser?.id || 'user-demo',
      sender: currentUser || SEED_USERS[6],
      content: 'Да, теперь видно реальные координаты на интерактивном глобусе Земли с защитой приватности.',
      is_read: true,
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-3',
      conversation_id: 'conv-1',
      sender_id: SEED_USERS[1].id,
      sender: SEED_USERS[1],
      content: 'Отличная работа! Давай созвонимся через аудиоканал, проверим качество стрима 🚀',
      is_read: true,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: 'conv-1',
      sender_id: currentUser.id,
      sender: currentUser,
      content: inputText.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    addXP(5, 'send_message');
  };

  const handleRecordedMedia = (type: 'voice' | 'video_circle', mediaUrl: string, duration: number) => {
    if (!currentUser) return;
    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: 'conv-1',
      sender_id: currentUser.id,
      sender: currentUser,
      content: type === 'voice' ? '🎤 Голосовое сообщение' : '⭕ Видеокружок',
      media_url: mediaUrl,
      media_type: type,
      duration_sec: duration,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, newMsg]);
    addXP(15, 'send_recorded_media');
  };

  const friendsList = SEED_USERS.filter((u) => u.id !== currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-7.5rem)] md:h-[calc(100vh-6rem)] bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm flex animate-fade-in">
      {/* Conversation List Column */}
      <div
        className={`w-full md:w-80 border-r border-border/80 flex flex-col bg-secondary/15 ${
          isMobileViewingChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-foreground">Диалоги</h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3 text-primary" />
              Зашифрованный чат
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {friendsList.map((friend) => (
            <button
              key={friend.id}
              onClick={() => {
                setSelectedFriend(friend);
                setIsMobileViewingChat(true);
              }}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition text-left ${
                selectedFriend?.id === friend.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-secondary/60'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={friend.avatar_url}
                  alt={friend.display_name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-border"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs truncate text-foreground">{friend.display_name}</span>
                  <BeltBadge xp={friend.xp} size="sm" showTitle={false} />
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{friend.status_line}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Chat Conversation Area */}
      {selectedFriend ? (
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            !isMobileViewingChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-border/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setIsMobileViewingChat(false)}
                className="md:hidden p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <img
                src={selectedFriend.avatar_url}
                alt={selectedFriend.display_name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-border flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm truncate text-foreground">
                    {selectedFriend.display_name}
                  </span>
                  <BeltBadge xp={selectedFriend.xp} size="sm" showTitle={false} />
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">В сети • Онлайн</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setActiveCall('voice')}
                className="p-2 rounded-xl bg-secondary/70 hover:bg-secondary text-foreground transition active:scale-95"
                title="Аудиозвонок"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={() => setActiveCall('video')}
                className="p-2 rounded-xl bg-secondary/70 hover:bg-secondary text-foreground transition active:scale-95"
                title="Видеозвонок"
              >
                <Video className="w-4 h-4 text-primary" />
              </button>
              <div className="hidden sm:flex items-center gap-1 text-xs text-rose-500 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                <Flame className="w-3.5 h-3.5 fill-rose-500" />
                <span>14 дней</span>
              </div>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((m) => {
              const isMe = m.sender_id === (currentUser?.id || 'user-demo');
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm'
                        : 'bg-secondary/70 text-foreground border border-border/60 rounded-tl-sm'
                    }`}
                  >
                    {m.media_type === 'voice' && (
                      <div className="flex items-center gap-2 py-1">
                        <audio src={m.media_url} controls className="h-8 max-w-full" />
                      </div>
                    )}
                    {m.media_type === 'video_circle' && (
                      <div className="py-1">
                        <video
                          src={m.media_url}
                          controls
                          className="w-44 h-44 rounded-full object-cover border-2 border-white/20"
                        />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Chat Input Form with Voice/Video Circle buttons */}
          <div className="p-3 border-t border-border/80 bg-card flex flex-col gap-2">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-secondary/50 border border-border/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {/* Voice & Video Circle Recorder */}
              <VoiceVideoRecorder onSendMedia={handleRecordedMedia} />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 disabled:opacity-50 transition shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs">
          <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-primary" />
          <p className="font-semibold text-foreground">Выберите диалог</p>
          <p className="text-[11px] mt-0.5">Выберите друга слева, чтобы начать переписку.</p>
        </div>
      )}

      {/* Voice/Video Call Modal */}
      {activeCall && selectedFriend && (
        <CallModal
          callType={activeCall}
          recipientName={selectedFriend.display_name}
          recipientAvatar={selectedFriend.avatar_url}
          onEndCall={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
