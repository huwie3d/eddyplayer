import { useState, useEffect } from 'react';

interface LRCLibResponse {
  id: number;
  name: string;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
}

interface ParsedLyric {
  time: number;
  text: string;
}

function parseLRC(lrc: string): ParsedLyric[] {
  const lines = lrc.split('\n');
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
  
  return lines
    .map(line => {
      const match = timeRegex.exec(line);
      if (!match) return null;
      
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + centiseconds / 100;
      const text = line.replace(timeRegex, '').trim();
      
      return { time, text };
    })
    .filter((line): line is ParsedLyric => line !== null && line.text !== '');
}

export function useLyrics(artistName?: string, trackName?: string, albumName?: string, duration?: number) {
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistName || !trackName) {
      setLyrics([]);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          artist_name: artistName,
          track_name: trackName,
          ...(albumName && { album_name: albumName }),
          ...(duration && { duration: duration.toString() })
        });

        const response = await fetch(`https://lrclib.net/api/get?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch lyrics');
        }

        const data: LRCLibResponse = await response.json();
        
        if (data.syncedLyrics) {
          const parsedLyrics = parseLRC(data.syncedLyrics);
          setLyrics(parsedLyrics);
        } else if (data.plainLyrics) {
          // If no synced lyrics, create simple time-less entries
          const lines = data.plainLyrics.split('\n');
          setLyrics(lines.map((text, i) => ({ time: i, text })));
        } else {
          setLyrics([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lyrics');
        setLyrics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [artistName, trackName, albumName, duration]);

  return { lyrics, isLoading, error };
}