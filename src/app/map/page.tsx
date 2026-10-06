'use client';

import React, { useState } from 'react';
import { SEED_USERS } from '@/lib/seedData';
import { MapPin, Eye, EyeOff, Navigation, Sparkles, Phone, MessageSquare, Flame } from 'lucide-react';
import { BeltBadge } from '@/components/shared/BeltBadge';

interface FriendMarker {
  id: string;
  user: (typeof SEED_USERS)[0];
  statusText: string;
  city: string;
  lat: number;
  lng: number;
}

export default function FriendsMapPage() {
  const [ghostMode, setGhostMode] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<FriendMarker | null>(null);

  const friendMarkers: FriendMarker[] = [
    {
      id: 'f-1',
      user: SEED_USERS[0],
      statusText: 'Debugging kernels in Akihabara 🦀',
      city: 'Tokyo, Japan',
      lat: 35.6895,
      lng: 139.6917,
    },
    {
      id: 'f-2',
      user: SEED_USERS[1],
      statusText: 'Midterm sprint at Moffitt Library 📚',
      city: 'Berkeley, CA',
      lat: 37.8719,
      lng: -122.2585,
    },
    {
      id: 'f-3',
      user: SEED_USERS[2],
      statusText: 'Synth jamming in Shibuya 🎧',
      city: 'Tokyo, Japan',
      lat: 35.658,
      lng: 139.7016,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Map Header */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <MapPin className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Executive Network Radar</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Friends Radar & Hangouts</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            OpenStreetMap compatible • Privacy-first 500m fuzzing • Auto-expires in 4h
          </p>
        </div>

        {/* Ghost Mode Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGhostMode(!ghostMode)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
              ghostMode
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-secondary text-foreground hover:bg-secondary/80 border-border'
            }`}
          >
            {ghostMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{ghostMode ? 'Ghost Mode ON (Hidden)' : 'Ghost Mode OFF'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full h-[450px] bg-slate-950 border border-border/80 rounded-3xl overflow-hidden shadow-md flex items-center justify-center">
        {/* Subtle Map Grid / World Topography pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />

        {/* World Continents Schematic Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <svg viewBox="0 0 1000 500" className="w-full h-full text-cyan-500 fill-current">
            <circle cx="200" cy="200" r="80" />
            <circle cx="500" cy="180" r="90" />
            <circle cx="750" cy="220" r="110" />
          </svg>
        </div>

        {/* Friend Pins on Map */}
        <div className="relative z-10 w-full h-full flex items-center justify-around px-8">
          {friendMarkers.map((marker, idx) => (
            <div
              key={marker.id}
              onClick={() => setSelectedFriend(marker)}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              {/* Radar Pulse Effect */}
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-cyan-400/20 animate-ping" />
                <div className="w-14 h-14 rounded-full border-2 border-cyan-400 p-0.5 bg-card shadow-lg group-hover:scale-110 transition-transform">
                  <img
                    src={marker.user.avatar_url}
                    alt={marker.user.display_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 text-sm">📍</span>
              </div>

              <div className="bg-card/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-border text-center shadow-md">
                <p className="text-[11px] font-bold">{marker.user.display_name}</p>
                <p className="text-[9px] text-muted-foreground">{marker.city}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Attribution note */}
        <div className="absolute bottom-2 right-4 text-[9px] text-muted-foreground bg-black/60 px-2 py-0.5 rounded-md">
          MapLibre GL JS • © OpenStreetMap contributors
        </div>
      </div>

      {/* Selected Friend Detail Drawer */}
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
              <p className="text-[10px] text-muted-foreground">{selectedFriend.city} (Position Fuzzed to ~500m)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (window.location.href = '/messages')}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>
            <button
              onClick={() => alert(`Waved to ${selectedFriend.user.display_name}! 👋`)}
              className="p-2.5 bg-secondary text-foreground rounded-xl text-xs font-semibold hover:bg-secondary/80"
            >
              👋 Wave
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
