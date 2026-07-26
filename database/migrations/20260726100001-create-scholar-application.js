module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('scholar_application', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      full_name: { type: Sequelize.STRING, allowNull: false },
      qualifications: { type: Sequelize.TEXT, allowNull: false },
      ijazah: { type: Sequelize.STRING, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'SET NULL',
      },
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('scholar_application');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_scholar_application_status";');
  },
};
