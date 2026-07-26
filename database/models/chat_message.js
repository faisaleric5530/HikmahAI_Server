module.exports = (sequelize, DataTypes) => {
  const chat_message = sequelize.define(
    'chat_message',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      session_id: { type: DataTypes.UUID, allowNull: false },
      role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      detected_lang: { type: DataTypes.STRING(5), allowNull: true },
      sources: { type: DataTypes.JSONB, allowNull: true },
      provider: { type: DataTypes.STRING(20), allowNull: true },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: false,
    }
  );

  chat_message.associate = (models) => {
    chat_message.belongsTo(models.chat_session, { foreignKey: 'session_id', targetKey: 'public_id' });
  };

  return chat_message;
};
