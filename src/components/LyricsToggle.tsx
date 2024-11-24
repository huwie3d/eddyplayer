import React from 'react';
import { FileText } from 'lucide-react';

interface LyricsToggleProps {
  showLyrics: boolean;
  onToggle: () => void;
}

export function LyricsToggle({ showLyrics, onToggle }: LyricsToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-4 left-4 p-2 rounded-full transition-colors ${
        showLyrics 
          ? 'bg-white/20 hover:bg-white/30' 
          : 'bg-white/10 hover:bg-white/20'
      }`}
      title={showLyrics ? 'Hide lyrics' : 'Show lyrics'}
    >
      <FileText className="w-5 h-5 text-white/60" />
    </button>
  );
}