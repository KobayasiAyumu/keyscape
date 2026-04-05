'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { encodeSession } from '@/lib/share-codec';
import type { TypingSession } from '@/types';

interface ShareButtonProps {
  session: TypingSession;
}

export function ShareButton({ session }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (session.events.length < 3) return;

    const encoded = encodeSession(session);
    const url = `${window.location.origin}/play/${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      window.prompt('Copy this URL to share your composition:', url);
    }
  }, [session]);

  const isReady = session.events.length >= 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0.3 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 mt-6 flex justify-center"
    >
      <button
        onClick={handleShare}
        disabled={!isReady}
        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-mono transition-all duration-300 ${
          isReady
            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-400/50 cursor-pointer'
            : 'border border-white/10 text-white/30 cursor-not-allowed'
        }`}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-green-400"
            >
              ✓ Copied!
            </motion.span>
          ) : (
            <motion.span
              key="share"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              ↗ Share composition
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
