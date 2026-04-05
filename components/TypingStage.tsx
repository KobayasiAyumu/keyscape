'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

interface TypingStageProps {
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onChange: (text: string) => void;
  onReset: () => void;
  eventCount: number;
}

export function TypingStage({ onKeyDown, onChange, onReset, eventCount }: TypingStageProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReset = () => {
    onReset();
    if (textareaRef.current) textareaRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative z-10 w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <textarea
          ref={textareaRef}
          onKeyDown={onKeyDown}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ここに何でも書いてください。あなたのタイピングが音楽になります..."
          className="w-full h-48 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-white/90 placeholder-white/25 resize-none focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all duration-300 font-mono text-sm leading-relaxed"
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className="text-white/30 text-xs font-mono">{eventCount} keys</span>
          {eventCount > 0 && (
            <button
              onClick={handleReset}
              className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200"
            >
              reset
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
