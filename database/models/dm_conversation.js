'use strict';

module.exports = (sequelize, DataTypes) => {
  const DmConversation = sequelize.define(
    'dm_conversation',
    {
      public_id:  { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false },
      user_id:    { type: DataTypes.UUID, allowNull: false },
      scholar_id: { type: DataTypes.UUID, allowNull: false },
    },
    { underscored: true }
  );

  DmConversation.associate = (models) => {
    DmConversation.belongsTo(models.user, { as: 'user',    foreignKey: 'user_id',    targetKey: 'public_id' });
    DmConversation.belongsTo(models.user, { as: 'scholar', foreignKey: 'scholar_id', targetKey: 'public_id' });
    DmConversation.hasMany(models.dm_message, { foreignKey: 'conversation_id', sourceKey: 'public_id' });
  };

  return DmConversation;
};
