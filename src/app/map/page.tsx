'use client';

import React, { useState, useEffect } from 'react';
import { SEED_USERS } from '@/lib/seedData';
import { MapPin, Eye, EyeOff, Navigation, Sparkles, Phone, MessageSquare, Compass, ShieldAlert } from 'lucide-react';
import { BeltBadge } from '@/components/shared/BeltBadge';
import { useI18n } from '@/features/i18n/LanguageContext';

interface FriendMarker {
  id: string;
  user: (typeof SEED_USERS)[0];
  statusText: string;
  city: string;
  lat: number;
  lng: number;
}

export default function FriendsMapPage() {
  const { t } = useI18n();
  const [ghostMode, setGhostMode] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendMarker | null>(null);
  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>('Запрос геопозиции...');

  // Active friends online on the map
  const friendMarkers: FriendMarker[] = [
    {
      id: 'f-1',
      user: SEED_USERS[0],
      statusText: 'Оптимизирую Rust-ядро стриминга 🦀',
      city: 'Токио, Япония',
      lat: 35.6895,
      lng: 139.6917,
    },
    {
      id: 'f-2',
      user: SEED_USERS[1],
      statusText: 'В библиотеке готовлюсь к релизу 📚',
      city: 'Беркли, США',
      lat: 37.8719,
      lng: -122.2585,
    },
    {
      id: 'f-3',
      user: SEED_USERS[2],
      statusText: 'Записываю новый трек 🎧',
      city: 'Москва, Россия',
      lat: 55.7558,
      lng: 37.6173,
    },
    {
      id: 'f-4',
      user: SEED_USERS[3],
      statusText: 'Завариваю чай 🍵',
      city: 'Санкт-Петербург, Россия',
      lat: 59.9343,
      lng: 30.3351,
    },
  ];

  // Request actual browser geolocation
  useEffect(() => {
    if (navigator.geolocation && !ghostMode) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
          setGeoStatus('Геопозиция определена онлайн');
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err);
          setMyCoords({ lat: 55.7558, lng: 37.6173 });
          setGeoStatus('Используется город профиля');
        },
        { timeout: 8000 }
      );
    } else if (ghostMode) {
      setMyCoords(null);
      setGeoStatus('Режим невидимки: координаты скрыты');
    }
  }, [ghostMode]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Map Header */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Compass className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.radar_title}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{t.friends_radar}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t.radar_subtitle}</p>
        </div>

        {/* Ghost Mode Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGhostMode(!ghostMode)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border shadow-sm ${
              ghostMode
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-secondary text-foreground hover:bg-secondary/80 border-border'
            }`}
          >
            {ghostMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{ghostMode ? t.ghost_mode_on : t.ghost_mode_off}</span>
          </button>
        </div>
      </div>

      {/* Online Geolocation Status Banner */}
      <div className="px-4 py-2.5 bg-secondary/50 border border-border/60 rounded-2xl text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${ghostMode ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="font-semibold text-foreground">{geoStatus}</span>
        </div>
        {myCoords && (
          <span className="font-mono text-[11px] text-cyan-400 font-bold">
            LAT: {myCoords.lat} • LNG: {myCoords.lng}
          </span>
        )}
      </div>

      {/* OpenStreetMap Interactive Stage */}
      <div className="relative w-full h-[520px] bg-slate-950 border border-border/80 rounded-3xl overflow-hidden shadow-xl flex flex-col">
        {/* OpenStreetMap Real Live Map Tile Iframe */}
        <iframe
          title="OpenStreetMap Live Interactive View"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=25.0%2C30.0%2C145.0%2C65.0&layer=mapnik&marker=${
            myCoords ? `${myCoords.lat}%2C${myCoords.lng}` : '55.7558%2C37.6173'
          }`}
          className="w-full h-full border-0 filter brightness-90 contrast-105"
        />

        {/* Online Friends Overlay Cards */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none pointer-events-auto">
          {friendMarkers.map((marker) => (
            <div
              key={marker.id}
              onClick={() => setSelectedFriend(marker)}
              className="flex items-center gap-2.5 bg-card/90 backdrop-blur-md border border-border/80 px-3 py-2 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition flex-shrink-0"
            >
              <div className="relative">
                <img
                  src={marker.user.avatar_url}
                  alt={marker.user.display_name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-card" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{marker.user.display_name}</span>
                <span className="text-[10px] text-muted-foreground">{marker.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Friend Quick Action Drawer */}
      {selectedFriend && (
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedFriend.user.avatar_url}
              alt={selectedFriend.user.display_name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">{selectedFriend.user.display_name}</h3>
                <BeltBadge xp={selectedFriend.user.xp} size="sm" />
              </div>
              <p className="text-xs text-cyan-400 font-medium">{selectedFriend.statusText}</p>
              <p className="text-[10px] text-muted-foreground">{selectedFriend.city} (Координаты защищены)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (window.location.href = '/messages')}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.message}</span>
            </button>
            <button
              onClick={() => alert(`Вы помахали пользователю ${selectedFriend.user.display_name}! 👋`)}
              className="p-2.5 bg-secondary text-foreground rounded-xl text-xs font-semibold hover:bg-secondary/80"
            >
              👋 {t.wave}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
