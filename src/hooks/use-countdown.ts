import { useEffect, useState } from 'react';

// Counts from the clock rather than from ticks, so time spent with the app in the background still counts.
export function useCountdown() {
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const secondsLeft = Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    if (secondsLeft === 0) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [secondsLeft]);

  function start(seconds: number) {
    const startedAt = Date.now();
    setNow(startedAt);
    setEndsAt(startedAt + seconds * 1000);
  }

  return { secondsLeft, start };
}
