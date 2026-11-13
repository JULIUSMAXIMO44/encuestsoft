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
  dyslexia: false,
  reader: false,
  colorblind: false,
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
    root.dataset.dyslexia = settings.dyslexia ? 'on' : 'off';
    root.dataset.colorblind = settings.colorblind ? 'on' : 'off';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* sin almacenamiento: las preferencias duran solo la sesión de la página */
    }
  }, [settings]);

  // Lector: lee en voz alta el elemento que recibe el foco o el puntero.
  // Usa la síntesis de voz del navegador, sin servicios externos.
  useEffect(() => {
    if (!settings.reader || !('speechSynthesis' in window)) return undefined;
    const synth = window.speechSynthesis;
    let timer;
    const textOf = (el) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const speak = (target) => {
      const el = target?.closest?.('h1,h2,h3,p,li,a,button,label,th,td,summary,[role="tab"]');
      const text = el && textOf(el);
      if (!text) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'es-ES';
        synth.speak(u);
      }, 250);
    };
    const onFocus = (e) => speak(e.target);
    const onOver = (e) => speak(e.target);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('mouseover', onOver);
    return () => {
      clearTimeout(timer);
      synth.cancel();
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('mouseover', onOver);
    };
  }, [settings.reader]);

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings({ ...DEFAULTS }), []);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);
  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
