import type { TypingSession, ShareData } from '@/types';

const MAX_EVENTS = 120;

export function encodeSession(session: TypingSession): string {
  const data: ShareData = {
    events: session.events.slice(-MAX_EVENTS).map((e) => ({
      k: e.key,
      t: e.timestamp - session.startTime,
      i: Math.round(e.intervalMs),
      s: e.isSpecial,
      u: e.isUpperCase,
    })),
    text: session.text.slice(0, 500),
    startTime: 0,
  };

  const json = JSON.stringify(data);
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, 'utf-8').toString('base64');
}

export function decodeSession(encoded: string): TypingSession | null {
  if (!encoded || encoded.length > 16000) return null;
  try {
    let json: string;
    if (typeof window !== 'undefined') {
      json = decodeURIComponent(escape(atob(encoded)));
    } else {
      json = Buffer.from(encoded, 'base64').toString('utf-8');
    }

    const raw: unknown = JSON.parse(json);

    // Runtime validation — reject malformed payloads
    if (!raw || typeof raw !== 'object') return null;
    const obj = raw as Record<string, unknown>;
    if (!Array.isArray(obj.events) || typeof obj.text !== 'string') return null;
    if (obj.events.length > MAX_EVENTS) return null;

    const text = obj.text.slice(0, 500);
    const events = obj.events.filter(
      (e): e is { k: string; t: number; i: number; s: boolean; u: boolean } =>
        e !== null &&
        typeof e === 'object' &&
        typeof (e as Record<string, unknown>).k === 'string' &&
        typeof (e as Record<string, unknown>).t === 'number' &&
        typeof (e as Record<string, unknown>).i === 'number' &&
        typeof (e as Record<string, unknown>).s === 'boolean' &&
        typeof (e as Record<string, unknown>).u === 'boolean' &&
        ((e as Record<string, unknown>).k as string).length <= 20
    );

    const startTime = Date.now();

    return {
      startTime,
      text,
      events: events.map((e) => ({
        key: e.k,
        timestamp: startTime + e.t,
        intervalMs: Math.max(0, Math.min(e.i, 5000)),
        isSpecial: e.s,
        isUpperCase: e.u,
        charCode: e.k.charCodeAt(0) || 0,
      })),
    };
  } catch {
    return null;
  }
}
