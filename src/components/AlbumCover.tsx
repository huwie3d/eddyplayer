import React from 'react';

interface AlbumCoverProps {
  albumArt: string;
  albumTitle: string;
  artistArt: string | null;
}

export function AlbumCover({ albumArt, albumTitle, artistArt }: AlbumCoverProps) {
  return (
    <div className="relative aspect-square object-contain md:w-72 md:h-72 min-w-72">
      <img
        src={albumArt}
        alt={albumTitle}
        className="rounded-xl object-contain shadow-2xl border border-neutral-500/30"
      />
              {artistArt && (
          <img
            src={artistArt}
            alt="Artist image"
            className="absolute opacity-80 border border-neutral-500/50 bottom-2 right-2 h-16 w-16 rounded-full shadow-lg"
          />
        )}
    </div>
  );
}
