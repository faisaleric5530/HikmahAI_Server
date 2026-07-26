module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('question', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      channel_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'channel', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('question');
  },
};
