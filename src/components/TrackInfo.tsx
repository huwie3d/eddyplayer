import React from 'react';
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
  return (
    <div className="">
      <ScrollingText text={title} className="text-3xl font-bold truncate max-w-xs" />
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
      <ScrollingText text={albumTitle} className="text-xl truncate text-neutral-300 max-w-xs" />
    </div>
  );
}
