'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioEngine } from '@/lib/audio-engine';
import { keystrokeToNote } from '@/lib/note-mapper';
import type { AudioSettings, KeystrokeEvent } from '@/types';

const DEFAULT_SETTINGS: AudioSettings = {
  volume: 0.7,
  timbre: 'sine',
  reverbEnabled: true,
};

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    engineRef.current = new AudioEngine();
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setVolume(settings.volume);
  }, [settings.volume]);

  const playKeystroke = useCallback(
    async (event: KeystrokeEvent) => {
      if (!engineRef.current) return;
      await engineRef.current.resume();
      const note = keystrokeToNote(event, settings);
      if (note) engineRef.current.playNote(note);
    },
    [settings]
  );

  const updateSettings = useCallback((patch: Partial<AudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, playKeystroke, updateSettings };
}
