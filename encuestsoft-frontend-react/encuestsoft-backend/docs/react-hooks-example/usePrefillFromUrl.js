import { useMemo } from 'react';

/**
 * Hook de ejemplo: obtiene valores iniciales para el formulario a partir de
 * los parámetros de la URL actual (Pre-fill form from URL parameter),
 * solo si el formulario lo permite (form.allow_prefill_from_url).
 */
export function usePrefillFromUrl(allowPrefill, fieldKeys = []) {
  return useMemo(() => {
    if (!allowPrefill) return {};
    const params = new URLSearchParams(window.location.search);
    const prefilled = {};
    fieldKeys.forEach((key) => {
      if (params.has(key)) prefilled[key] = params.get(key);
    });
    return prefilled;
  }, [allowPrefill, fieldKeys]);
}
