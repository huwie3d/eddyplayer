import React from 'react';

interface AlbumCoverProps {
  albumArt: string;
  albumTitle: string;
}

export function AlbumCover({ albumArt, albumTitle }: AlbumCoverProps) {
  return (
    <div className="relative">
      <img
        src={albumArt}
        alt={albumTitle}
        className="w-72 h-72 min-w-72 rounded-lg shadow-2xl"
      />
    </div>
  );
}
