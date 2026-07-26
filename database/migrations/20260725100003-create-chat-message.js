module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_message', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'chat_session', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      role: { type: Sequelize.ENUM('user', 'assistant'), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      detected_lang: { type: Sequelize.STRING(5), allowNull: true },
      sources: { type: Sequelize.JSONB, allowNull: true },
      provider: { type: Sequelize.STRING(20), allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('chat_message');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_chat_message_role";');
  },
};
