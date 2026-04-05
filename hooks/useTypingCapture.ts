'use client';

import { useCallback, useRef, useState } from 'react';
import type { KeystrokeEvent, TypingSession } from '@/types';

export function useTypingCapture(onEvent?: (event: KeystrokeEvent) => void) {
  const [session, setSession] = useState<TypingSession>(() => ({
    events: [],
    startTime: Date.now(),
    text: '',
  }));
  const lastTimestampRef = useRef<number>(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const now = Date.now();
      const interval =
        lastTimestampRef.current === 0 ? 300 : now - lastTimestampRef.current;
      lastTimestampRef.current = now;

      const event: KeystrokeEvent = {
        key: e.key,
        timestamp: now,
        intervalMs: Math.min(interval, 2000),
        isSpecial: e.key === ' ' || e.key === 'Enter' || e.key === 'Backspace',
        isUpperCase:
          e.key.length === 1 &&
          e.key === e.key.toUpperCase() &&
          e.key !== e.key.toLowerCase(),
        charCode: e.key.charCodeAt(0) || 0,
      };

      setSession((prev) => ({
        ...prev,
        events: prev.events.length >= 500
          ? [...prev.events.slice(-499), event]
          : [...prev.events, event],
      }));

      onEvent?.(event);
    },
    [onEvent]
  );

  const handleChange = useCallback((text: string) => {
    setSession((prev) => ({ ...prev, text }));
  }, []);

  const reset = useCallback(() => {
    lastTimestampRef.current = 0;
    setSession(() => ({ events: [], startTime: Date.now(), text: '' }));
  }, []);

  return { session, handleKeyDown, handleChange, reset };
}
