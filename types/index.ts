export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  intervalMs: number;
  isSpecial: boolean;
  isUpperCase: boolean;
  charCode: number;
}

export interface TypingSession {
  events: KeystrokeEvent[];
  startTime: number;
  text: string;
}

export interface NoteEvent {
  frequency: number;
  duration: number;
  velocity: number;
  type: Timbre;
  reverb: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  alpha: number;
  decay: number;
}

export interface VisualizerState {
  particles: Particle[];
  waveHistory: number[];
}

export type Timbre = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface AudioSettings {
  volume: number;
  timbre: Timbre;
  reverbEnabled: boolean;
}

export interface ShareData {
  events: Array<{
    k: string;
    t: number;
    i: number;
    s: boolean;
    u: boolean;
  }>;
  text: string;
  startTime: number;
}
