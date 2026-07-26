module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('user', 'scholar', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
      preferred_language: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'en' },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    }
  );

  user.associate = (models) => {
    user.hasMany(models.chat_session, { foreignKey: 'user_id', sourceKey: 'public_id' });
    user.hasMany(models.scholar_application, { foreignKey: 'user_id', sourceKey: 'public_id' });
    user.hasMany(models.question, { foreignKey: 'author_id', sourceKey: 'public_id' });
    user.hasMany(models.reply, { foreignKey: 'author_id', sourceKey: 'public_id' });
    user.hasMany(models.blog, { foreignKey: 'author_id', sourceKey: 'public_id' });
  };

  return user;
};
