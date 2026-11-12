require('dotenv').config();

const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
const logger = require('./utils/logger');

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  await testConnection();

  // En desarrollo se sincronizan los modelos. En producción, las tablas
  // se crean mediante npm run db:init antes de iniciar el servicio.
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: false });
    logger.info('Modelos sincronizados (modo desarrollo).');
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(
      `ENCUESTSOFT backend escuchando en el puerto ${PORT} (${process.env.NODE_ENV || 'development'}).`
    );
  });

  const shutdown = async (signal) => {
    logger.info(`Señal ${signal} recibida. Cerrando servidor...`);
    server.close(async () => {
      try {
        await sequelize.close();
        process.exit(0);
      } catch (error) {
        logger.error(`Error cerrando la conexión: ${error.message}`);
        process.exit(1);
      }
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  logger.error(`No se pudo iniciar ENCUESTSOFT: ${error.message}`);
  process.exit(1);
});
