const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

async function start() {
  await testConnection();

  // En desarrollo, sincroniza modelos automáticamente. En producción se
  // recomienda usar el schema.sql / migraciones versionadas (ver database/).
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: false });
    logger.info('Modelos sincronizados con la base de datos (modo desarrollo).');
  }

  app.listen(PORT, () => {
    logger.info(`🚀 ENCUESTSOFT backend escuchando en el puerto ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start().catch((err) => {
  logger.error(`No se pudo iniciar el servidor: ${err.message}`);
  process.exit(1);
});
