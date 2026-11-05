import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAudioTheme } from './AudioThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useAudioTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
        theme === 'dark'
          ? 'bg-slate-800/80 text-amber-300 border-slate-700 hover:bg-slate-700 hover:text-amber-200'
          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-black'
      } ${className}`}
      title={`Current: ${theme} mode (Click to toggle)`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
