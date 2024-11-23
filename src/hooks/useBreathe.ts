import { useState, useEffect } from 'react';

interface UseBreatheOptions {
  initialValue: number;
  minValue: number;
  maxValue: number;
  interval: number;
}

const useBreathe = ({
  initialValue,
  minValue,
  maxValue,
  interval,
}: UseBreatheOptions): number => {
  const [value, setValue] = useState(initialValue);
  const [direction, setDirection] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const timer = setInterval(() => {
      setValue((prevValue) => {
        const change = Math.random(); // Random change between 0 and 2
        let newValue: number;

        if (direction === 'in') {
          newValue = prevValue + change / 20;
          if (newValue >= maxValue) {
            setDirection('out');
            return maxValue;
          }
        } else {
          newValue = prevValue - change / 20;
          if (newValue <= minValue) {
            setDirection('in');
            return minValue;
          }
        }

        return Number(newValue.toFixed(2)); // Round to 2 decimal places
      });
    }, interval);

    return () => clearInterval(timer);
  }, [direction, maxValue, minValue, interval]);

  return value;
};

export default useBreathe;
