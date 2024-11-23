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
        className="w-64 h-64 min-w-64 rounded-lg shadow-2xl"
      />
    </div>
  );
}
