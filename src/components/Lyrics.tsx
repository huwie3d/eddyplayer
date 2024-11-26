import { useRef, useEffect, useState } from "react";
import { useLyrics } from "../hooks/useLyrics";
import { useSmoothTimer } from "../hooks/useSmoothTimer";
import { JLF } from "../types/lyrics";

interface LyricsProps {
  artistName?: string;
  trackName?: string;
  albumName?: string;
  duration: number;
  position: number;
  paused: boolean;
  isFullPage: boolean;
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
  currentTime = Number(currentTime.toFixed(3)) + offset;

  // Check if the lyric is active
  const isActive = currentTime > lyricStart && currentTime < lyricEnd;
  // Initialize variables for percentage and elapsed seconds
  let percentage = 0;
  let secondsAfterActive = 0;

  if (isActive) {
    const duration = lyricEnd - lyricStart;
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
  isFullPage,
}: {
  lyrics: JLF | null;
  currentTime: number;
  isFullPage: boolean;
}) {
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  // for instant scroll on first load
  const [hasJustLoaded, setHasJustLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeLyricRef.current) {
        activeLyricRef.current.scrollIntoView({
          // if we are after the first three seconds and we've just loaded, we want to scroll instantly no matter device size
          //behavior: isMd && (hasJustLoaded && currentTime * 1000 > 3) ? "smooth" : "instant",
          behavior:
            hasJustLoaded && currentTime * 1000 > 3 ? "smooth" : "instant",
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
      <div
        ref={
          currentTime * 1000 > 5 && currentTime < lines.lines[0]?.time
            ? activeLyricRef
            : null
        }
      />
      {lyrics?.lines.lines.map((line, i) => {
        const segStatus = getLyricStatus(
          currentTime * 1000,
          line.time,
          lines.lines[i + 1]?.time ?? lines.linesEnd,
          500, //1000
        );
        return (
          <div
            key={String(i) + line.text}
            className={`w-full max-w-full transition-transform bg-transparent duration-0 mb-6 md:mb-8 pl-2 text-left origin-left font-semibold text-4xl lg:text-5xl ${
              segStatus.isActive
                ? "scale-100 text-white"
                : "scale-90 text-white/60"
            } ${isFullPage ? "xl:text-6xl mb-6 md:mb-8 lg:mb-10 xl:mb-12" : " mb-6 md:mb-8"} lg:transition-all lg:duration-500 ease-in-out`}
          >
            <div
              ref={
                (segStatus.secondsBeforeActive < 500 &&
                  segStatus.secondsBeforeActive > 0) ||
                (segStatus.isActive && segStatus.percentage < 50)
                  ? activeLyricRef
                  : null
              }
              className={`top-[20vh] md:top-[10.2vh] h-4 w-4 absolute rounded-full`}
            />
            {line.text || "· · ·"}
          </div>
        );
      })}
    </div>
  );
}

export function Lyrics({
  artistName,
  trackName,
  albumName,
  duration,
  position,
  paused,
  isFullPage,
}: LyricsProps) {
  const { lyrics, isLoading, error } = useLyrics(
    artistName,
    trackName,
    albumName,
    duration,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { currentTime } = useSmoothTimer({
    duration: duration,
    currentTime: position,
    throttleBy: 250,
    isActivelyPlaying: !paused,
  });

  if (isLoading) {
    return (
      <div className="flex-1 h-full relative text-white -mx-8 px-4 md:px-8 min-h-max">
        <div
          className={`h-screen max-h-[88vh] ${isFullPage ? "md:max-h-[76vh]" : "md:max-h-[calc(33.5rem)] -mb-36"}`}
        >
          <h2 className="absolute top-8 text-xl font-semibold hidden md:block">
            Lyrics
          </h2>
          <div className="text-white/60 text-6xl pt-16">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-full relative text-white -mx-8 px-4 md:px-8 min-h-max">
        <div
          className={`h-screen max-h-[88vh] ${isFullPage ? "md:max-h-[76vh]" : "md:max-h-[calc(33.5rem)] -mb-36"}`}
        >
          <h2 className="absolute top-8 text-xl font-semibold hidden md:block">
            Lyrics
          </h2>
          <div className="text-white/60 text-6xl pt-16">No lyrics found</div>
        </div>
      </div>
    );
  }

  const lessThanMd = window.innerWidth < 1024;

  // get the type of lyrics. is it jlf or parsed lyrics
  return (
    <div className="flex-1 h-full relative text-white -mx-8 px-4 md:px-8 min-h-max">
      <h2 className="z-10 absolute top-8 text-xl font-semibold hidden md:block">
        Lyrics
      </h2>
      <div className="blur-vignette" />
      <div
        ref={scrollContainerRef}
        className={`hide-scrollbar space-y-4 overflow-y-auto -ml-1 md:ml-0 max-h-[88vh] ${isFullPage ? "md:max-h-[76vh]" : "md:max-h-[calc(33.5rem)] -mb-36 md:mb-0"} pr-4`}
        style={{
          maskImage: `linear-gradient(to bottom, transparent 0rem, black 8rem, black 50%, #000${lessThanMd ? "1" : "3"} 85%, transparent 98%)`,
          maskComposite: "intersect",
        }}
      >
        <div className="h-[12rem]"></div>
        {lyrics && (lyrics as JLF).lines !== undefined ? (
          <BasicLyrics
            lyrics={lyrics as JLF}
            currentTime={currentTime}
            isFullPage={isFullPage}
          />
        ) : lyrics && (lyrics as any[]).length !== 0 ? (
          <div className="text-white/60 text-6xl">
            No support for this format yet!
          </div>
        ) : (
          <div className="text-white/80 text-6xl">Instrumental</div>
        )}
        <div className="h-screen"></div>
      </div>
    </div>
  );
}
