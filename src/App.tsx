import React, { useEffect, useState } from 'react';
import { AlbumCover } from './components/AlbumCover';
import { TrackInfo } from './components/TrackInfo';
import { ProgressBar } from './components/ProgressBar';
import { ConfigMenu } from './components/ConfigMenu';
import { useConfig } from './hooks/useConfig';
import { useAlbumColors } from './hooks/useAlbumColors';
import useBreathe from './hooks/useBreathe';

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
  const { config, isConfigured, updateConfig } = useConfig();
  const { colors } = useAlbumColors(nowPlaying?.albumArt || '');

  const breatheTR = useBreathe({
    initialValue: 90,
    interval: 83000,
    maxValue: 90,
    minValue: 90,
  });

  const breatheBR = useBreathe({
    initialValue: 20,
    interval: 900,
    maxValue: 40,
    minValue: 20,
  });

  const breatheBL = useBreathe({
    initialValue: 20,
    interval: 600,
    maxValue: 70,
    minValue: 20,
  });

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

  const [
    primaryColor,
    secondaryColor,
    tertiaryColor,
    quaternaryColor,
    quinaryColor,
  ] = colors;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-all duration-1000 relative overflow-hidden">
      {/* Base gradient layer */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundColor: `${primaryColor}`,
          backgroundImage: `
          radial-gradient(at 40% 20%, ${primaryColor} 0px, transparent 50%),
radial-gradient(at 80% 0%, color-mix(in srgb,${secondaryColor}, ${primaryColor} ${breatheTR}%) 0px, transparent 50%),
radial-gradient(at 0% ${breatheBL / 10 + 50}%, ${tertiaryColor}aa 0px, transparent 50%),
radial-gradient(at 80% 50%, ${primaryColor} 0px, transparent 50%),
radial-gradient(at 0% 100%, color-mix(in srgb,${quinaryColor}, ${tertiaryColor} ${breatheBL}%) 0px, transparent 50%),
radial-gradient(at 80% 100%, color-mix(in srgb,${quaternaryColor}, ${primaryColor} ${breatheBR}%)  0px, transparent 50%),
radial-gradient(at 0% 0%, ${primaryColor} 0px, transparent 50%)`,
        }}
      />

      {/* Soft blur overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-30" />

      <ConfigMenu
        onSave={updateConfig}
        currentApiUrl={config.apiUrl}
        currentApiKey={config.apiKey}
      />

      <div className="md:w-full md:max-w-3xl bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col md:flex-row min-w-full gap-8 items-center">
          <AlbumCover
            albumArt={nowPlaying.albumArt}
            albumTitle={nowPlaying.item.album.title}
          />
          <div className="flex-1 flex flex-col text-white space-y-6 h-40">
            <div className="flex flex-col flex-1 h-full min-h-full items-left justify-center">
            <TrackInfo
              title={nowPlaying.item.title}
              artists={nowPlaying.item.artists}
              artistArt={nowPlaying.artistArt}
              albumTitle={nowPlaying.item.album.title}
            />
            </div>
            <ProgressBar
              progress={(nowPlaying.position / nowPlaying.item.duration) * 100}
              position={nowPlaying.position}
              duration={nowPlaying.item.duration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
