'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n } from '@/features/i18n/LanguageContext';
import { UserLocation } from '@/types/models';
import { socialDataService } from '@/lib/socialDataService';
import { calculateDistanceKm, formatLocationFreshness } from '@/lib/locationPrivacy';
import { BeltBadge } from '@/components/shared/BeltBadge';
import {
  Globe2,
  Shield,
  Eye,
  EyeOff,
  Navigation,
  Search,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Loader2,
  Lock,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

// Lazy-load the heavy Three.js 3D globe component so it doesn't affect initial load of other pages
const EarthGlobe3D = dynamic(
  () => import('@/features/radar/EarthGlobe3D').then((mod) => mod.EarthGlobe3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-3xl bg-[#07090E] border border-border/80 flex flex-col items-center justify-center gap-3 shadow-2xl">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Инициализация 3D Глобуса...
        </span>
      </div>
    ),
  }
);

export default function FriendsRadarPage() {
  const { currentUser, addXP } = useAuth();
  const { t } = useI18n();

  // Privacy & Sharing states
  const [sharingEnabled, setSharingEnabled] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<'friends' | 'public' | 'nobody'>('friends');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [myLocation, setMyLocation] = useState<UserLocation | null>(null);
  const [geoStatusMsg, setGeoStatusMsg] = useState<string>('Геолокация отключена (Конфиденциально)');

  // Friends & Selection state
  const [friendsLocations, setFriendsLocations] = useState<UserLocation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<UserLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Load friends locations
  const loadFriends = useCallback(async () => {
    if (!currentUser) return;
    try {
      const locs = await socialDataService.getFriendsLocations(currentUser.id);
      setFriendsLocations(locs.filter((l) => l.userId !== currentUser.id));
    } catch (err) {
      console.error('Failed to load friends locations:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Handle browser Geolocation
  const requestAndStartLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      setGeoStatusMsg('Браузер не поддерживает Geolocation API');
      return;
    }

    setIsUpdatingLocation(true);
    setGeoStatusMsg('Запрос разрешения на геопозицию...');

    // Clear any previous watcher
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const onPositionSuccess = async (pos: GeolocationPosition) => {
      setPermissionState('granted');
      setIsUpdatingLocation(false);

      // Throttle: don't update backend more than once every 20 seconds
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 20000) return;
      lastUpdateTimeRef.current = now;

      const lat = Number(pos.coords.latitude.toFixed(4));
      const lng = Number(pos.coords.longitude.toFixed(4));
      const accuracy = Math.round(pos.coords.accuracy);

      if (currentUser) {
        const record = await socialDataService.updateUserLocation({
          userId: currentUser.id,
          lat,
          lng,
          accuracyMeters: accuracy,
          city: currentUser.city || 'Узбекистан',
          statusText: currentUser.status_line,
          sharingEnabled: true,
          visibility,
        });

        if (record) {
          setMyLocation(record);
          setGeoStatusMsg(`Онлайн трансляция • Точность ~${accuracy}м (округлено до ~500м)`);
          addXP(15, 'share_location', `loc_${new Date().toDateString()}`);
        }
      }
      loadFriends();
    };

    const onPositionError = (err: GeolocationPositionError) => {
      setIsUpdatingLocation(false);
      if (err.code === err.PERMISSION_DENIED) {
        setPermissionState('denied');
        setGeoStatusMsg('Доступ к геолокации запрещён в настройках браузера');
      } else if (err.code === err.TIMEOUT) {
        setGeoStatusMsg('Превышено время ожидания ответа GPS/Wi-Fi');
      } else {
        setGeoStatusMsg('Не удалось определить текущие координаты');
      }
      setSharingEnabled(false);
    };

    // First get quick position, then set watch
    navigator.geolocation.getCurrentPosition(onPositionSuccess, onPositionError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    });

    watchIdRef.current = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {
      enableHighAccuracy: false,
      timeout: 25000,
      maximumAge: 60000,
    });
  }, [currentUser, visibility, addXP, loadFriends]);

  // Stop location sharing
  const stopLocationSharing = useCallback(async () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharingEnabled(false);
    setMyLocation(null);
    setGeoStatusMsg('Геолокация отключена • Координаты удалены');

    if (currentUser) {
      await socialDataService.clearUserLocation(currentUser.id);
    }
    loadFriends();
  }, [currentUser, loadFriends]);

  // Toggle Sharing
  const handleToggleSharing = () => {
    if (sharingEnabled) {
      stopLocationSharing();
    } else {
      setSharingEnabled(true);
      requestAndStartLocation();
    }
  };

  // Cleanup on page unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Filter friends list by search query
  const filteredFriends = friendsLocations.filter((f) =>
    f.user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.city && f.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* 3D Radar Header Banner */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Globe2 className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.radar_title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t.friends_radar}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
            {t.radar_subtitle}
          </p>
        </div>

        {/* Location Privacy & Broadcast Toggle Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={handleToggleSharing}
            disabled={isUpdatingLocation}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border shadow-sm ${
              sharingEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {isUpdatingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : sharingEnabled ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span>{sharingEnabled ? t.ghost_mode_off : t.share_location}</span>
          </button>
        </div>
      </div>

      {/* Permission Warning if Denied */}
      {permissionState === 'denied' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <p>
            <strong>{t.permission_denied}</strong> Чтобы появиться на 3D глобусе, разрешите доступ к
            геолокации в настройках вашего браузера для этого сайта.
          </p>
        </div>
      )}

      {/* Real-time Broadcast Status & Privacy Banner */}
      <div className="px-5 py-3 bg-secondary/40 border border-border/80 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              sharingEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'
            }`}
          />
          <span className="font-semibold text-foreground">{geoStatusMsg}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 font-mono">
            <Shield className="w-3.5 h-3.5 text-primary" />
            {t.location_precision_note}
          </span>
          {myLocation && (
            <span className="font-mono text-primary font-bold">
              {myLocation.lat.toFixed(3)}°, {myLocation.lng.toFixed(3)}°
            </span>
          )}
        </div>
      </div>

      {/* Search Friends on 3D Globe Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.search_friends_on_globe}
          className="w-full bg-card border border-border/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
      </div>

      {/* 3D Interactive Three.js Globe Stage */}
      <EarthGlobe3D
        friends={filteredFriends}
        myLocation={myLocation}
        selectedFriend={selectedFriend}
        onSelectFriend={(friend) => setSelectedFriend(friend)}
      />

      {/* Selected Friend Drawer Card */}
      {selectedFriend && (
        <div className="bg-card border border-border rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={selectedFriend.user.avatar_url}
                alt={selectedFriend.user.display_name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/40 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${selectedFriend.user.username}`}
                  className="font-bold text-sm sm:text-base hover:text-primary transition"
                >
                  {selectedFriend.user.display_name}
                </Link>
                <BeltBadge xp={selectedFriend.user.xp} size="sm" />
              </div>

              <p className="text-xs text-primary font-medium italic mt-0.5">
                "{selectedFriend.statusText || selectedFriend.user.status_line}"
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mt-1">
                <span>📍 {selectedFriend.city || 'Местоположение подтверждено'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {formatLocationFreshness(selectedFriend.updatedAt).label}
                </span>
                {myLocation && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-foreground">
                      ~{calculateDistanceKm(myLocation.lat, myLocation.lng, selectedFriend.lat, selectedFriend.lng)} км от вас
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Link
              href="/messages"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.message}</span>
            </Link>

            <button
              onClick={() => {
                alert(`Вы отправили приветственный импульс пользователю ${selectedFriend.user.display_name}! 👋`);
                addXP(5);
              }}
              className="px-4 py-2 bg-secondary text-foreground rounded-xl text-xs font-semibold hover:bg-secondary/80 transition"
            >
              👋 {t.wave}
            </button>
          </div>
        </div>
      )}

      {/* Empty State when no friends are currently sharing */}
      {friendsLocations.length === 0 && !myLocation && (
        <div className="p-8 rounded-3xl bg-card border border-border/80 text-center flex flex-col items-center gap-3 shadow-sm">
          <Compass className="w-8 h-8 text-muted-foreground/60" />
          <h3 className="text-sm font-bold text-foreground">{t.no_friends_on_globe}</h3>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            Включите «{t.share_location}» вверху, чтобы ваш аватар отобразился на интерактивном 3D глобусе, или пригласите друзей в SocialMediaUZ.
          </p>
        </div>
      )}
    </div>
  );
}
