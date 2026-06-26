/**
 * useCountUp.js
 * Animates a number from 0 to `end` over `duration` ms.
 * Triggers when component enters viewport.
 */
import { useState, useEffect, useRef } from 'react';

export function useCountUp(end, duration = 1500, start = 0) {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  // IntersectionObserver to trigger on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Count-up animation
  useEffect(() => {
    if (!hasStarted) return;

    const range = end - start;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + range * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [hasStarted, end, start, duration]);

  return { count, ref };
}
