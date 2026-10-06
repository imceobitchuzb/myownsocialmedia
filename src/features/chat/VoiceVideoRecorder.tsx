'use client';

import React, { useState, useRef } from 'react';
import { Mic, Video, Square, Play, Pause, RotateCcw, Send, AlertCircle } from 'lucide-react';

interface VoiceVideoRecorderProps {
  onSendMedia: (type: 'voice' | 'video_circle', url: string, durationSec: number, transcript?: string) => void;
}

export const VoiceVideoRecorder: React.FC<VoiceVideoRecorderProps> = ({ onSendMedia }) => {
  const [mode, setMode] = useState<'idle' | 'recording_voice' | 'recording_video'>('idle');
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startVoiceRecording = async () => {
    try {
      setErrorMessage('');
      setDuration(0);
      setMode('recording_voice');
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage('Microphone access unavailable or denied.');
    }
  };

  const startVideoCircleRecording = async () => {
    try {
      setErrorMessage('');
      setDuration(0);
      setMode('recording_video');
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage('Camera access unavailable or denied.');
    }
  };

  const stopAndSend = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const recordedSec = Math.max(1, duration);

    if (mode === 'recording_voice') {
      onSendMedia(
        'voice',
        'https://actions.google.com/sounds/v1/water/creek_water_lapping.ogg',
        recordedSec,
        'Simulated audio transcript: "Hey, checking in on the CEOWEB stream!"'
      );
    } else if (mode === 'recording_video') {
      onSendMedia(
        'video_circle',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        recordedSec
      );
    }
    setMode('idle');
    setDuration(0);
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('idle');
    setDuration(0);
  };

  return (
    <div className="flex items-center gap-1.5">
      {errorMessage && (
        <span className="text-[10px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {errorMessage}
        </span>
      )}

      {mode === 'idle' ? (
        <>
          <button
            type="button"
            onClick={startVoiceRecording}
            aria-label="Record voice note"
            title="Record voice note"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <Mic className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={startVideoCircleRecording}
            aria-label="Record video circle note"
            title="Record round video message"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <Video className="w-4 h-4 text-rose-400" />
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 bg-secondary/80 px-3 py-1.5 rounded-2xl border border-primary/40 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono text-xs font-semibold text-rose-500">
            {mode === 'recording_voice' ? 'Voice' : 'Circle'}: {duration}s
          </span>
          <button
            type="button"
            onClick={cancelRecording}
            className="p-1 text-muted-foreground hover:text-foreground"
            title="Cancel"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={stopAndSend}
            className="p-1 text-primary hover:opacity-80"
            title="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
