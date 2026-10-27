/**
 * Inicializa la base de datos: crea el esquema (schema.sql) y siembra los
 * planes SaaS por defecto (seed.sql). Ejecutar con: npm run db:init
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

  console.log('⏳ Creando esquema de base de datos...');
  await connection.query(schema);
  console.log('✅ Esquema creado.');

  console.log('⏳ Insertando datos iniciales (planes SaaS)...');
  await connection.query(seed);
  console.log('✅ Datos iniciales listos.');

  await connection.end();
  console.log('🎉 Base de datos ENCUESTSOFT inicializada correctamente.');
}

run().catch((err) => {
  console.error('❌ Error inicializando la base de datos:', err.message);
  process.exit(1);
});
