const schema = process.env.DB_SCHEMA || 'hikmah';
const table = { tableName: 'scholar_application', schema };

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'reviewer_note', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(table, 'reviewer_note');
  },
};
