const schema = process.env.DB_SCHEMA || 'hikmah';
const table = { tableName: 'user', schema };

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'hash_identity', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(table, 'hash_identity');
  },
};
