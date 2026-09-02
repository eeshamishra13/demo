import { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/#';
const REDUCED_MOTION = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useDecodeText(finalText: string, trigger: boolean, delayStart = 0) {
  const [display, setDisplay] = useState<string[]>(() => finalText.split('').map(() => ' '));
  const doneRef = useRef(false);

  useEffect(() => {
    if (!trigger || doneRef.current) return;
    doneRef.current = true;

    const chars = finalText.split('');
    const timers: number[] = [];

    chars.forEach((ch, i) => {
      if (ch === ' ') {
        setDisplay((prev) => {
          const next = [...prev];
          next[i] = ' ';
          return next;
        });
        return;
      }

      const ticks = REDUCED_MOTION ? 1 : 8 + Math.floor(Math.random() * 8);
      let count = 0;

      const tick = () => {
        if (count < ticks) {
          setDisplay((prev) => {
            const next = [...prev];
            next[i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            return next;
          });
          count++;
          timers.push(window.setTimeout(tick, 28));
        } else {
          setDisplay((prev) => {
            const next = [...prev];
            next[i] = ch;
            return next;
          });
        }
      };
      timers.push(window.setTimeout(tick, delayStart + i * 26));
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, [finalText, trigger, delayStart]);

  return display;
}
