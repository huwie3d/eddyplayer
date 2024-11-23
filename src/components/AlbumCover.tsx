import React from 'react';

interface AlbumCoverProps {
  albumArt: string;
  albumTitle: string;
  artistArt: string | null;
}

export function AlbumCover({ albumArt, albumTitle, artistArt }: AlbumCoverProps) {
  return (
    <div className="relative">
      <img
        src={albumArt}
        alt={albumTitle}
        className="w-72 h-72 min-w-72 rounded-lg shadow-2xl"
      />
              {artistArt && (
          <img
            src={artistArt}
            alt="Artist image"
            className="absolute opacity-80 border border-neutral-500/80 bottom-2 right-2 h-16 w-16 rounded-full shadow-lg"
          />
        )}
    </div>
  );
}
