module.exports = (sequelize, DataTypes) => {
  const question = sequelize.define(
    'question',
    {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      channel_id: { type: DataTypes.UUID, allowNull: false },
      author_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    }
  );

  question.associate = (models) => {
    question.belongsTo(models.channel, { foreignKey: 'channel_id', targetKey: 'public_id' });
    question.belongsTo(models.user, { foreignKey: 'author_id', targetKey: 'public_id', as: 'author' });
    question.hasMany(models.reply, { foreignKey: 'question_id', sourceKey: 'public_id' });
  };

  return question;
};
