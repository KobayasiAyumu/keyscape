'use client';

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Visualizer } from '@/components/Visualizer';
import { TypingStage } from '@/components/TypingStage';
import { ControlBar } from '@/components/ControlBar';
import { ShareButton } from '@/components/ShareButton';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useTypingCapture } from '@/hooks/useTypingCapture';
import type { KeystrokeEvent } from '@/types';

export default function HomePage() {
  const { settings, playKeystroke, updateSettings } = useAudioEngine();
  const visualizerCallbackRef = useRef<((intervalMs: number) => void) | null>(null);

  const handleRegisterVisualizer = useCallback((fn: (intervalMs: number) => void) => {
    visualizerCallbackRef.current = fn;
  }, []);

  // Single onKeystroke handler: audio + visualizer from the same event object
  const handleKeystroke = useCallback(
    async (event: KeystrokeEvent) => {
      await playKeystroke(event);
      visualizerCallbackRef.current?.(event.intervalMs);
    },
    [playKeystroke]
  );

  // Single source of truth for session state — lifted up from TypingStage
  const { session, handleKeyDown, handleChange, reset } = useTypingCapture(handleKeystroke);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <Visualizer onRegisterCallback={handleRegisterVisualizer} />

      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center mb-12"
      >
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-3">
          Keyscape
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">
          your typing is music
        </p>
        <div className="mt-4 flex justify-center gap-6 text-white/20 text-xs font-mono">
          <span>speed → pitch</span>
          <span className="text-white/10">·</span>
          <span>rhythm → tempo</span>
          <span className="text-white/10">·</span>
          <span>style → timbre</span>
        </div>
      </motion.header>

      <TypingStage
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onReset={reset}
        eventCount={session.events.length}
      />

      <ControlBar settings={settings} onChange={updateSettings} />

      <ShareButton session={session} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative z-10 mt-16 text-white/15 text-xs text-center font-mono"
      >
        Each person&apos;s typing creates a unique musical fingerprint
      </motion.p>
    </main>
  );
}
