import type { NoteEvent } from '@/types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;

      // Reverb chain
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createReverbBuffer(this.ctx, 2.5);

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0.3;

      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.value = 0.7;

      this.masterGain.connect(this.dryGain);
      this.dryGain.connect(this.ctx.destination);

      this.masterGain.connect(this.convolver);
      this.convolver.connect(this.reverbGain);
      this.reverbGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private createReverbBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    return buffer;
  }

  async resume(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  playNote(note: NoteEvent): void {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    const now = ctx.currentTime;
    const durationSec = note.duration / 1000;

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.frequency, now);
    // Subtle pitch bend for expression
    osc.frequency.exponentialRampToValueAtTime(
      note.frequency * 0.99,
      now + durationSec
    );

    // Envelope (ADSR)
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(note.velocity, now + 0.01);
    env.gain.exponentialRampToValueAtTime(note.velocity * 0.6, now + durationSec * 0.3);
    env.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    // Reverb blend
    if (this.reverbGain && note.reverb > 0) {
      this.reverbGain.gain.setTargetAtTime(note.reverb * 0.5, now, 0.1);
    }
    if (this.dryGain) {
      this.dryGain.gain.setTargetAtTime(1 - note.reverb * 0.3, now, 0.1);
    }

    // Per-note reverb send (avoids mutating global reverbGain state)
    const wetGain = ctx.createGain();
    wetGain.gain.value = note.reverb * 0.4;
    const dryOut = ctx.createGain();
    dryOut.gain.value = 1 - note.reverb * 0.25;

    osc.connect(env);
    env.connect(dryOut);
    dryOut.connect(this.masterGain);

    if (this.convolver && note.reverb > 0) {
      env.connect(wetGain);
      wetGain.connect(this.convolver);
    }

    osc.start(now);
    osc.stop(now + durationSec + 0.05);

    // CRITICAL fix: disconnect nodes when oscillator ends to prevent memory leak
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
      dryOut.disconnect();
      wetGain.disconnect();
    };
  }

  setVolume(vol: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx!.currentTime, 0.05);
    }
  }

  destroy(): void {
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.convolver = null;
    this.reverbGain = null;
    this.dryGain = null;
  }
}
