'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, Users, Eye, Sparkles } from 'lucide-react';

const analyticsData = [
  { day: 'Mon', views: 240, reach: 180 },
  { day: 'Tue', views: 420, reach: 310 },
  { day: 'Wed', views: 680, reach: 520 },
  { day: 'Thu', views: 590, reach: 480 },
  { day: 'Fri', views: 920, reach: 760 },
  { day: 'Sat', views: 1350, reach: 1100 },
  { day: 'Sun', views: 1180, reach: 980 },
];

export const CreatorAnalytics: React.FC = () => {
  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <h3 className="font-bold text-sm">Executive Creator Analytics</h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
          +38% vs last week
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-secondary/40 rounded-2xl border border-border/60">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Profile Views</p>
          <p className="text-lg font-black text-rose-500">5,380</p>
        </div>
        <div className="p-3 bg-secondary/40 rounded-2xl border border-border/60">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Post Reach</p>
          <p className="text-lg font-black text-cyan-400">14.2K</p>
        </div>
        <div className="p-3 bg-secondary/40 rounded-2xl border border-border/60">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Free Sparks</p>
          <p className="text-lg font-black text-amber-400">890 ⚡</p>
        </div>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsData}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E11D48" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#888888" fontSize={10} tickLine={false} />
            <YAxis stroke="#888888" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#131B2A',
                borderColor: '#1F2D44',
                borderRadius: '0.75rem',
                fontSize: '11px',
              }}
            />
            <Area type="monotone" dataKey="views" stroke="#E11D48" fillOpacity={1} fill="url(#colorViews)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
