import type { VisualizerState } from '@/types';
import { intervalToHue } from './note-mapper';

const MAX_PARTICLES = 200;

export function createVisualizerState(): VisualizerState {
  return { particles: [], waveHistory: [] };
}

export function spawnParticles(
  state: VisualizerState,
  cx: number,
  cy: number,
  intervalMs: number,
  count: number = 6
): void {
  const hue = intervalToHue(intervalMs);
  const speed = Math.max(0.5, Math.min(4, 1000 / intervalMs));

  for (let i = 0; i < count; i++) {
    if (state.particles.length >= MAX_PARTICLES) {
      state.particles.shift();
    }
    const angle = Math.random() * Math.PI * 2;
    const mag = speed * (0.5 + Math.random() * 1.5);
    state.particles.push({
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * mag,
      vy: Math.sin(angle) * mag,
      radius: 2 + Math.random() * 4,
      hue,
      alpha: 0.9,
      decay: 0.012 + Math.random() * 0.015,
    });
  }

  // Add to wave history
  const waveVal = Math.max(0, Math.min(1, 1 - (intervalMs - 50) / 950));
  state.waveHistory.push(waveVal);
  if (state.waveHistory.length > 200) state.waveHistory.shift();
}

export function tickVisualizer(
  state: VisualizerState,
  canvas: HTMLCanvasElement
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Fade background
  ctx.fillStyle = 'rgba(5, 5, 15, 0.18)';
  ctx.fillRect(0, 0, W, H);

  // Draw waveform at bottom
  drawWave(ctx, state.waveHistory, W, H);

  // Update + draw particles
  state.particles = state.particles.filter((p) => p.alpha > 0.01);
  for (const p of state.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02; // gravity
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.alpha -= p.decay;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha * 0.15})`;
    ctx.fill();
  }
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  history: number[],
  W: number,
  H: number
): void {
  if (history.length < 2) return;

  const waveH = 80;
  const baseY = H - 40;
  const step = W / Math.max(history.length - 1, 1);

  ctx.beginPath();
  ctx.moveTo(0, baseY);

  for (let i = 0; i < history.length; i++) {
    const x = i * step;
    const y = baseY - history[i] * waveH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.strokeStyle = 'rgba(100, 220, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fill gradient under wave
  const grad = ctx.createLinearGradient(0, baseY - waveH, 0, baseY);
  grad.addColorStop(0, 'rgba(100, 220, 255, 0.12)');
  grad.addColorStop(1, 'rgba(100, 220, 255, 0)');

  ctx.lineTo(W, baseY);
  ctx.lineTo(0, baseY);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}
