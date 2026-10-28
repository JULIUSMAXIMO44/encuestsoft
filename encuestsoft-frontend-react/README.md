# EncuestSoft — Frontend React (conectado al backend)

Frontend de **EncuestSoft** (Universidad de Cartagena) construido sobre el diseño de interfaz
aprobado (AA4-EV03: Bootstrap 5 + paleta dorada/verde) y conectado a la API
`encuestsoft-backend` (Node/Express + MySQL).

## Tecnologías
React 18 · React Router 6 · Vite · Bootstrap 5.3 / Bootstrap Icons · ESLint (estándares de codificación)

## Puesta en marcha
```bash
# 1) Backend (otra terminal): MySQL activo, luego
cd encuestsoft-backend && npm install && npm run db:init && npm run dev     # http://localhost:4000

# 2) Frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api/v1
npm install
npm run dev                 # http://localhost:5173
npm run lint && npm run build
```
Cree su cuenta desde **Ingresar → Crear una** (o `POST /auth/register`).

## Pantallas y endpoints
| Ruta | Descripción | API |
|---|---|---|
| `/` | Landing pública (diseño original) | — |
| `/login` | Ingreso, registro, recuperación | `POST /auth/login`, `/auth/register` |
| `/dashboard` | Lista, búsqueda, paginación, crear, duplicar, eliminar, compartir | `GET/POST/DELETE /forms`, `POST /forms/:id/duplicate` |
| `/formularios/:id/editar` | **Constructor** drag & drop, configuración y vista previa | `GET /forms/:id`, `PUT /forms/:id/fields`, `PATCH /forms/:id` |
| `/formularios/:id/respuestas` | Resumen, reportes por pregunta, respuestas, exportar CSV/XLSX, PDF | `/reports/*`, `/submissions/*` |
| `/f/:uuid` | **Formulario público** (pasos, condicionales, archivos, contraseña, reCAPTCHA, pre-llenado por URL) | `GET/POST /public/forms/:uuid` |
| `/perfil`, `/configuracion` | Datos de cuenta y preferencias de accesibilidad (guardadas en el servidor) | `GET /auth/me`, `PATCH /auth/me/accessibility` |

Compartir: publicar/pausar, enlace directo, código iframe y contraseña (`PATCH /forms/:id/status|password`, `GET /forms/:id/embed`).

## Usabilidad y accesibilidad aplicadas
- **WCAG 2.1 AA**: etiquetas visibles asociadas a cada control, `fieldset/legend` en grupos, `aria-invalid`/`aria-describedby`,
  resumen de errores enfocable (`role="alert"`) con enlaces a cada campo, `aria-live` en toasts y cambios del constructor,
  enlace «Saltar al contenido», foco gestionado al cambiar de ruta, foco visible, tabs con roles ARIA, `<caption>` en tablas.
- **Alternativa a arrastrar y soltar**: botones Agregar / Subir / Bajar en el constructor (teclado y táctil).
- **No depender del color**: estados con texto, gráficos con valores y porcentajes visibles (`BarList`).
- **Preferencias**: tamaño de letra, alto contraste, dislexia, daltonismo, movimiento reducido (widget + `/configuracion`),
  sincronizadas con la cuenta del usuario y respetando `prefers-reduced-motion`.
- **Usabilidad**: estados de carga/vacío/error con «Reintentar», confirmaciones con modal (no `window.confirm`),
  validación en línea con mensajes que explican cómo corregir, `autocomplete`, atajo `Ctrl+S`, aviso de cambios sin guardar,
  comprobador de contraste de colores del formulario, mensajes de confirmación con número de referencia.
- Refresh automático del token JWT (`/auth/refresh`) y cierre de sesión si expira.

## Estructura
```
src/
  config/      variables de entorno
  services/    http.js (cliente, tokens, errores) · api.js (auth, forms, public, submissions, reports)
  context/     Auth · Ui (toast + confirmación) · A11y
  components/  FormRenderer, ShareModal, builder/*, modales y navegación del diseño
  pages/       Home, Login, Dashboard, FormBuilder, Responses, PublicForm, Perfil, Configuracion
  utils/       tipos de campo, lógica condicional, validadores, formato
```

## Pendientes del backend / limitaciones
- **Recuperar contraseña**: el backend no tiene endpoint; el modal valida el correo y muestra el mensaje del diseño, sin enviar nada.
- **Plantillas y formularios compartidos**: sin endpoints; se ofrece «Duplicar» como alternativa.
- Inicio de sesión social (Google/Microsoft/Apple): deshabilitado (sin soporte en el backend).
- Las columnas de la tabla de respuestas muestran las 3 primeras preguntas; el detalle y la exportación incluyen todas.
- Los tokens JWT se guardan en `localStorage`; en producción considere cookies `HttpOnly`.
- Para incrustar por `<script>` el backend referencia un `embed.js` que no existe; el frontend ofrece iframe y enlace directo.

## Versionamiento
Rama `feature/integracion-backend` sobre el historial del diseño (`main`). Commits con prefijos `feat:`, `fix:`, `docs:`, `chore:`.
