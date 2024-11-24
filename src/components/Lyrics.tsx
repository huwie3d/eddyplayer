import React, { useRef, useEffect } from 'react';
import { useLyrics } from '../hooks/useLyrics';
import { useSmoothTimer } from '../hooks/useSmoothTimer';

interface LyricsProps {
  artistName?: string;
  trackName?: string;
  albumName?: string;
  duration: number;
  position: number;
  paused: boolean;
}

export function Lyrics({ artistName, trackName, albumName, duration, position, paused }: LyricsProps) {
  const { lyrics, isLoading, error } = useLyrics(artistName, trackName, albumName, duration);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { currentTime } = useSmoothTimer({
    duration: duration,
    currentTime: position,
    isActivelyPlaying: !paused,
  });

  // Find the current lyric based on timestamp
  const currentIndex = lyrics.findIndex((lyric, index) => {
    const nextLyric = lyrics[index + 1];
    return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
  });

  // Auto-scroll effect
  useEffect(() => {
    if (currentIndex >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const lyricElements = container.getElementsByTagName('p');
      
      if (lyricElements[currentIndex]) {
        const lyricElement = lyricElements[currentIndex];
        const containerHeight = container.clientHeight;
        const lyricPosition = lyricElement.offsetTop;
        const targetScroll = lyricPosition - containerHeight / 2;

        container.scrollTo({
          top: targetScroll,
          behavior: paused ? 'auto' : 'smooth'
        });
      }
    }
  }, [currentIndex, paused]);

  if (isLoading) {
    return (
      <div className="text-white/60 animate-pulse">
        Loading lyrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white/60">
        No lyrics found
      </div>
    );
  }

  if (!lyrics.length) {
    return (
      <div className="text-white/60">
        No lyrics available
      </div>
    );
  }

  return (
    <div className="text-white">
      <h2 className="fixed text-xl font-semibold">Lyrics</h2>
      <div 
        ref={scrollContainerRef}
        className="space-y-4 overflow-y-auto max-h-[30rem] pr-4 -mb-10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                  style={{
            maskImage: `linear-gradient(to bottom, transparent 2rem, black 4rem, black 93%, transparent 97%)`,
            maskComposite: "intersect",
          }}
      >
        <div className="mt-12"></div>
        {lyrics.map((line, index) => (
          <p
            key={index}
            className={`text-4xl transition-all duration-300 origin-left ${
              index === currentIndex ? 'text-white scale-100' : 'text-white/60 scale-90'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}