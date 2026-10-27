/**
 * Configuración de entorno. La URL de la API se define en `.env` (VITE_API_URL).
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
