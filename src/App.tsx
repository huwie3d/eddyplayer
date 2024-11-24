import React, { useEffect, useState } from 'react';
import { AlbumCover } from './components/AlbumCover';
import { TrackInfo } from './components/TrackInfo';
import { ProgressBar } from './components/ProgressBar';
import { ConfigMenu } from './components/ConfigMenu';
import { Lyrics } from './components/Lyrics';
import { useConfig } from './hooks/useConfig';
import { useAlbumColors } from './hooks/useAlbumColors';
import MeshBg from './components/MeshBg';
import { LyricsToggle } from './components/LyricsToggle';

interface NowPlayingResponse {
  item: {
    title: string;
    artists: [
      {
        name: string;
      }
    ];
    album: {
      title: string;
      vibrantColor: string;
    };
    duration: number;
  };
  position: number;
  albumArt: string;
  artistArt: string;
  paused: boolean;
}

function App() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const { config, isConfigured, updateConfig } = useConfig();
  const { colors } = useAlbumColors(nowPlaying?.albumArt || '');

  useEffect(() => {
    if (!isConfigured) return;

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/now-playing`, {
          headers: {
            Authorization: config.apiKey,
          },
        });
        const data = await response.json();
        setNowPlaying(data);
      } catch (error) {
        console.error('Failed to fetch now playing:', error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 3000);
    return () => clearInterval(interval);
  }, [config, isConfigured]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-black/30 backdrop-blur-xl rounded-xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6">
            Get started with EddyPlayer
          </h1>
          <p className="text-white/70 mb-8">
            Please configure your API settings to continue.
          </p>
          <ConfigMenu
            onSave={updateConfig}
            currentApiUrl={config.apiUrl}
            currentApiKey={config.apiKey}
          />
        </div>
      </div>
    );
  }

  if (!nowPlaying) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
        <ConfigMenu
          onSave={updateConfig}
          currentApiUrl={config.apiUrl}
          currentApiKey={config.apiKey}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-all duration-1000 relative overflow-hidden">
      <MeshBg colors={colors} />
      <div className="absolute inset-0 backdrop-blur-3xl opacity-30" />

      <ConfigMenu
        onSave={updateConfig}
        currentApiUrl={config.apiUrl}
        currentApiKey={config.apiKey}
      />

      <LyricsToggle showLyrics={showLyrics} onToggle={() => setShowLyrics(!showLyrics)} />

      <div className={`md:w-full ${showLyrics ? 'md:max-w-6xl' : 'md:max-w-3xl'} bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300`}>
        <div className={`flex flex-col md:flex-row min-w-full gap-8 flex-col-reverse`}>
          <div className={`flex flex-col ${showLyrics ? "" : "md:flex-row"} items-center justify-center gap-8`}>
            <div className={showLyrics ? "hidden md:block" : ""}>
              <AlbumCover
                albumArt={nowPlaying.albumArt}
                albumTitle={nowPlaying.item.album.title}
                artistArt={nowPlaying.artistArt}
              />
            </div>
            <div className="flex-1 flex flex-col text-white space-y-6 w-screen max-w-xs md:max-w-sm">
              <TrackInfo
                title={nowPlaying.item.title}
                artists={nowPlaying.item.artists}
                albumTitle={nowPlaying.item.album.title}
              />
              <ProgressBar
                progress={(nowPlaying.position / nowPlaying.item.duration) * 100}
                position={nowPlaying.position}
                duration={nowPlaying.item.duration}
                paused={nowPlaying.paused}
              />
            </div>
          </div>
          {showLyrics && (
            <div className="flex-1 lg:border-l lg:border-white/10 lg:pl-8">
              <Lyrics
                artistName={nowPlaying.item.artists[0].name}
                trackName={nowPlaying.item.title}
                albumName={nowPlaying.item.album.title}
                duration={nowPlaying.item.duration}
                position={nowPlaying.position}
                paused={nowPlaying.paused}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;