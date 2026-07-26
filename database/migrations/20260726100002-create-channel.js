module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('channel', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      color_variant: {
        type: Sequelize.ENUM('green', 'blue', 'amber', 'purple', 'orange', 'teal'),
        allowNull: false,
        defaultValue: 'green',
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'SET NULL',
      },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('channel');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_channel_color_variant";');
  },
};
