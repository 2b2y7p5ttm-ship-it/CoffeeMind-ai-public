import { useEffect, useRef, useState } from 'react';

export function useScrollDirection(threshold = 12) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const nextY = Math.max(0, window.scrollY);
      const delta = nextY - lastY.current;

      if (Math.abs(delta) >= threshold) {
        setHidden(nextY > 120 && delta > 0);
        lastY.current = nextY;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return hidden;
}
