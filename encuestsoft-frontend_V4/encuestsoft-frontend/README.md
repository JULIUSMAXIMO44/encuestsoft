# ENCUESTSOFT — Frontend (fase 1)

React 18 + Vite + React Router. Componentes funcionales con hooks, textos en español.

## Cómo ejecutarlo
```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu backend usa otra dirección
npm run dev            # http://localhost:5173
```

## Qué incluye la fase 1
- Tema institucional (amarillo en cabecera y pie, verde en acciones).
- Inicio público: carrusel de seis diapositivas en tarjeta compacta (pausa, teclado, movimiento reducido), tres tarjetas, pie con columnas y barra amarilla. **Sin enlace al panel.**
- Botón flotante de usabilidad y accesibilidad (tamaño de texto, alto contraste, fuente legible, subrayar enlaces, espaciado, reducir movimiento) y botón "?" de ayuda, montados en la raíz: están en todas las pantallas. Las preferencias se guardan en el navegador.
- Ingresar, crear cuenta y recuperar contraseña.
- Rutas protegidas: `/panel` exige sesión; al cerrar sesión se limpia todo y se redirige al inicio.
- Panel provisional (la tabla de encuestas llega en la fase 2).

## Pendiente en el backend para esta fase
- `POST /auth/logout`: invalidar el token en el servidor.
- `POST /auth/forgot-password` y restablecimiento de contraseña.
- Guardar fechas en UTC.
- El ingreso con Google, Microsoft y Apple aparece deshabilitado ("Próximamente").

Los textos de las tarjetas del inicio son de ejemplo.
