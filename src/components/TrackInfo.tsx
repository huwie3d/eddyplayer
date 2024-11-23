import React from 'react';

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
      <h1 className="text-3xl font-bold truncate">{title}</h1>
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
      <p className="text-xl text-neutral-300">{albumTitle}</p>
    </div>
  );
}
