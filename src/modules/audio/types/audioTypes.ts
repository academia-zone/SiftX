export type AudioStudioRoute = 
  | '/audio'
  | '/audio/text-to-speech'
  | '/audio/speech-to-text'
  | '/audio/voice-changer'
  | '/audio/ai-voice-generator';

export type AudioTheme = 'light' | 'dark';

export interface AudioToolMeta {
  id: string;
  route: AudioStudioRoute;
  name: string;
  nameUrdu: string;
  tagline: string;
  description: string;
  iconName: string;
  badge: string;
  highlights: string[];
}

export interface VoicePersona {
  id: string;
  name: string;
  gender: 'male' | 'female';
  tone: string;
  role: string;
  lang: string;
  pitchMultiplier: number;
  rateMultiplier: number;
  previewSample: string;
}

export interface VoiceEffect {
  id: 'clean' | 'documentary' | 'robot' | 'chipmunk' | 'deep' | 'radio' | 'echo';
  name: string;
  emoji: string;
  desc: string;
  tag: string;
}
