import { useState, useEffect, useRef } from 'react';
import ColorThief from 'color-thief-ts';

type RGB = [number, number, number];
type ColorState = {
  current: RGB[];
  target: RGB[];
  transitioning: boolean;
};

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function rgbToHex([r, g, b]: RGB): string {
  return (
    '#' +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
  );
}

function interpolateColor(color1: RGB, color2: RGB, progress: number): RGB {
  return [
    color1[0] + (color2[0] - color1[0]) * progress,
    color1[1] + (color2[1] - color1[1]) * progress,
    color1[2] + (color2[2] - color1[2]) * progress,
  ];
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i >= 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

export function useAlbumColors(imageUrl: string, transitionDuration = 1000) {
  const defaultColors: RGB[] = [
    [26, 26, 26], // #1a1a1a
    [0, 0, 0], // #000000
    [51, 51, 51], // #333333
    [26, 26, 26], // #1a1a1a
    [0, 0, 0], // #000000
  ];

  const [colorState, setColorState] = useState<ColorState>({
    current: defaultColors,
    target: defaultColors,
    transitioning: false,
  });

  const animationFrame = useRef<number>();
  const startTime = useRef<number>();

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = 'https://corsproxy.io/?' + imageUrl;

    const loadColors = async () => {
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const colorThief = new ColorThief();i
        const palette = await colorThief.getPalette(img, 5);
        const newColors: RGB[] = palette.map((color) => hexToRgb(color));

        shuffleArray(newColors)

        // Start transition to new colors
        setColorState((prev) => ({
          ...prev,
          target: newColors,
          transitioning: true,
        }));
      } catch (error) {
        console.error('Failed to extract colors:', error);
      }
    };

    loadColors();
  }, [imageUrl]);

  // Handle the animation
  useEffect(() => {
    if (!colorState.transitioning) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const linearProgress = Math.min(
        1,
        (timestamp - startTime.current) / transitionDuration
      );

      const progress = easeInOut(linearProgress);

      const interpolatedColors = colorState.current.map((currentColor, i) =>
        interpolateColor(currentColor, colorState.target[i], progress)
      );

      console.log('interpolatedCOlors', interpolatedColors);

      setColorState((prev) => ({
        ...prev,
        current: interpolatedColors,
        transitioning: progress < 1,
      }));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        startTime.current = undefined;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [colorState.transitioning, transitionDuration]);

  // Convert current colors to hex for consuming components
  const colors = colorState.current.map(rgbToHex);

  //console.log(colorState.current, colors)

  return { colors, isTransitioning: colorState.transitioning };
}

// Example usage:
/*
function AlbumArtwork({ imageUrl }) {
  const { colors, isTransitioning } = useAlbumColors(imageUrl, 1000); // 1 second transition

  return (
    <div 
      style={{
        background: `linear-gradient(to bottom, ${colors.join(', ')})`,
        transition: isTransitioning ? 'none' : 'background 0.3s ease'
      }}
    >
      <img src={imageUrl} alt="Album artwork" />
    </div>
  );
}
*/
