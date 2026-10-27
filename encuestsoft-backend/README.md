# ENCUESTSOFT — Backend

Backend en **Node.js + Express + Sequelize (MySQL)** para ENCUESTSOFT: generador
multipropósito de formularios/encuestas con constructor **drag & drop**, modo
SaaS multiusuario, reportes estadísticos (generales y por campo), campos
condicionales, webhooks, notificaciones por correo, integraciones de email
marketing (Mailchimp / Acelle Email), reCAPTCHA, formularios protegidos por
contraseña, generación de PDF de respuestas y exportación CSV/Excel.

Diseñado para servir a un **frontend en React** que consuma la API mediante
**hooks** (ver `docs/react-hooks-example/`).

## 1. Requisitos

- Node.js >= 18
- MySQL >= 8.0

## 2. Instalación

```bash
cd encuestsoft-backend
cp .env.example .env      # y edita tus credenciales de MySQL, SMTP, reCAPTCHA, etc.
npm install
npm run db:init           # crea la base de datos, tablas y planes SaaS (schema.sql + seed.sql)
npm run dev                # levanta el servidor con nodemon en http://localhost:4000
```

En producción: `npm start` (usa `schema.sql`/`db:init` en vez de `sequelize.sync`,
que solo se ejecuta automáticamente cuando `NODE_ENV !== 'production'`).

## 3. Estructura del proyecto

```
encuestsoft-backend/
├── app.js                    # configuración de Express (seguridad, CORS, rutas)
├── server.js                 # punto de entrada (conexión DB + arranque HTTP)
├── config/
│   ├── database.js           # conexión Sequelize a MySQL
│   └── multer.js             # almacenamiento de archivos subidos
├── database/
│   ├── schema.sql            # DDL completo de MySQL
│   ├── seed.sql               # planes SaaS iniciales
│   └── init-db.js            # script `npm run db:init`
├── models/                   # modelos Sequelize (uno por tabla) + index.js (asociaciones)
├── middleware/                # auth, validate, rateLimiter, recaptcha, loadPublicForm, errorHandler
├── controllers/               # lógica HTTP por recurso
├── routes/                    # definición de endpoints REST
├── services/                  # lógica de negocio reutilizable (envíos, PDF, webhooks, reportes...)
├── utils/                      # helpers (respuestas API, validación de campos, accesibilidad, lógica condicional)
├── uploads/                    # archivos subidos por los usuarios (servidos en /uploads)
└── docs/
    ├── API.md                  # referencia de endpoints
    └── react-hooks-example/    # hooks de ejemplo (useFormSchema, useFormSubmit, usePrefillFromUrl)
```

## 4. Modelo de datos (resumen)

- **plans / organizations / users** → modo **SaaS multiusuario** con planes y límites (formularios, envíos/mes, almacenamiento, usuarios).
- **forms** → configuración completa del formulario: estado (`draft`/`published`), estilos (`style_json`), mensajes de éxito/error, redirección, reCAPTCHA, contraseña, auto-respuesta, notificaciones, ID de referencia, PDF de envío, ventana de fechas, límite de envíos.
- **form_fields** → campos del **builder drag & drop** (texto, correo, contraseña, número, teléfono, fecha, selects, archivo/imagen, calificación, reCAPTCHA, encabezados, etc.), con validaciones, lógica condicional y atributos de accesibilidad.
- **form_submissions** → cada envío, con JSON crudo de respuestas + metadatos (IP, user-agent, score de reCAPTCHA, ruta del PDF).
- **submission_answers** → tabla EAV normalizada por campo, usada para los **reportes estadísticos** (evita recorrer JSON en cada consulta).
- **submission_files** → archivos adjuntos por envío.
- **webhooks / webhook_logs**, **email_integrations** (Mailchimp/Acelle), **audit_logs**.

## 5. Endpoints principales

Ver `docs/API.md` para el listado completo. Resumen:

| Módulo | Base | Descripción |
|---|---|---|
| Auth | `/api/v1/auth` | Registro (crea organización + usuario owner), login, refresh, perfil, preferencias de accesibilidad |
| Formularios | `/api/v1/forms` | CRUD, publicar/pausar (modo borrador), contraseña, duplicar, guardar campos (drag & drop), código de integración (embed) |
| Público | `/api/v1/public/forms/:uuid` | Obtener schema del formulario y enviarlo (usado por el frontend público) |
| Envíos | `/api/v1/forms/:formId/submissions` | Listar, ver, eliminar, exportar (CSV/XLSX), descargar PDF |
| Reportes | `/api/v1/forms/:formId/reports` | Reporte general y por campo |
| Webhooks | `/api/v1/forms/:formId/webhooks` | CRUD de webhooks |
| Integraciones | `/api/v1/forms/:formId/integrations` | CRUD de integraciones Mailchimp/Acelle |

## 6. Usabilidad y accesibilidad (WCAG 2.1 AA)

- Cada campo público incluye un bloque `a11y` listo para usarse como props de React (`aria-label`, `aria-required`, `aria-describedby`, `autoComplete`, etc.) — ver `utils/accessibility.js`.
- Verificación automática de contraste de color mínimo 4.5:1 al guardar `style_json` (devuelve advertencias, no bloquea el guardado).
- Sugerencia automática de `autocomplete` HTML según el tipo de campo.
- Preferencias de accesibilidad persistentes por usuario (alto contraste, escala de fuente, movimiento reducido) para que el frontend las aplique globalmente.

## 7. Seguridad

- JWT (access + refresh token), contraseñas con bcrypt, rate limiting general y específico para envíos públicos.
- Sanitización de respuestas de texto libre (anti-XSS) antes de guardarlas.
- Helmet, CORS configurable por variable de entorno, verificación de reCAPTCHA v2/v3.
- Formularios protegibles con contraseña (hash independiente del de usuarios).

## 8. Variables de entorno

Ver `.env.example` — incluye MySQL, JWT, SMTP, Google reCAPTCHA, Mailchimp, Acelle Email, webhooks y parámetros SaaS.
