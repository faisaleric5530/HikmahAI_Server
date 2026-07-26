module.exports = (sequelize, DataTypes) => {
  const blog = sequelize.define(
    'blog',
    {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      author_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      excerpt: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'published',
      },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    }
  );

  blog.associate = (models) => {
    blog.belongsTo(models.user, { foreignKey: 'author_id', targetKey: 'public_id', as: 'author' });
  };

  return blog;
};
