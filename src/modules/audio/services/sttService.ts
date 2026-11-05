/**
 * Speech to Text service supporting live microphone recognition
 * and pre-recorded audio file transcription powered by Groq Whisper.
 */

export interface STTResult {
  transcript: string;
  confidence?: number;
  durationSeconds?: number;
  language?: string;
  model?: string;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function createSpeechRecognizer(
  lang: string,
  onResult: (finalText: string, interimText: string) => void,
  onError: (err: any) => void,
  onEnd: () => void
): any {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = 0; i < event.results.length; i++) {
      const item = event.results[i];
      if (item && item[0]) {
        if (item.isFinal) {
          finalTranscript += item[0].transcript + ' ';
        } else {
          interimTranscript += item[0].transcript + ' ';
        }
      }
    }

    onResult(finalTranscript.trim(), interimTranscript.trim());
  };

  recognition.onerror = onError;
  recognition.onend = onEnd;

  return recognition;
}

/**
 * Transcribes an uploaded audio file using the secure backend Groq Whisper endpoint (/api/stt).
 */
export async function transcribeAudioFile(file: File, lang = 'en'): Promise<STTResult> {
  const arrayBuffer = await file.arrayBuffer();

  const res = await fetch('/api/stt', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'audio/wav',
      'x-filename': encodeURIComponent(file.name),
      'x-lang': lang,
    },
    body: arrayBuffer,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Transcription failed with HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    transcript: data.transcript || '',
    durationSeconds: data.duration,
    language: data.language,
    model: data.model || 'whisper-large-v3-turbo',
    confidence: 0.98,
  };
}
