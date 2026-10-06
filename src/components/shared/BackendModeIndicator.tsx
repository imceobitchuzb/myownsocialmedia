'use client';

import React from 'react';
import { isRealSupabaseConfigured } from '@/lib/supabase/client';
import { Database, ShieldCheck } from 'lucide-react';

export const BackendModeIndicator: React.FC = () => {
  const isReal = isRealSupabaseConfigured();

  return (
    <div
      className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold shadow-lg backdrop-blur-md border select-none transition-all"
      style={{
        backgroundColor: isReal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
        borderColor: isReal ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)',
        color: isReal ? '#10B981' : '#38BDF8',
      }}
      title={
        isReal
          ? 'CEOWEB is operating on connected Supabase Cloud/Local Postgres & Realtime'
          : 'CEOWEB is operating in Local Evaluator Mode (Mock Store fallback active)'
      }
    >
      <Database className="w-3 h-3 animate-pulse" />
      <span>{isReal ? 'SUPABASE: LIVE' : 'BACKEND: MOCK STORE'}</span>
    </div>
  );
};
