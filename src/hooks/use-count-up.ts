import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

const COUNT_DURATION_MS = 600;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

// Shows the first value as it is, then counts to each new one instead of jumping.
export function useCountUp(target: number) {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    const start = Date.now();
    let frame = 0;
    const step = () => {
      const progress = reduceMotion ? 1 : Math.min(1, (Date.now() - start) / COUNT_DURATION_MS);
      shownRef.current = Math.round(from + (target - from) * easeOutCubic(progress));
      setShown(shownRef.current);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  return shown;
}
