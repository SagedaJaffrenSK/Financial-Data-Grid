import { useState, useEffect, useRef } from 'react';

export function useFPS() {
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef([]);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let running = true;

    const measure = (timestamp) => {
      if (!running) return;

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      frameTimesRef.current.push(delta);

      // Keep only the last 60 frames for rolling average
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Update FPS display every 20 frames
      if (frameTimesRef.current.length % 20 === 0) {
        const avgDelta =
          frameTimesRef.current.reduce((a, b) => a + b, 0) /
          frameTimesRef.current.length;
        const currentFps = Math.round(1000 / avgDelta);
        setFps(Math.min(currentFps, 120));
      }

      rafRef.current = requestAnimationFrame(measure);
    };

    rafRef.current = requestAnimationFrame(measure);

    return () => {
      running = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return fps;
}
