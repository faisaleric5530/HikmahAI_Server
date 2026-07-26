module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reply', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'question', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      body: { type: Sequelize.TEXT, allowNull: false },
      is_verified_answer: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'SET NULL',
      },
      verified_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('reply');
  },
};
