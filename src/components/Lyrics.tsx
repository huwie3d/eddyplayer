import React, { useRef, useEffect, useState } from 'react';
import { useLyrics } from '../hooks/useLyrics';
import { useSmoothTimer } from '../hooks/useSmoothTimer';
import { JLF } from '../types/lyrics';

interface LyricsProps {
  artistName?: string;
  trackName?: string;
  albumName?: string;
  duration: number;
  position: number;
  paused: boolean;
}

export default function getLyricStatus(
  currentTime: number,
  lyricStart: number,
  lyricEnd: number,
  offset: number = 0,
) {
  // default offset (animations look weird without this)
  offset = offset + 0.1;

  // add the offset to the current time
  currentTime = Number((currentTime).toFixed(3)) + offset;

  // Check if the lyric is active
  let isActive = currentTime > lyricStart && currentTime < lyricEnd;
  // Initialize variables for percentage and elapsed seconds
  let percentage = 0;
  let secondsAfterActive = 0;

  if (isActive) {
    let duration = lyricEnd - lyricStart;
    secondsAfterActive = currentTime - lyricStart;
    percentage = (secondsAfterActive / duration) * 100;
  } else if (currentTime > lyricEnd) {
    secondsAfterActive = currentTime - lyricEnd;
  }

  return {
    currentTimePlusOffset: currentTime,
    isActive: isActive,
    percentage: Number(percentage.toFixed(2)),
    secondsAfterActive: secondsAfterActive,
    secondsBeforeActive: lyricStart - currentTime,
  };
}

export function BasicLyrics({
  lyrics,
  currentTime,
}: {
  lyrics: JLF | null;
  currentTime: number;
}) {
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  // for instant scroll on first load
  const [hasJustLoaded, setHasJustLoaded] = useState(false);

  useEffect(() => {
    // is width > 1024px
    let isMd = window.innerWidth > 1024;
    const timer = setTimeout(() => {
      if (activeLyricRef.current) {
        activeLyricRef.current.scrollIntoView({
          // if we are after the first three seconds and we've just loaded, we want to scroll instantly no matter device size
          behavior: isMd && (hasJustLoaded && currentTime * 1000 > 3) ? "smooth" : "instant",
          block: "center",
        });
        if (!hasJustLoaded) {
          setHasJustLoaded(true);
        }
      }
    }, 250); // Use timeout instead of interval
    return () => clearTimeout(timer);
  }, [activeLyricRef.current]);

  if (lyrics == null) {
    return null;
  }

  const lines = lyrics.lines;

  return (
    <div className="flex flex-col hide-scrollbar w-full">
      {/* if we are in the first like three seconds and no line is active, we set ref to this to scroll up */}
      <div ref={currentTime * 1000 < 5 && currentTime < lines.lines[0]?.time ? activeLyricRef : null} />
      {lyrics?.lines.lines.map((line, i) => {
        const segStatus = getLyricStatus(
          currentTime * 1000,
          line.time,
          lines.lines[i + 1]?.time ?? lines.linesEnd,
          0//1000
        );
        return (
          <div
            key={String(i) + line.text}
            className={`w-full max-w-full transition-transform bg-transparent duration-0 mb-2 md:mb-4 py-2 text-left origin-left text-3xl lg:text-5xl ${
              segStatus.isActive ? "scale-100 text-white" : "scale-90 text-white/60"
            } lg:transition-all lg:duration-500 ease-in-out`}
          >
            <div
              ref={
                segStatus.secondsBeforeActive < 500 && segStatus.secondsBeforeActive > 0 || segStatus.isActive && segStatus.percentage < 50
                  ? activeLyricRef
                  : null
              }
              className={`top-[12vh] h-4 w-4 absolute rounded-full`}
            />
            {line.text || "· · ·"}
          </div>
        );
      })}
    </div>
  );
}

export function Lyrics({ artistName, trackName, albumName, duration, position, paused }: LyricsProps) {
  const { lyrics, isLoading, error } = useLyrics(artistName, trackName, albumName, duration);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { currentTime } = useSmoothTimer({
    duration: duration,
    currentTime: position,
    throttleBy: 250,
    isActivelyPlaying: !paused,
  });

  if(isLoading) {
    return (
      <div className="text-white/60 animate-pulse">
        Loading lyrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white/60">
        No lyrics found!
      </div>
    );
  }


  // get the type of lyrics. is it jlf or parsed lyrics
  return (
    <div className="text-white">
      <h2 className="fixed text-xl font-semibold">Lyrics</h2>
      <div
        ref={scrollContainerRef}
        className="space-y-4 overflow-y-auto max-h-[30rem] pr-4 -mb-10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{
          maskImage: `linear-gradient(to bottom, transparent 2rem, black 4rem, black 93%, transparent 97%)`,
          maskComposite: 'intersect',
        }}
      >
        <div className="h-12"></div>
        {lyrics && (lyrics as JLF).lines !== undefined ? (
          <BasicLyrics lyrics={lyrics as JLF} currentTime={currentTime} />
        ) : (
          <div className="text-white/60">
            No lyrics found
          </div>
        )}
        <div className="h-24"></div>
      </div>
    </div>
  )
}