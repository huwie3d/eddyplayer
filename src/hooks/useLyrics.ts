import { useState, useEffect } from "react";
import { JLF, SyncedLines, SyncedMetadata } from "../types/lyrics";

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

export interface ParsedLyric {
  time: number;
  text: string;
}

export function lrcToJlf(
  lrcContent: string,
  metadata: SyncedMetadata,
  source = "LRCLib",
): JLF {
  const lines = lrcContent.split("\n");
  const syncedLines: SyncedLines = {
    lines: [],
    linesEnd: 0,
  };

  lines.forEach((line) => {
    const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2})\]/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseFloat(timeMatch[2]);
      const timeInMs = (minutes * 60 + seconds) * 1000;
      const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, "").trim();

      syncedLines.lines.push({ time: timeInMs, text });
      syncedLines.linesEnd = Math.max(syncedLines.linesEnd, timeInMs);
    }
  });

  return {
    lines: syncedLines,
    source: source,
    metadata: metadata,
  };
}

async function fetchLRCLib(
  artistName: string,
  trackName: string,
  albumName?: string,
  duration?: number,
): Promise<JLF> {
  const params = new URLSearchParams({
    artist_name: artistName,
    track_name: trackName,
    ...(albumName && { album_name: albumName }),
    ...(duration && { duration: duration.toString() }),
  });

  const response = await fetch(`https://lrclib.net/api/get?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch lyrics from LRCLib");
  }

  const data: LRCLibResponse = await response.json();

  if (data.syncedLyrics) {
    return lrcToJlf(data.syncedLyrics, {
      Album: data.albumName,
      Artist: data.artistName,
      Title: data.trackName,
    });
  } else {
    throw new Error("Failed to fetch synced lyrics from LRCLib");
  }
}

// Fetch lyrics from Umi
// https://umi.bna.lut.li/lyrics?track=Favor&artist=Julien%20Baker&album=Little%20Oblivions
async function fetchUMI(
  artistName: string,
  trackName: string,
  albumName?: string,
): Promise<JLF> {
  const params = new URLSearchParams({
    artist: artistName,
    track: trackName,
    ...(albumName && { album: albumName }),
  });

  const response = await fetch(`https://umi.bna.lut.li/lyrics?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch lyrics from Umi");
  }

  const data: JLF = await response.json();

  return data;
}

export function useLyrics(
  artistName?: string,
  trackName?: string,
  albumName?: string,
  duration?: number,
) {
  const [lyrics, setLyrics] = useState<JLF | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistName || !trackName) {
      setLyrics(null);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try umi first
        const umiLyrics = await fetchUMI(artistName, trackName);
        console.log("Is richsync?", umiLyrics.richsync);
        setLyrics(umiLyrics);

        if (umiLyrics.richsync) return;
        try {
          const lrcLibLyrics = await fetchLRCLib(
            artistName,
            trackName,
            albumName,
            duration,
          );
          if (lrcLibLyrics && (lrcLibLyrics as JLF).lines?.lines?.length > 0) {
            setLyrics(lrcLibLyrics);
            return;
          }
        } catch (error) {
          // If both sources fail, use whatever LRCLib returned (even if empty)
          console.error("Failed to fetch from LRCLib and Umi:", error);
          setLyrics(umiLyrics);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch lyrics");
        setLyrics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [artistName, trackName, albumName, duration]);

  return { lyrics, isLoading, error };
}
