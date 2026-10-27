# ENCUESTSOFT API — Referencia de endpoints

Prefijo base: `/api/v1` (configurable con `API_PREFIX`).
Autenticación: header `Authorization: Bearer <accessToken>` salvo endpoints públicos.
Todas las respuestas siguen el formato: `{ success, message, data, meta? }`.

## Autenticación (`/auth`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Crea organización + usuario owner. Body: `organization_name, full_name, email, password` |
| POST | `/auth/login` | Body: `email, password` |
| POST | `/auth/refresh` | Body: `refreshToken` |
| GET  | `/auth/me` | Perfil del usuario autenticado + organización/plan |
| PATCH| `/auth/me/accessibility` | Actualiza preferencias de accesibilidad |

## Formularios (`/forms`) — requiere autenticación
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/forms` | Lista formularios de la organización |
| POST | `/forms` | Crea formulario (modo borrador). Body: `title, description` |
| GET | `/forms/:id` | Detalle con campos, webhooks e integraciones |
| PATCH | `/forms/:id` | Actualiza configuración (estilos, mensajes, reCAPTCHA, PDF, etc.) |
| DELETE | `/forms/:id` | Elimina (soft delete) |
| POST | `/forms/:id/duplicate` | Duplica formulario y sus campos |
| PATCH | `/forms/:id/status` | Body: `{ status: 'draft'|'published'|'paused'|'archived' }` |
| PATCH | `/forms/:id/password` | Body: `{ password }` (vacío para quitar protección) |
| PUT | `/forms/:id/fields` | Guarda en bloque los campos (orden = drag & drop). Body: `{ fields: [...] }` |
| GET | `/forms/:id/embed` | Código embebible (iframe / script / enlace directo) |

## Público (`/public`) — sin autenticación
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/public/forms/:formUuid` | Schema público del formulario (para renderizar en React) |
| POST | `/public/forms/:formUuid/submit` | Envía respuestas (multipart/form-data si hay archivos) |

Headers opcionales: `x-form-password` (formularios protegidos).
Body puede incluir `recaptcha_token` si el formulario tiene reCAPTCHA activo.

## Envíos (`/forms/:formId/submissions`) — requiere autenticación
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Lista paginada (`?page=&page_size=`) |
| GET | `/export?format=csv|xlsx` | Exporta todos los envíos |
| GET | `/:id` | Detalle de un envío |
| GET | `/:id/pdf` | Descarga (o genera) el PDF de la respuesta |
| DELETE | `/:id` | Elimina un envío |

## Reportes (`/forms/:formId/reports`) — requiere autenticación
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/general?from=&to=` | Volumen de envíos, evolución diaria, estados |
| GET | `/fields` | Estadísticas por campo (distribución o promedio/min/max según tipo) |

## Webhooks (`/forms/:formId/webhooks`) — requiere autenticación
CRUD estándar. Body de creación: `{ url, method, headers_json }`.

## Integraciones (`/forms/:formId/integrations`) — requiere autenticación
CRUD estándar. Body de creación: `{ provider: 'mailchimp'|'acelle', api_key, api_url, list_or_audience_id, field_mapping_json }`.
