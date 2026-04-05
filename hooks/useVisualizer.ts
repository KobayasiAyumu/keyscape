'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  createVisualizerState,
  spawnParticles,
  tickVisualizer,
} from '@/lib/visualizer-engine';
import type { VisualizerState } from '@/types';

export function useVisualizer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const stateRef = useRef<VisualizerState>(createVisualizerState());
  const rafRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const startLoop = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const loop = () => {
      if (canvasRef.current) {
        tickVisualizer(stateRef.current, canvasRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [canvasRef]);

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    startLoop();
    return stopLoop;
  }, [startLoop, stopLoop]);

  const onKeystroke = useCallback((intervalMs: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const cx = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const cy = canvas.height * 0.3 + Math.random() * canvas.height * 0.4;
    spawnParticles(stateRef.current, cx, cy, intervalMs);
  }, [canvasRef]);

  const reset = useCallback(() => {
    stateRef.current = createVisualizerState();
  }, []);

  return { onKeystroke, reset };
}
