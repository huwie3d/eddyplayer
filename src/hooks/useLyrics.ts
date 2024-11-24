import { useState, useEffect } from 'react';
import { JLF, SyncedLines, SyncedMetadata } from '../types/lyrics';

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

export default function lrcToJlf(lrcContent: string, metadata: SyncedMetadata, source = "LRCLib") {
  const lines = lrcContent.split('\n');
  const syncedLines: SyncedLines = {
      lines: [],
      linesEnd: 0,
  };

  // Process each line in the LRC
  lines.forEach(line => {
      const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2})\]/); // Matches [mm:ss.xx]
      if (timeMatch) {
          const minutes = parseInt(timeMatch[1], 10);
          const seconds = parseFloat(timeMatch[2]);
          const timeInMs = (minutes * 60 + seconds) * 1000; // Convert to milliseconds
          
          const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, '').trim(); // Remove timestamp

          // Add the synced line to the array
          syncedLines.lines.push({
              time: timeInMs,
              text: text,
          });

          // Update linesEnd if this is the last line
          syncedLines.linesEnd = Math.max(syncedLines.linesEnd, timeInMs);
      }
  });

  // Construct the JLF object
  const jlf: JLF = {
      lines: syncedLines,
      source: source,
      metadata: metadata
  };

  return jlf;
}

export function useLyrics(artistName?: string, trackName?: string, albumName?: string, duration?: number) {
  const [lyrics, setLyrics] = useState<JLF|ParsedLyric[]>([]);
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
          const parsedLyrics = lrcToJlf(data.syncedLyrics, {
            Album: data.albumName,
            Artist: data.artistName,
            Title: data.trackName,
          });
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