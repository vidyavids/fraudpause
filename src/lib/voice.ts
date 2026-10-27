/**
 * Browser voice helpers for Door 1 push-to-talk input.
 * Recording is press-and-hold only — nothing listens continuously.
 */

/** Convert any recorded audio blob to 16-bit PCM mono 24kHz WAV (the ASR input). */
export async function blobToWav24kMono(blob: Blob): Promise<Blob | null> {
  try {
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor || typeof OfflineAudioContext === 'undefined') return null;
    const raw = await blob.arrayBuffer();
    const actx = new Ctor();
    let decoded: AudioBuffer;
    try {
      decoded = await actx.decodeAudioData(raw);
    } finally {
      await actx.close().catch(() => {});
    }
    if (!decoded.duration || !isFinite(decoded.duration)) return null;
    const rate = 24000;
    const offline = new OfflineAudioContext(
      1,
      Math.max(1, Math.ceil(decoded.duration * rate)),
      rate,
    );
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start();
    const rendered = await offline.startRendering();
    return encodeWavMono16(rendered);
  } catch {
    return null;
  }
}

function encodeWavMono16(buffer: AudioBuffer): Blob {
  const samples = buffer.getChannelData(0);
  const data = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) data.setUint8(offset + i, text.charCodeAt(i));
  };
  writeAscii(0, 'RIFF');
  data.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true); // PCM
  data.setUint16(22, 1, true); // mono
  data.setUint32(24, buffer.sampleRate, true);
  data.setUint32(28, buffer.sampleRate * 2, true);
  data.setUint16(32, 2, true);
  data.setUint16(34, 16, true);
  writeAscii(36, 'data');
  data.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    data.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([data.buffer], { type: 'audio/wav' });
}

/** Base64 (no data-URL prefix) for JSON transport to /api/transcribe. */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      const comma = url.indexOf(',');
      resolve(comma >= 0 ? url.slice(comma + 1) : '');
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

/** Minimal typing for the browser built-in SpeechRecognition (incl. webkit). */
export interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function getSpeechRecognitionCtor(): (new () => BrowserSpeechRecognition) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Speak a string aloud via the browser's built-in speech synthesis. */
export function speakText(text: string): boolean {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      return true;
    }
    synth.speak(new SpeechSynthesisUtterance(text));
    return true;
  } catch {
    return false;
  }
}
