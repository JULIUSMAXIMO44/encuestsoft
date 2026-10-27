import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite para el proyecto EncuestSoft (React JS).
// Se usa el plugin oficial de React (soporte JSX + Fast Refresh).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
