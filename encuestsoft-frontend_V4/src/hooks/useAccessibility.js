import { useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext.jsx';

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility debe usarse dentro de <AccessibilityProvider>.');
  return ctx;
}
