module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_session', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false, defaultValue: 'New Chat' },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('chat_session');
  },
};
