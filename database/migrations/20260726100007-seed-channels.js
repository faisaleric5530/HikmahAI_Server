const channels = require('../seed/channels');

module.exports = {
  up: async (queryInterface) => {
    const names = channels.map((c) => c.name);

    const existing = await queryInterface.sequelize.query(
      'SELECT name FROM channel WHERE name IN (:names)',
      { replacements: { names }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingNames = new Set(existing.map((row) => row.name));

    const now = new Date();
    const rows = channels
      .filter((c) => !existingNames.has(c.name))
      .map((c) => ({ ...c, created_at: now, updated_at: now }));

    if (!rows.length) return;

    await queryInterface.bulkInsert('channel', rows);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('channel', {
      name: { [Sequelize.Op.in]: channels.map((c) => c.name) },
    });
  },
};
