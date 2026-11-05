import React, { useState, useEffect } from 'react';
import type { AudioStudioRoute } from './types/audioTypes';
import { AudioThemeProvider } from './shared/AudioThemeContext';
import { AudioStudioLayout } from './app/AudioStudioLayout';
import { AudioStudioRoutes } from './app/AudioStudioRoutes';

interface AudioStudioAppProps {
  onExitToMain: () => void;
  initialRoute?: AudioStudioRoute;
}

const VALID_ROUTES: AudioStudioRoute[] = [
  '/audio',
  '/audio/text-to-speech',
  '/audio/speech-to-text',
  '/audio/voice-changer',
  '/audio/ai-voice-generator',
];

export const AudioStudioApp: React.FC<AudioStudioAppProps> = ({
  onExitToMain,
  initialRoute,
}) => {
  // Determine starting route from browser pathname or prop
  const getStartingRoute = (): AudioStudioRoute => {
    if (initialRoute && VALID_ROUTES.includes(initialRoute)) {
      return initialRoute;
    }
    const path = window.location.pathname;
    if (VALID_ROUTES.includes(path as AudioStudioRoute)) {
      return path as AudioStudioRoute;
    }
    return '/audio';
  };

  const [currentRoute, setCurrentRoute] = useState<AudioStudioRoute>(getStartingRoute());

  // Listen for browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (VALID_ROUTES.includes(path as AudioStudioRoute)) {
        setCurrentRoute(path as AudioStudioRoute);
      } else if (path === '/' || path === '/tool-studio') {
        onExitToMain();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onExitToMain]);

  // Navigate handler that updates both React state and browser URL history
  const handleNavigate = (route: AudioStudioRoute) => {
    if (route !== currentRoute) {
      setCurrentRoute(route);
      window.history.pushState(null, '', route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExit = () => {
    window.history.pushState(null, '', '/');
    onExitToMain();
  };

  return (
    <AudioThemeProvider>
      <AudioStudioLayout
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onExitToMain={handleExit}
      >
        <AudioStudioRoutes
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
        />
      </AudioStudioLayout>
    </AudioThemeProvider>
  );
};
