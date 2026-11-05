import React from 'react';
import type { AudioStudioRoute } from '../types/audioTypes';
import { AudioDashboard } from '../dashboard/AudioDashboard';
import { TextToSpeechPage } from '../tools/text-to-speech/TextToSpeechPage';
import { SpeechToTextPage } from '../tools/speech-to-text/SpeechToTextPage';
import { VoiceChangerPage } from '../tools/voice-changer/VoiceChangerPage';
import { AIVoiceGeneratorPage } from '../tools/ai-voice-generator/AIVoiceGeneratorPage';

interface AudioStudioRoutesProps {
  currentRoute: AudioStudioRoute;
  onNavigate: (route: AudioStudioRoute) => void;
}

export const AudioStudioRoutes: React.FC<AudioStudioRoutesProps> = ({
  currentRoute,
  onNavigate,
}) => {
  switch (currentRoute) {
    case '/audio/text-to-speech':
      return <TextToSpeechPage onNavigate={onNavigate} />;
    case '/audio/speech-to-text':
      return <SpeechToTextPage onNavigate={onNavigate} />;
    case '/audio/voice-changer':
      return <VoiceChangerPage />;
    case '/audio/ai-voice-generator':
      return <AIVoiceGeneratorPage />;
    case '/audio':
    default:
      return <AudioDashboard onNavigate={onNavigate} />;
  }
};
