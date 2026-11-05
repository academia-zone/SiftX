export interface TTSRequest {
  text: string;
  lang?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface TTSChunkResult {
  audioUrl: string;
  blob?: Blob;
}

/**
 * Splits text into natural sentence boundary chunks (<220 chars) for smooth streaming.
 */
export function chunkText(text: string, maxLen = 220): string[] {
  const parts = text
    .split(/([!۔؟?.\n]+)/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !/^[!۔؟?.\n]+$/.test(p));

  if (parts.length === 0) return [text.trim()];

  const chunks: string[] = [];
  let current = '';

  for (const part of parts) {
    if ((current + ' ' + part).length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      current = part;
    } else {
      current = current ? current + ' ' + part : part;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.trim()];
}

export function isUrduOrArabicScript(str: string): boolean {
  return /[\u0600-\u06FF]/.test(str);
}

/**
 * Synthesizes text to speech using production-compatible endpoint with client fallback.
 */
export async function synthesizeTTS(req: TTSRequest): Promise<string> {
  const { text, lang = 'ur', voice = 'uzma' } = req;
  const targetLang = isUrduOrArabicScript(text) && lang !== 'ar' ? 'ur' : lang;

  const url = `/api/tts?q=${encodeURIComponent(text.slice(0, 500))}&voice=${encodeURIComponent(voice)}&tl=${encodeURIComponent(targetLang)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`TTS server responded with ${res.status}`);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn("Direct /api/tts endpoint failed, utilizing client-side speech synthesis:", err);
    return synthesizeClientSpeech(text, targetLang, req.rate, req.pitch);
  }
}

/**
 * Fallback synthesizer that generates a client-side audio playback via Web Speech.
 */
function synthesizeClientSpeech(text: string, lang: string, rate = 1.0, pitch = 1.0): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve('');
      return;
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ur' ? 'ur-PK' : lang;
    u.rate = rate;
    u.pitch = pitch;

    u.onend = () => resolve('');
    u.onerror = () => resolve('');

    window.speechSynthesis.speak(u);
    resolve('client-speaking');
  });
}
