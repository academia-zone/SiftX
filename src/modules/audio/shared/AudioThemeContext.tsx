import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AudioTheme } from '../types/audioTypes';

interface AudioThemeContextType {
  theme: AudioTheme;
  toggleTheme: () => void;
  setTheme: (theme: AudioTheme) => void;
}

const AudioThemeContext = createContext<AudioThemeContextType | undefined>(undefined);

export const AudioThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Permanently set to Clean Professional Light Mode per user preference
  const [, setThemeState] = useState<AudioTheme>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('siftx_audio_theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    // Keep clean light mode
    setThemeState('light');
  };

  const setTheme = (_t: AudioTheme) => {
    setThemeState('light');
  };

  return (
    <AudioThemeContext.Provider value={{ theme: 'light', toggleTheme, setTheme }}>
      <div className="light bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </div>
    </AudioThemeContext.Provider>
  );
};

export const useAudioTheme = (): AudioThemeContextType => {
  const context = useContext(AudioThemeContext);
  if (!context) {
    throw new Error('useAudioTheme must be used within an AudioThemeProvider');
  }
  return context;
};
