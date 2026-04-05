'use client';

import { motion } from 'framer-motion';
import type { AudioSettings, Timbre } from '@/types';

interface ControlBarProps {
  settings: AudioSettings;
  onChange: (patch: Partial<AudioSettings>) => void;
}

const TIMBRES: { value: Timbre; label: string }[] = [
  { value: 'sine', label: 'Sine' },
  { value: 'triangle', label: 'Tri' },
  { value: 'sawtooth', label: 'Saw' },
  { value: 'square', label: 'Sqr' },
];

export function ControlBar({ settings, onChange }: ControlBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative z-10 flex flex-wrap items-center justify-center gap-6 mt-6"
    >
      {/* Volume */}
      <div className="flex items-center gap-3">
        <label className="text-white/40 text-xs font-mono uppercase tracking-widest">Vol</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.volume}
          onChange={(e) => onChange({ volume: parseFloat(e.target.value) })}
          className="w-24 accent-cyan-400 cursor-pointer"
        />
        <span className="text-white/40 text-xs font-mono w-8">
          {Math.round(settings.volume * 100)}
        </span>
      </div>

      {/* Timbre */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Wave</span>
        <div className="flex gap-1">
          {TIMBRES.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange({ timbre: t.value })}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all duration-200 ${
                settings.timbre === t.value
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reverb toggle */}
      <div className="flex items-center gap-2">
        <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Reverb</span>
        <button
          onClick={() => onChange({ reverbEnabled: !settings.reverbEnabled })}
          className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
            settings.reverbEnabled ? 'bg-cyan-500/50' : 'bg-white/10'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
              settings.reverbEnabled
                ? 'left-5 bg-cyan-300'
                : 'left-0.5 bg-white/40'
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}
