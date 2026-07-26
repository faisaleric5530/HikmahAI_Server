module.exports = (sequelize, DataTypes) => {
  const chat_session = sequelize.define(
    'chat_session',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      user_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false, defaultValue: 'New Chat' },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    }
  );

  chat_session.associate = (models) => {
    chat_session.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'public_id' });
    chat_session.hasMany(models.chat_message, { foreignKey: 'session_id', sourceKey: 'public_id' });
  };

  return chat_session;
};
