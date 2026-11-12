# ENCUESTSOFT Backend

Backend Node.js + Express + Sequelize para ENCUESTSOFT.

## Producción (Render + Neon PostgreSQL)

- Root Directory en Render: `encuestsoft-backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Variables de entorno:
  - `DATABASE_URL`: cadena de conexión de Neon (mantenerla privada).
  - `NODE_ENV=production`
  - `DB_LOGGING=false`
  - `CORS_ORIGINS`: URL pública del frontend en Vercel (sin barra final; varias URL separadas por comas).
  - `API_PREFIX=/api/v1` (opcional).

### Inicializar Neon (solo una vez en una base vacía)

Desde esta carpeta, con `DATABASE_URL` configurada:

```bash
npm run db:init
```

Este comando ejecuta `database/schema.postgres.sql` y `database/seed.postgres.sql` dentro de una transacción. No debe configurarse como Start Command de Render ni ejecutarse en cada arranque.

### Desarrollo local

```bash
npm install
npm run dev
```

En desarrollo, Sequelize sincroniza los modelos al iniciar. En producción, la inicialización del esquema es explícita.

## Esquema heredado MySQL

Los archivos `database/schema.sql` y `database/seed.sql` se conservan como referencia del esquema anterior. Para Neon se deben utilizar exclusivamente los archivos `*.postgres.sql`.
