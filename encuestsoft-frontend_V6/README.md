# ENCUESTSOFT — Frontend (fases 1 a 3)

React 18 + Vite + React Router. Componentes funcionales con hooks, textos en español.

## Cómo ejecutarlo
```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu backend usa otra dirección
npm run dev            # http://localhost:5173
```

## Qué incluye la fase 1
- Tema institucional (amarillo en cabecera y pie, verde en acciones).
- Inicio público: carrusel de seis diapositivas en tarjeta compacta (pausa, teclado, movimiento reducido), tres tarjetas, pie solo con la barra amarilla. **Sin enlace al panel.**
- Botón flotante de usabilidad y accesibilidad (tamaño de texto, alto contraste, fuente legible, subrayar enlaces, espaciado, reducir movimiento) y botón "?" de ayuda, montados en la raíz: están en todas las pantallas. Las preferencias se guardan en el navegador.
- Ingresar, crear cuenta y recuperar contraseña.
- Rutas protegidas: `/panel` exige sesión; al cerrar sesión se limpia todo y se redirige al inicio.
- Panel provisional (la tabla de encuestas llega en la fase 2).

## Fase 2: dashboard y cabecera
- Cabecera con sesión: selector de workspace (cambiar, configuración, auditoría, crear), Upgrade, Novedades, campana y menú de usuario (Mi suscripción, Complementos, Mi perfil, Cerrar sesión).
- Menú desplegable en la cabecera (sin menú lateral): Formularios, My PDFs (BETA) y Help & Support (contactar, guías, hoja de ruta).
- Dashboard "Crear encuestas": resumen (formularios, plantillas, envíos), pestañas Formularios, Plantillas y Compartidos, búsqueda, orden, paginación y tabla con acciones: ver en pestaña nueva, editar, respuestas, reporte, analítica, compartir, duplicar y eliminar.
- Ventana Nueva Encuesta: "Empezar desde cero" crea el formulario en el backend; IA, plantillas e importar de Google Forms muestran su pantalla marcada como próximamente.
- Los módulos de fases posteriores tienen una pantalla provisional para que ningún enlace quede roto.

## Pendiente en el backend para esta fase
- `POST /auth/logout`: invalidar el token en el servidor.
- `POST /auth/forgot-password` y restablecimiento de contraseña.
- Guardar fechas en UTC.
- El ingreso con Google, Microsoft y Apple aparece deshabilitado ("Próximamente").

Los textos de las tarjetas del inicio son de ejemplo.

Para el dashboard, el listado `GET /forms` debería devolver también `submissions_count` y `submissions_today` (hoy la tabla muestra 0 si no vienen).

## Rediseño de la fase 2 (según modelos)
- Dashboard en tabla: tarjetas de resumen con ícono de color + botón verde Nueva Encuesta, pestañas con ícono y subrayado amarillo, «Mostrar N entradas», encabezado gris oscuro (Id, Título Encuesta, Descripción, Estado, Creado el, Envíos, Acciones) y botones de acción cuadrados de color (ver, editar, compartir, duplicar, respuestas, reporte, analítica, eliminar).
- Pie de página único en todas las secciones: solo la barra amarilla.
- Panel de usabilidad y accesibilidad azul oscuro con botones blancos: Aumentar/Disminuir letra, Contraste, Dislexia, Lector (lectura en voz alta), Daltonismo, Fuente legible, Subrayar enlaces, Más espacio entre líneas y letras, Reducir movimiento, y botón circular de restablecer. Disponible en todas las pantallas.

## Fase 3: constructor, Diseño y Configuraciones (`/constructor/:id`)
- **Constructor:** paleta por categorías (Campos básicos, Selección, Archivos y firmas con subir archivo, subir imagen, firma, tomar foto y grabadora de voz, Estructura y seguridad), lienzo que **inicia en blanco**, «Agrega tu logo» y «Añadir página de bienvenida» al comienzo, y panel de propiedades según el tipo de campo (etiqueta, ayuda, obligatorio, ancho, opciones, límites, archivos, accesibilidad).
- **Arrastrar y soltar:** nativo del navegador (desde la paleta al lienzo y para reordenar) con alternativas de teclado: botón «Agregar», botones Mover arriba/abajo, Alt+↑/↓ y Supr. Se usó esto porque `@dnd-kit` no pudo instalarse en el entorno de desarrollo sin red; si se prefiere, se puede sustituir sin cambiar el modelo de datos.
- **Diseño:** esquema de color, colores de pregunta/texto/campo/error/asterisco, fondo de página y de formulario (sólido, gradiente con predefinidos, imagen, transparente), tipografía, redondeo, tamaño y posición, restablecer; aviso de contraste WCAG; se ve al instante en el lienzo.
- **Configuraciones (10 secciones):** General, Correo electrónico, Botón de envío (vista previa fija), Condiciones (mostrar, ocultar, rellenar), Vista previa del enlace, Fecha de cierre y límite, Referencia de envío, Modo Quiz, Temporizador y PDF.
- **Guardado:** botón Guardar o Ctrl+S → `PUT /forms/:id/fields` y `PATCH /forms/:id`; Publicar/Pasar a borrador usa `PATCH /forms/:id/status`; contraseña con `PATCH /forms/:id/password`. Aviso al salir con cambios sin guardar.

### Dónde se guarda lo que el backend aún no tiene como columna
- Diseño → `style_json`.
- Barra de progreso, guardar progreso, idioma, bienvenida, botón de envío, condiciones «Rellenar», vista previa del enlace, referencia (empezar en/longitud), quiz (calificaciones), temporizador, SMTP elegido → `custom_attributes_json._settings`.
- Respuestas correctas y puntos del quiz → `custom_attributes_json.quiz` de cada campo; «Tomar foto» y «Grabadora» → `custom_attributes_json.ui_kind`.
- Logo, imágenes de fondo y de vista previa se guardan como imagen incrustada (límite de tamaño) hasta que exista subida de archivos en el backend.

### Pendiente en el backend para esta fase
- Que `GET /forms/:id` y el esquema público devuelvan/usen `_settings` (progreso, temporizador, quiz, botón).
- Referencia: aplicar «empezar en» y «longitud» (hoy el `{SEQ}` tiene 5 dígitos fijos).
- Tipos de archivo de audio permitidos en `ALLOWED_FILE_TYPES`.
- Acción «Rellenar» de condiciones (solo mostrar/ocultar se evalúan hoy).
- Integrar y Publicar son pantallas provisionales (fase 4).
