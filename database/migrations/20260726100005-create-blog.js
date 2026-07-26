module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('blog', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      public_id: { type: Sequelize.UUID, unique: true, allowNull: false },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user', key: 'public_id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      excerpt: { type: Sequelize.STRING, allowNull: true },
      status: {
        type: Sequelize.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'published',
      },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('blog');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_blog_status";');
  },
};
