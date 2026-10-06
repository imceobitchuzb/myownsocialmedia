'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ReportItem {
  id: string;
  reporter: string;
  targetType: 'post' | 'user' | 'comment';
  targetSummary: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export default function ModerationPage() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'rep-1',
      reporter: 'elena_sound',
      targetType: 'comment',
      targetSummary: 'Spam comment linking to external crypto phishing site',
      reason: 'Spam / Commercial solicitation',
      status: 'pending',
    },
    {
      id: 'rep-2',
      reporter: 'maya_ai',
      targetType: 'post',
      targetSummary: 'Off-topic spam in Study & Code mood feed',
      reason: 'Incorrect tagging / Flood',
      status: 'pending',
    },
  ]);

  const handleResolve = (id: string, action: 'resolved' | 'dismissed') => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: action } : r)));
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-gradient-to-r from-rose-950/70 via-card to-secondary/80 border border-rose-500/30 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-rose-500 mb-2">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Admin Dojo Guard</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Content Moderation & Safety</h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Review community reports, enforce the CEOWEB code of honor, and maintain safety for all clan members (13+ compliance).
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold flex items-center justify-between">
          <span>Active Flag Queue</span>
          <span className="text-xs text-muted-foreground">
            {reports.filter((r) => r.status === 'pending').length} pending review
          </span>
        </h2>

        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-secondary text-foreground">
                  {report.targetType}
                </span>
                <span className="text-xs text-muted-foreground">Reported by @{report.reporter}</span>
              </div>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  report.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-500'
                    : report.status === 'resolved'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {report.status}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-foreground">{report.targetSummary}</p>
              <p className="text-[11px] text-rose-500 font-semibold mt-1">Reason: {report.reason}</p>
            </div>

            {report.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  onClick={() => handleResolve(report.id, 'dismissed')}
                  className="px-3 py-1.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 text-xs font-semibold transition"
                >
                  Dismiss Flag
                </button>
                <button
                  onClick={() => handleResolve(report.id, 'resolved')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 text-white hover:opacity-90 text-xs font-semibold transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Take Down & Penalize</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
