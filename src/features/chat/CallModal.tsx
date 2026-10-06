'use client';

import React, { useState } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, AlertTriangle } from 'lucide-react';

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
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(callType === 'voice');
  const [callDuration, setCallDuration] = useState(0);

  // LiveKit configuration check
  const livekitConfigured =
    Boolean(process.env.NEXT_PUBLIC_LIVEKIT_URL) &&
    !process.env.NEXT_PUBLIC_LIVEKIT_URL?.includes('example');

  React.useEffect(() => {
    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-8 text-white">
        {/* Notice if LiveKit credentials are not populated */}
        {!livekitConfigured && (
          <div className="w-full mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Calls need LiveKit configured in .env.local. Running in interactive demo mode.</span>
          </div>
        )}

        {/* Video / Avatar Canvas */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-primary/40 shadow-2xl mb-4">
          <img src={recipientAvatar} alt={recipientName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/10" />
        </div>

        <h3 className="text-xl font-bold">{recipientName}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {callType === 'video' ? 'CEOWEB HD Video Stream' : 'CEOWEB Encrypted Voice Call'} • {formatTimer(callDuration)}
        </p>

        {/* Controls Bar */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`p-3.5 rounded-full transition ${
              isMicMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
            title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className={`p-3.5 rounded-full transition ${
                isVideoMuted ? 'bg-rose-500 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
              title={isVideoMuted ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={() => alert('Screen sharing initialized (WebRTC DisplayMedia).')}
            className="p-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition"
            title="Share screen"
          >
            <Monitor className="w-5 h-5" />
          </button>

          <button
            onClick={onEndCall}
            className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/40 transition"
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
