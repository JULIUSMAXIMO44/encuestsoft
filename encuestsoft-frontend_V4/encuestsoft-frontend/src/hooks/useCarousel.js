import { useCallback, useEffect, useState } from 'react';
import { useAccessibility } from './useAccessibility.js';

// Carrusel accesible: el avance automático se pausa con el foco, el puntero o el
// botón de pausa, y no corre si la persona eligió reducir el movimiento.
export function useCarousel(total, intervalMs = 7000) {
  const { settings } = useAccessibility();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const goTo = useCallback((i) => setIndex(i), []);

  const playing = !userPaused && !hoverPaused && !settings.reduceMotion;

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [playing, next, intervalMs]);

  return {
    index,
    next,
    prev,
    goTo,
    playing,
    togglePlay: () => setUserPaused((p) => !p),
    pauseHandlers: {
      onMouseEnter: () => setHoverPaused(true),
      onMouseLeave: () => setHoverPaused(false),
      onFocus: () => setHoverPaused(true),
      onBlur: () => setHoverPaused(false),
    },
  };
}
