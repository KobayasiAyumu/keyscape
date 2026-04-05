'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AudioEngine } from '@/lib/audio-engine';
import { keystrokeToNote } from '@/lib/note-mapper';
import { spawnParticles, tickVisualizer, createVisualizerState } from '@/lib/visualizer-engine';
import type { TypingSession } from '@/types';

interface PlaybackPlayerProps {
  session: TypingSession;
}

export function PlaybackPlayer({ session }: PlaybackPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AudioEngine | null>(null);
  const vizStateRef = useRef(createVisualizerState());
  const rafRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    engineRef.current = new AudioEngine();
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const loop = () => {
      if (canvas) tickVisualizer(vizStateRef.current, canvas);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const play = useCallback(async () => {
    if (!engineRef.current || isPlaying) return;
    setIsPlaying(true);

    await engineRef.current.resume();

    const events = session.events;
    const total = events.length;

    for (let i = 0; i < total; i++) {
      const event = events[i];
      const note = keystrokeToNote(event, { volume: 0.7, timbre: 'sine', reverbEnabled: true });
      if (note) engineRef.current.playNote(note);

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const cx = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
        const cy = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
        spawnParticles(vizStateRef.current, cx, cy, event.intervalMs);
      }

      setProgress(Math.round(((i + 1) / total) * 100));

      // Wait for the interval before next note
      await new Promise((r) => setTimeout(r, Math.min(event.intervalMs, 800)));
    }

    setIsPlaying(false);
    setProgress(100);
  }, [session, isPlaying]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
          Someone&apos;s typing composition
        </p>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">
          Keyscape
        </h1>
        <p className="text-white/20 text-sm font-mono mb-10">
          {session.events.length} keystrokes · {session.text.slice(0, 40)}{session.text.length > 40 ? '...' : ''}
        </p>

        <button
          onClick={play}
          disabled={isPlaying}
          className={`px-10 py-4 rounded-full font-mono text-sm transition-all duration-300 ${
            isPlaying
              ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 border border-cyan-500/40 text-cyan-300 hover:from-cyan-500/40 hover:to-purple-500/40 cursor-pointer'
          }`}
        >
          {isPlaying ? `Playing... ${progress}%` : progress === 100 ? '↺ Replay' : '▶ Play composition'}
        </button>

        {/* Progress bar */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 w-64 mx-auto"
          >
            <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}

        <p className="mt-10 text-white/15 text-xs font-mono">
          <Link href="/" className="hover:text-white/40 transition-colors">
            ← Create your own
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
