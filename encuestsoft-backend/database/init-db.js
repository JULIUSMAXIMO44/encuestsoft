/**
 * Inicializa Neon/PostgreSQL: crea las tablas y carga los planes SaaS.
 * Ejecutar desde encuestsoft-backend: npm run db:init
 *
 * Requiere DATABASE_URL configurada en el entorno.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta configurar DATABASE_URL.');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    await client.query('BEGIN');

    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.postgres.sql'),
      'utf8'
    );
    const seed = fs.readFileSync(
      path.join(__dirname, 'seed.postgres.sql'),
      'utf8'
    );

    console.log('Creando esquema PostgreSQL...');
    await client.query(schema);
    console.log('Esquema PostgreSQL creado.');

    console.log('Insertando planes SaaS...');
    await client.query(seed);
    console.log('Planes SaaS listos.');

    await client.query('COMMIT');
    console.log('ENCUESTSOFT inicializado correctamente en PostgreSQL.');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      // Conserva el error original.
    }
    console.error('Error inicializando PostgreSQL:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

run().catch(() => {
  process.exit(1);
});
