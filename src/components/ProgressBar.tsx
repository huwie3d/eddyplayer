import React from "react";
import { useSmoothTimer } from "../hooks/useSmoothTimer";

interface ProgressBarProps {
  progress: number;
  position: number;
  duration: number;
  paused: boolean;
}

export function ProgressBar({ position, duration, paused }: ProgressBarProps) {
  const { currentTime } = useSmoothTimer({
    duration: duration,
    currentTime: position,
    throttleBy: 250,
    isActivelyPlaying: !paused,
  });

  const progress = (currentTime / duration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full"
          style={{
            width: `${progress}%`,
            transition: paused ? "none" : "width 0.1s linear",
          }}
        />
      </div>
      <div className="flex justify-between text-sm text-white/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
