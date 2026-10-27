
const { sequelize, User, Organization } = require('./models');

const usuarios = [
  {
    full_name: 'Administrador EncuestSoft',
    email: 'admin@encuestsoft.com',
    password_hash: 'PruebaAdmin2026!',
    role: 'admin',
  },
  {
    full_name: 'Carlos Rodriguez',
    email: 'carlos@encuestsoft.com',
    password_hash: 'PruebaCarlos2026!',
    role: 'editor',
  },
  {
    full_name: 'Maria Gonzalez',
    email: 'maria@encuestsoft.com',
    password_hash: 'PruebaMaria2026!',
    role: 'editor',
  },
  {
    full_name: 'Andres Martinez',
    email: 'andres@encuestsoft.com',
    password_hash: 'PruebaAndres2026!',
    role: 'viewer',
  },
  {
    full_name: 'Laura Fernandez',
    email: 'laura@encuestsoft.com',
    password_hash: 'PruebaLaura2026!',
    role: 'viewer',
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida.');

    const organizationId = Number(process.env.SEED_ORGANIZATION_ID);

    if (!Number.isInteger(organizationId) || organizationId <= 0) {
      throw new Error(
        'Configura SEED_ORGANIZATION_ID con el ID de una organización existente.'
      );
    }

    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      throw new Error(
        `No existe la organización con ID ${organizationId}.`
      );
    }

    for (const datos of usuarios) {
      const existente = await User.findOne({
        where: { email: datos.email },
      });

      if (existente) {
        console.log(`Ya existe: ${datos.email}. Se omite.`);
        continue;
      }

      await User.create({
        ...datos,
        organization_id: organization.id,
        locale: 'es',
        is_active: true,
      });

      console.log(`Usuario creado: ${datos.email}`);
    }

    console.log('Proceso de precarga finalizado.');
  } catch (error) {
    console.error('Error durante la precarga:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();