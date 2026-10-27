import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';

// Clave de almacenamiento en localStorage (misma clave que el prototipo
// original, para que cualquier preferencia guardada previamente siga siendo
// válida).
const STORAGE_KEY = 'encuestsoft_a11y';

const MIN_SCALE = 0.85;
const MAX_SCALE = 1.4;
const STEP = 0.1;

const DEFAULT_STATE = {
  scale: 1,
  contrast: false,
  dyslexia: false,
  daltonismo: false,
  reducedMotion: false,
};

/**
 * Lee el estado de accesibilidad guardado en localStorage.
 * Si no existe o está corrupto, devuelve el estado por defecto.
 */
function readStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      scale: typeof parsed.scale === 'number' ? parsed.scale : 1,
      contrast: !!parsed.contrast,
      dyslexia: !!parsed.dyslexia,
      daltonismo: !!parsed.daltonismo,
      reducedMotion: !!parsed.reducedMotion,
    };
  } catch {
    // localStorage no disponible (modo privado, permisos, etc.): se continúa
    // con los valores por defecto sin romper la aplicación.
    return DEFAULT_STATE;
  }
}

/**
 * useAccessibility
 * ------------------------------------------------------------------
 * Hook que centraliza toda la lógica de accesibilidad de EncuestSoft:
 *  - Escala de tamaño de letra (variable CSS --a11y-scale).
 *  - Alto contraste, tipografía para dislexia y paleta para daltonismo
 *    (se aplican como clases sobre <body>, igual que en el CSS original).
 *  - Lector de pantalla básico mediante la Web Speech API.
 *  - Persistencia en localStorage entre recargas y páginas.
 *
 * Devuelve el estado actual y las acciones para modificarlo, de forma
 * que el componente <AccessibilityWidget> solo se encarga de la UI.
 */
export default function useAccessibility() {
  const [state, setState] = useState(readStoredState);
  const [isReading, setIsReading] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // --- Sincronización con las preferencias guardadas en el backend (PATCH /auth/me/accessibility) ---
  const { user, patchUser } = useAuth();
  const syncedUserRef = useRef(null);

  // Al iniciar sesión, las preferencias del servidor tienen prioridad sobre las locales.
  useEffect(() => {
    if (!user || syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;
    setState((prev) => ({
      ...prev,
      scale: Number(user.a11y_font_scale) || 1,
      contrast: !!user.a11y_high_contrast,
      reducedMotion: !!user.a11y_reduced_motion,
    }));
  }, [user]);

  // Guarda los cambios en el servidor (con retardo para no saturar la API).
  useEffect(() => {
    if (!user || syncedUserRef.current !== user.id) return undefined;
    const changed =
      Number(user.a11y_font_scale) !== state.scale ||
      !!user.a11y_high_contrast !== state.contrast ||
      !!user.a11y_reduced_motion !== state.reducedMotion;
    if (!changed) return undefined;
    const timer = setTimeout(() => {
      const prefs = { a11y_font_scale: state.scale, a11y_high_contrast: state.contrast, a11y_reduced_motion: state.reducedMotion };
      authApi.updateAccessibility(prefs).then(() => patchUser(prefs)).catch(() => {
        // Sin conexión: la preferencia queda en el navegador y se reintentará en el próximo cambio.
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [state, user, patchUser]);

  // Aplica los efectos visuales cada vez que cambia el estado.
  useEffect(() => {
    document.documentElement.style.setProperty('--a11y-scale', state.scale.toFixed(2));
    document.body.classList.toggle('a11y-contrast', state.contrast);
    document.body.classList.toggle('a11y-dyslexia', state.dyslexia);
    document.body.classList.toggle('a11y-daltonismo', state.daltonismo);
    document.body.classList.toggle('a11y-reduced-motion', state.reducedMotion);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Almacenamiento no disponible: se ignora, la sesión actual sigue
      // funcionando con el estado en memoria.
    }
  }, [state]);

  const increaseFont = useCallback(() => {
    setState((prev) => ({ ...prev, scale: Math.min(MAX_SCALE, +(prev.scale + STEP).toFixed(2)) }));
    setAnnouncement('Tamaño de letra aumentado.');
  }, []);

  const decreaseFont = useCallback(() => {
    setState((prev) => ({ ...prev, scale: Math.max(MIN_SCALE, +(prev.scale - STEP).toFixed(2)) }));
    setAnnouncement('Tamaño de letra disminuido.');
  }, []);

  const toggleContrast = useCallback(() => {
    setState((prev) => {
      const next = !prev.contrast;
      setAnnouncement(next ? 'Alto contraste activado.' : 'Alto contraste desactivado.');
      return { ...prev, contrast: next };
    });
  }, []);

  const toggleDyslexia = useCallback(() => {
    setState((prev) => {
      const next = !prev.dyslexia;
      setAnnouncement(next ? 'Tipografía para dislexia activada.' : 'Tipografía para dislexia desactivada.');
      return { ...prev, dyslexia: next };
    });
  }, []);

  const toggleDaltonismo = useCallback(() => {
    setState((prev) => {
      const next = !prev.daltonismo;
      setAnnouncement(next ? 'Paleta para daltonismo activada.' : 'Paleta para daltonismo desactivada.');
      return { ...prev, daltonismo: next };
    });
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setState((prev) => {
      const next = !prev.reducedMotion;
      setAnnouncement(next ? 'Movimiento reducido activado.' : 'Movimiento reducido desactivado.');
      return { ...prev, reducedMotion: next };
    });
  }, []);

  /** Inicia o detiene la lectura en voz alta del contenido principal. */
  const toggleReader = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setAnnouncement('La lectura en voz alta no está disponible en este navegador.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setAnnouncement('Lectura detenida.');
      return;
    }

    const main = document.getElementById('main-content') || document.querySelector('main') || document.body;
    const text = main.innerText.trim();
    if (!text) {
      setAnnouncement('No hay contenido para leer en esta página.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setAnnouncement('Leyendo el contenido de la página.');
  }, []);

  const reset = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsReading(false);
    setState(DEFAULT_STATE);
    setAnnouncement('Accesibilidad restablecida.');
  }, []);

  return {
    state,
    isReading,
    announcement,
    actions: {
      increaseFont,
      decreaseFont,
      toggleContrast,
      toggleDyslexia,
      toggleDaltonismo,
      toggleReducedMotion,
      toggleReader,
      reset,
    },
  };
}
