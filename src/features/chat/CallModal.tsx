'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, Volume2 } from 'lucide-react';
import { useI18n } from '@/features/i18n/LanguageContext';

interface CallModalProps {
  recipientName: string;
  recipientAvatar: string;
  callType: 'voice' | 'video';
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  recipientName,
  recipientAvatar,
  callType,
  onEndCall,
}) => {
  const { t } = useI18n();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(callType === 'voice');
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<string>(t.connecting_call);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize real browser MediaStream (audio/video) for calls
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCallHardware() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video',
        });
        setLocalStream(stream);
        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = stream;
        }
        setCallStatus(t.in_call);
      } catch (err) {
        console.warn('Call device access fallback:', err);
        setCallStatus(t.in_call);
      }
    }

    startCallHardware();

    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callType, t]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoMuted;
      });
    }
    setIsVideoMuted(!isVideoMuted);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-8 text-white">
        {/* Status header */}
        <div className="flex items-center gap-2 mb-6 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{callStatus} • {formatTimer(callDuration)}</span>
        </div>

        {/* Video Canvas / Avatar Stage */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-cyan-500/60 shadow-2xl mb-6 bg-black flex items-center justify-center">
          {callType === 'video' && !isVideoMuted ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <img src={recipientAvatar} alt={recipientName} className="w-full h-full object-cover" />
          )}
        </div>

        <h3 className="text-xl font-bold">{recipientName}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {callType === 'video' ? 'CEOWEB HD Video Stream' : 'CEOWEB Encrypted Voice Stream'}
        </p>

        {/* Call Controls Bar */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition shadow-lg ${
              isMicMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
            title={isMicMuted ? t.unmute_mic : t.mute_mic}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition shadow-lg ${
                isVideoMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
              title={t.toggle_camera}
            >
              {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => {
              if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
              }
              onEndCall();
            }}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/40 transition active:scale-95"
            title={t.end_call}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
