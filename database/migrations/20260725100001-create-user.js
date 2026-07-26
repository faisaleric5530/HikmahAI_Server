module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('user', 'scholar', 'admin'), allowNull: false, defaultValue: 'user' },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      preferred_language: { type: Sequelize.STRING(5), allowNull: false, defaultValue: 'en' },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_role";');
  },
};
