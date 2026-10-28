/**
 * Contexto de accesibilidad: comparte una única instancia del hook `useAccessibility`
 * entre el widget flotante y la página de Configuración.
 */
import React, { createContext, useContext } from 'react';
import useAccessibility from '../hooks/useAccessibility.js';

const A11yContext = createContext(null);

export function A11yProvider({ children }) {
  const value = useAccessibility();
  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useA11y = () => useContext(A11yContext);
