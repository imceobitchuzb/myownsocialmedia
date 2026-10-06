import { describe, it, expect } from 'vitest';

describe('Voice & Video Circle Message State Machine', () => {
  interface RecordingState {
    status: 'idle' | 'recording_voice' | 'recording_video' | 'reviewing';
    duration: number;
    maxDuration: number;
  }

  const startVoice = (): RecordingState => ({
    status: 'recording_voice',
    duration: 0,
    maxDuration: 300, // 5 min max
  });

  const startVideoCircle = (): RecordingState => ({
    status: 'recording_video',
    duration: 0,
    maxDuration: 60, // 60s max
  });

  const tick = (state: RecordingState): RecordingState => {
    const nextDuration = state.duration + 1;
    if (nextDuration >= state.maxDuration) {
      return { ...state, duration: state.maxDuration, status: 'reviewing' };
    }
    return { ...state, duration: nextDuration };
  };

  it('initializes voice recording with 5-minute cap', () => {
    const state = startVoice();
    expect(state.status).toBe('recording_voice');
    expect(state.maxDuration).toBe(300);
  });

  it('initializes round video note recording with 60-second cap', () => {
    const state = startVideoCircle();
    expect(state.status).toBe('recording_video');
    expect(state.maxDuration).toBe(60);
  });

  it('automatically transitions to reviewing when max duration is reached', () => {
    let state = startVideoCircle();
    state.duration = 59;
    const next = tick(state);
    expect(next.status).toBe('reviewing');
    expect(next.duration).toBe(60);
  });
});
