import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const AccessibilityContext = createContext(null);

const STORAGE_KEY = 'encuestsoft.a11y';
export const TEXT_SCALES = [90, 100, 115, 130, 150];
export const DEFAULTS = {
  textScale: 100,
  contrast: false,
  readable: false,
  underline: false,
  spacing: false,
  reduceMotion: false,
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const systemReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return { ...DEFAULTS, reduceMotion: Boolean(systemReduce), ...(saved || {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

// Preferencias de usabilidad y accesibilidad, activas en toda la plataforma.
export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.textScale}%`;
    root.dataset.contrast = settings.contrast ? 'high' : 'normal';
    root.dataset.readable = settings.readable ? 'on' : 'off';
    root.dataset.underline = settings.underline ? 'on' : 'off';
    root.dataset.spacing = settings.spacing ? 'on' : 'off';
    root.dataset.motion = settings.reduceMotion ? 'reduce' : 'normal';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* sin almacenamiento: las preferencias duran solo la sesión de la página */
    }
  }, [settings]);

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings({ ...DEFAULTS }), []);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);
  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
