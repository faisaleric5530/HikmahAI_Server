const bcrypt = require('bcrypt');
const adminUser = require('../seed/admin-user');

const SALT_ROUNDS = 10;

module.exports = {
  up: async (queryInterface) => {
    const emails = adminUser.map((u) => u.email);

    const existing = await queryInterface.sequelize.query(
      'SELECT email FROM "user" WHERE email IN (:emails)',
      { replacements: { emails }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingEmails = new Set(existing.map((row) => row.email));

    const rows = await Promise.all(
      adminUser
        .filter((u) => !existingEmails.has(u.email))
        .map(async ({ password, ...user }) => {
          const now = new Date();
          return {
            ...user,
            password_hash: await bcrypt.hash(password, SALT_ROUNDS),
            created_at: now,
            updated_at: now,
          };
        })
    );

    if (!rows.length) return;

    await queryInterface.bulkInsert('user', rows);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user', {
      email: { [Sequelize.Op.in]: adminUser.map((u) => u.email) },
    });
  },
};
