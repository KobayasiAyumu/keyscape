import type { KeystrokeEvent, NoteEvent, AudioSettings } from '@/types';

// MIDI note to frequency: A4 = 440Hz
function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Pentatonic scale in MIDI notes (C major pentatonic: C D E G A)
const PENTATONIC = [48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81];

// Map interval (ms) to scale degree — faster typing = higher notes
function intervalToScaleDegree(intervalMs: number): number {
  // interval range: 50ms (very fast) → 1000ms (very slow)
  const clamped = Math.max(50, Math.min(1000, intervalMs));
  const normalized = 1 - (clamped - 50) / 950; // 1 = fast, 0 = slow
  return Math.floor(normalized * (PENTATONIC.length - 1));
}

// Map char code to slight pitch variation (±1 semitone region)
function charToDetune(charCode: number): number {
  return ((charCode % 12) - 6) * 8; // cents, -48 to +48
}

export function keystrokeToNote(event: KeystrokeEvent, settings: AudioSettings): NoteEvent | null {
  if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta') {
    return null;
  }

  const degree = intervalToScaleDegree(event.intervalMs);
  let midiNote = PENTATONIC[degree];

  // Uppercase → octave up
  if (event.isUpperCase) midiNote += 12;

  // Backspace → dissonant lower note
  if (event.key === 'Backspace') {
    midiNote = PENTATONIC[0] - 2;
  }

  // Space/Enter → open chord tone (pure fifth)
  if (event.key === ' ' || event.key === 'Enter') {
    midiNote = PENTATONIC[Math.floor(degree / 2)];
  }

  const baseFreq = midiToHz(midiNote);
  const detuneFactor = Math.pow(2, charToDetune(event.charCode) / 1200);
  const frequency = baseFreq * detuneFactor;

  // Duration: shorter interval → shorter note
  const duration = Math.max(80, Math.min(600, event.intervalMs * 0.6));

  // Velocity: map interval to volume (fast = louder)
  const velocity = 0.3 + (1 - intervalToScaleDegree(event.intervalMs) / PENTATONIC.length) * 0.5;

  // Reverb: slow typing = more reverb
  const reverb = settings.reverbEnabled
    ? Math.max(0, Math.min(1, event.intervalMs / 1000))
    : 0;

  return {
    frequency,
    duration,
    velocity: velocity * settings.volume,
    type: settings.timbre,
    reverb,
  };
}

// Hue mapping for visualization: interval → color
export function intervalToHue(intervalMs: number): number {
  const normalized = Math.max(0, Math.min(1, (intervalMs - 50) / 950));
  // Fast = cyan (180°), slow = purple (270°)
  return 180 + normalized * 90;
}
