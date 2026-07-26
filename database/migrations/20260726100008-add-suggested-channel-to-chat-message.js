const SCHEMA = process.env.DB_SCHEMA || 'hikmah';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: 'chat_message', schema: SCHEMA },
      'suggested_channel',
      { type: Sequelize.JSONB, allowNull: true }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn({ tableName: 'chat_message', schema: SCHEMA }, 'suggested_channel');
  },
};
