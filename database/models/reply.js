module.exports = (sequelize, DataTypes) => {
  const reply = sequelize.define(
    'reply',
    {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      question_id: { type: DataTypes.UUID, allowNull: false },
      author_id: { type: DataTypes.UUID, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      is_verified_answer: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      verified_by: { type: DataTypes.UUID, allowNull: true },
      verified_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    }
  );

  reply.associate = (models) => {
    reply.belongsTo(models.question, { foreignKey: 'question_id', targetKey: 'public_id' });
    reply.belongsTo(models.user, { foreignKey: 'author_id', targetKey: 'public_id', as: 'author' });
    reply.belongsTo(models.user, { foreignKey: 'verified_by', targetKey: 'public_id', as: 'verifier' });
  };

  return reply;
};
