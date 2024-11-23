import React, { useEffect } from 'react';
import { ScrollingText } from './scrollText';

interface TrackInfoProps {
  title: string;
  artists: [
    {
      name: string;
    }
  ];
  artistArt: string | null;
  albumTitle: string;
}

export function TrackInfo({
  title,
  artists,
  artistArt,
  albumTitle,
}: TrackInfoProps) {
  useEffect(() => {
    document.title = "Eddy - " + title;
    }, [title]);
  return (
    <div className="md:mb-4">
      <ScrollingText text={title} className="text-3xl font-bold truncate w-full max-w-xs md:max-w-sm" />
      <div className="flex text-xl items-center text-neutral-300 gap-3">
        {artistArt && (
          <img
            src={artistArt}
            alt={artists[0].name}
            className="w-8 h-8 rounded-full"
          />
        )}
        {artists.map((a) => a.name).join(', ')}
      </div>
      <ScrollingText text={albumTitle} className="text-xl truncate text-neutral-300 max-w-xs md:max-w-sm" />
    </div>
  );
}
