'use client';

import { useEffect, useRef } from 'react';
import { useVisualizer } from '@/hooks/useVisualizer';

interface VisualizerProps {
  onRegisterCallback: (fn: (intervalMs: number) => void) => void;
}

export function Visualizer({ onRegisterCallback }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { onKeystroke } = useVisualizer(canvasRef);

  useEffect(() => {
    onRegisterCallback(onKeystroke);
  }, [onKeystroke, onRegisterCallback]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
